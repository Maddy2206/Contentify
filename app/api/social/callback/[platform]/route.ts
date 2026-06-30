import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db'
import { socialAccounts } from '@/utils/schema'
import { encrypt } from '@/utils/encryption'

const appUrl = () => process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function redirectError(path: string) {
  return NextResponse.redirect(`${appUrl()}/dashboard/connections?error=${path}`)
}
function redirectSuccess(platform: string) {
  return NextResponse.redirect(`${appUrl()}/dashboard/connections?connected=${platform}`)
}

export async function GET(
  req: NextRequest,
  { params }: { params: { platform: string } },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.redirect(`${appUrl()}/sign-in`)

  const { platform } = params
  const code        = req.nextUrl.searchParams.get('code')
  const state       = req.nextUrl.searchParams.get('state')
  const storedState = req.cookies.get('oauth_state')?.value

  if (!code) return redirectError('missing_code')
  if (!state || state !== storedState) return redirectError('invalid_state')

  // ── LinkedIn ──────────────────────────────────────────────────────────────
  if (platform === 'linkedin') {
    const clientId     = process.env.LINKEDIN_CLIENT_ID
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
    if (!clientId || !clientSecret) return redirectError('linkedin_not_configured')

    const redirectUri = `${appUrl()}/api/social/callback/linkedin`

    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        code,
        redirect_uri:  redirectUri,
        client_id:     clientId,
        client_secret: clientSecret,
      }),
    })
    if (!tokenRes.ok) return redirectError('token_exchange_failed')

    const tokens = await tokenRes.json()

    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileRes.ok) return redirectError('profile_fetch_failed')

    const profile = await profileRes.json()

    await db
      .insert(socialAccounts)
      .values({
        userId,
        platform:          'linkedin',
        platformAccountId: profile.sub,
        handle:            profile.name ?? profile.email ?? 'LinkedIn User',
        accessTokenEnc:    encrypt(tokens.access_token),
        isActive:          true,
      })
      .onConflictDoUpdate({
        target: [socialAccounts.userId, socialAccounts.platform, socialAccounts.platformAccountId],
        set: {
          handle:         profile.name ?? profile.email ?? 'LinkedIn User',
          accessTokenEnc: encrypt(tokens.access_token),
          isActive:       true,
          updatedAt:      new Date(),
        },
      })

    const res = redirectSuccess('linkedin')
    res.cookies.delete('oauth_state')
    return res
  }

  // ── Mastodon ──────────────────────────────────────────────────────────────
  if (platform === 'mastodon') {
    let stateData: { userId: string; instanceUrl: string }
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64url').toString())
    } catch {
      return redirectError('invalid_state_format')
    }

    const { instanceUrl } = stateData
    const clientId     = req.cookies.get('mastodon_client_id')?.value
    const clientSecret = req.cookies.get('mastodon_client_secret')?.value

    if (!instanceUrl || !clientId || !clientSecret) return redirectError('missing_mastodon_data')

    const redirectUri = `${appUrl()}/api/social/callback/mastodon`

    const tokenRes = await fetch(`https://${instanceUrl}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    'authorization_code',
        code,
        scope:         'read:accounts write:statuses',
      }),
    })
    if (!tokenRes.ok) return redirectError('token_exchange_failed')

    const tokens = await tokenRes.json()

    const profileRes = await fetch(`https://${instanceUrl}/api/v1/accounts/verify_credentials`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })
    if (!profileRes.ok) return redirectError('profile_fetch_failed')

    const profile = await profileRes.json()

    await db
      .insert(socialAccounts)
      .values({
        userId,
        platform:          'mastodon',
        platformAccountId: profile.id,
        handle:            `@${profile.acct}@${instanceUrl}`,
        accessTokenEnc:    encrypt(tokens.access_token),
        instanceUrl,
        isActive:          true,
      })
      .onConflictDoUpdate({
        target: [socialAccounts.userId, socialAccounts.platform, socialAccounts.platformAccountId],
        set: {
          handle:         `@${profile.acct}@${instanceUrl}`,
          accessTokenEnc: encrypt(tokens.access_token),
          instanceUrl,
          isActive:       true,
          updatedAt:      new Date(),
        },
      })

    const res = redirectSuccess('mastodon')
    res.cookies.delete('oauth_state')
    res.cookies.delete('mastodon_client_id')
    res.cookies.delete('mastodon_client_secret')
    return res
  }

  return redirectError('unsupported_platform')
}
