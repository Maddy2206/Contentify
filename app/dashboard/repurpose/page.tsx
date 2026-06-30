import { db } from '@/utils/db'
import { contentPieces, scheduledPosts } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import RepurposeClient from './_components/RepurposeClient'

export default async function RepurposePage() {
  const user = await currentUser()
  if (!user) return null

  const [pieces, posts] = await Promise.all([
    db
      .select({
        id: contentPieces.id,
        title: contentPieces.title,
        templateSlug: contentPieces.templateSlug,
        aiResponse: contentPieces.aiResponse,
        createdAt: contentPieces.createdAt,
      })
      .from(contentPieces)
      .where(eq(contentPieces.userId, user.id))
      .orderBy(desc(contentPieces.id))
      .limit(30),

    db
      .select({
        id: scheduledPosts.id,
        platform: scheduledPosts.platform,
        status: scheduledPosts.status,
        scheduledAt: scheduledPosts.scheduledAt,
        contentSnapshot: scheduledPosts.contentSnapshot,
      })
      .from(scheduledPosts)
      .where(eq(scheduledPosts.userId, user.id))
      .orderBy(desc(scheduledPosts.scheduledAt))
      .limit(50),
  ])

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      <RepurposeClient
        pieces={pieces.map((p) => ({ ...p, createdAt: p.createdAt.toISOString() }))}
        scheduledPosts={posts.map((p) => ({ ...p, scheduledAt: p.scheduledAt.toISOString() }))}
      />
    </div>
  )

}
