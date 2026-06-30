import { decrypt } from '@/utils/encryption'

interface LinkedInAccount {
  platformAccountId: string | null
  accessTokenEnc: string | null
}

export async function publishLinkedIn(content: string, account: LinkedInAccount): Promise<string> {
  if (!account.accessTokenEnc || !account.platformAccountId) {
    throw new Error('LinkedIn account is missing credentials')
  }

  const token     = decrypt(account.accessTokenEnc)
  const personUrn = `urn:li:person:${account.platformAccountId}`

  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify({
      author: personUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    if (res.status === 401) {
      throw new Error('LinkedIn token expired — user needs to reconnect their account')
    }
    throw new Error(`LinkedIn publish failed (${res.status}): ${body}`)
  }

  // LinkedIn returns the post URN in the x-restli-id header
  return res.headers.get('x-restli-id') ?? 'posted'
}
