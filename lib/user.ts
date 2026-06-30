import { db } from '@/utils/db'
import { users } from '@/utils/schema'
import { eq } from 'drizzle-orm'

export async function ensureUser(
  clerkUserId: string,
  email?: string | null,
  name?: string | null,
) {
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1)

  if (existing.length === 0) {
    await db.insert(users).values({ clerkUserId, email: email ?? null, name: name ?? null })
  }
}
