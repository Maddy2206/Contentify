import { db } from '@/utils/db'
import { socialAccounts } from '@/utils/schema'
import { decrypt, encrypt } from '@/utils/encryption'
import { eq } from 'drizzle-orm'

interface BlueskyAccount {
  id: number
  platformAccountId: string | null
  accessTokenEnc: string | null
  refreshTokenEnc: string | null
}

// Bluesky has a 300-char post limit. Long content is split into a thread.
function splitThread(text: string): string[] {
  const LIMIT = 295
  if (text.length <= LIMIT) return [text]
  const parts: string[] = []
  const words = text.split(' ')
  let current = ''
  for (const word of words) {
    if ((current + ' ' + word).trim().length > LIMIT) {
      if (current) parts.push(current.trim())
      current = word
    } else {
      current = current ? current + ' ' + word : word
    }
  }
  if (current) parts.push(current.trim())
  return parts
}

async function refreshSession(account: BlueskyAccount): Promise<string> {
  if (!account.refreshTokenEnc) throw new Error('No refresh token stored for Bluesky account')
  const refreshJwt = decrypt(account.refreshTokenEnc)
  const res = await fetch('https://bsky.social/xrpc/com.atproto.server.refreshSession', {
    method: 'POST',
    headers: { Authorization: `Bearer ${refreshJwt}` },
  })
  if (!res.ok) throw new Error('Bluesky session refresh failed — user may need to reconnect')
  const session = await res.json()
  await db.update(socialAccounts).set({
    accessTokenEnc:  encrypt(session.accessJwt),
    refreshTokenEnc: encrypt(session.refreshJwt),
    updatedAt: new Date(),
  }).where(eq(socialAccounts.id, account.id))
  return session.accessJwt
}

async function createPost(did: string, text: string, token: string): Promise<string> {
  const res = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record: { $type: 'app.bsky.feed.post', text, createdAt: new Date().toISOString() },
    }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Bluesky createRecord failed: ${res.status}`)
  }
  const data = await res.json()
  return data.uri as string
}

export async function publishBluesky(content: string, account: BlueskyAccount): Promise<string> {
  if (!account.accessTokenEnc || !account.platformAccountId) {
    throw new Error('Bluesky account is missing credentials')
  }

  let token = decrypt(account.accessTokenEnc)
  const did  = account.platformAccountId
  const parts = splitThread(content)

  // Try publishing the first post; refresh token if 401
  let firstUri: string
  try {
    firstUri = await createPost(did, parts[0], token)
  } catch (err) {
    if (err instanceof Error && err.message.includes('401')) {
      token    = await refreshSession(account)
      firstUri = await createPost(did, parts[0], token)
    } else {
      throw err
    }
  }

  // If thread, publish remaining parts (best-effort — don't fail the whole job)
  for (let i = 1; i < parts.length; i++) {
    await createPost(did, `${i + 1}/${parts.length} ${parts[i]}`, token).catch(() => null)
  }

  return firstUri
}
