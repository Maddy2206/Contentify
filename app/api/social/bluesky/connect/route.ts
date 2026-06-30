import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db'
import { socialAccounts } from '@/utils/schema'
import { encrypt } from '@/utils/encryption'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { handle, appPassword } = await req.json()
  if (!handle?.trim() || !appPassword?.trim()) {
    return NextResponse.json({ error: 'handle and appPassword are required' }, { status: 400 })
  }

  const cleanHandle = handle.replace(/^@/, '').trim()

  // Validate credentials against Bluesky
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: cleanHandle, password: appPassword }),
  })

  if (!sessionRes.ok) {
    const err = await sessionRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: err.message ?? 'Invalid handle or app password' },
      { status: 400 },
    )
  }

  const session = await sessionRes.json()
  const { did, handle: verifiedHandle, accessJwt, refreshJwt } = session

  const accessTokenEnc  = encrypt(accessJwt)
  const refreshTokenEnc = encrypt(refreshJwt)

  await db
    .insert(socialAccounts)
    .values({
      userId,
      platform: 'bluesky',
      platformAccountId: did,
      handle: verifiedHandle,
      accessTokenEnc,
      refreshTokenEnc,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: [socialAccounts.userId, socialAccounts.platform, socialAccounts.platformAccountId],
      set: {
        handle: verifiedHandle,
        accessTokenEnc,
        refreshTokenEnc,
        isActive: true,
        updatedAt: new Date(),
      },
    })

  return NextResponse.json({ success: true, handle: verifiedHandle })
}
