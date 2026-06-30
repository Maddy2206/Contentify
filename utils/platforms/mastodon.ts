import { decrypt } from '@/utils/encryption'

interface MastodonAccount {
  accessTokenEnc: string | null
  instanceUrl: string | null
}

// Mastodon default character limit is 500, but some instances allow more.
// We cap at 490 to leave room for the CW.
const MAX_CHARS = 490

export async function publishMastodon(content: string, account: MastodonAccount): Promise<string> {
  if (!account.accessTokenEnc || !account.instanceUrl) {
    throw new Error('Mastodon account is missing credentials or instance URL')
  }

  const token       = decrypt(account.accessTokenEnc)
  const instanceUrl = account.instanceUrl
  const status      = content.length > MAX_CHARS ? content.slice(0, MAX_CHARS - 1) + '…' : content

  const res = await fetch(`https://${instanceUrl}/api/v1/statuses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'Idempotency-Key': crypto.randomUUID(), // prevents duplicate posts on retries
    },
    body: JSON.stringify({ status, visibility: 'public' }),
  })

  if (!res.ok) {
    const body = await res.text()
    if (res.status === 401) {
      throw new Error('Mastodon token expired — user needs to reconnect their account')
    }
    throw new Error(`Mastodon publish failed (${res.status}): ${body}`)
  }

  const data = await res.json()
  return data.id as string
}
