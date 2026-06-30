import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function GET(
  req: NextRequest,
  { params }: { params: { platform: string } },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(new URL('/sign-in', req.url))

  const { platform } = params

  // ── LinkedIn ────────────────────────────────────────────────────────────
  if (platform === 'linkedin') {
    const clientId = process.env.LINKEDIN_CLIENT_ID
    if (!clientId) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=linkedin_not_configured', req.url),
      )
    }

    const redirectUri = `${appUrl()}/api/social/callback/linkedin`
    const state = Buffer.from(JSON.stringify({ userId, nonce: crypto.randomUUID() })).toString('base64url')

    const url = new URL('https://www.linkedin.com/oauth/v2/authorization')
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', clientId)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('scope', 'openid profile email w_member_social')
    url.searchParams.set('state', state)

    const response = NextResponse.redirect(url)
    response.cookies.set('oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/',
    })
    return response
  }

  // ── Mastodon ─────────────────────────────────────────────────────────────
  if (platform === 'mastodon') {
    const instanceUrl = req.nextUrl.searchParams.get('instanceUrl')
    if (!instanceUrl) {
      return NextResponse.json({ error: 'instanceUrl is required' }, { status: 400 })
    }

    const redirectUri = `${appUrl()}/api/social/callback/mastodon`

    // Dynamically register this app with the Mastodon instance
    const appRes = await fetch(`https://${instanceUrl}/api/v1/apps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'Contentify',
        redirect_uris: redirectUri,
        scopes: 'read:accounts write:statuses',
        website: appUrl(),
      }),
    }).catch(() => null)

    if (!appRes?.ok) {
      return NextResponse.redirect(
        new URL('/dashboard/connections?error=mastodon_registration_failed', req.url),
      )
    }

    const app = await appRes.json()
    const state = Buffer.from(JSON.stringify({ userId, instanceUrl })).toString('base64url')

    const oauthUrl = new URL(`https://${instanceUrl}/oauth/authorize`)
    oauthUrl.searchParams.set('response_type', 'code')
    oauthUrl.searchParams.set('client_id', app.client_id)
    oauthUrl.searchParams.set('redirect_uri', redirectUri)
    oauthUrl.searchParams.set('scope', 'read:accounts write:statuses')
    oauthUrl.searchParams.set('state', state)

    const response = NextResponse.redirect(oauthUrl)
    response.cookies.set('oauth_state', state, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' })
    response.cookies.set('mastodon_client_id', app.client_id, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' })
    response.cookies.set('mastodon_client_secret', app.client_secret, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 600, path: '/' })
    return response
  }

  return NextResponse.json({ error: `Unsupported platform: ${platform}` }, { status: 400 })
}
