import { db } from '@/utils/db'
import { socialAccounts } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { eq, and } from 'drizzle-orm'
import ConnectionsClient from './_components/ConnectionsClient'

export default async function ConnectionsPage() {
  const user = await currentUser()
  if (!user) return null

  const accounts = await db
    .select({
      id:       socialAccounts.id,
      platform: socialAccounts.platform,
      handle:   socialAccounts.handle,
      isActive: socialAccounts.isActive,
    })
    .from(socialAccounts)
    .where(
      and(
        eq(socialAccounts.userId, user.id),
        eq(socialAccounts.isActive, true),
      ),
    )

  return <ConnectionsClient connectedAccounts={accounts} />
}
