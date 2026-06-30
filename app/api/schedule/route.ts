import { db } from '@/utils/db'
import { repurposedVariants, contentPieces, scheduledPosts } from '@/utils/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { variantId, platform, scheduledAt } = await req.json()

  if (!variantId || !platform || !scheduledAt) {
    return NextResponse.json({ error: 'variantId, platform, and scheduledAt are required' }, { status: 400 })
  }

  const scheduledDate = new Date(scheduledAt)
  if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
    return NextResponse.json({ error: 'scheduledAt must be a valid future date' }, { status: 400 })
  }

  // Verify variant ownership
  const [variant] = await db
    .select({
      id: repurposedVariants.id,
      variantData: repurposedVariants.variantData,
      editedData: repurposedVariants.editedData,
    })
    .from(repurposedVariants)
    .innerJoin(contentPieces, eq(repurposedVariants.contentPieceId, contentPieces.id))
    .where(and(eq(repurposedVariants.id, variantId), eq(contentPieces.userId, userId)))
    .limit(1)

  if (!variant) return NextResponse.json({ error: 'Variant not found' }, { status: 404 })

  // Denormalize content at schedule time so edits after scheduling don't affect the queued post
  const contentSnapshot = variant.editedData ?? variant.variantData

  const [inserted] = await db
    .insert(scheduledPosts)
    .values({
      userId,
      variantId,
      platform,
      contentSnapshot,
      scheduledAt: scheduledDate,
      idempotencyKey: randomUUID(),
    })
    .returning({ id: scheduledPosts.id })

  return NextResponse.json({ scheduledPostId: inserted.id })
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { scheduledPostId } = await req.json()
  if (!scheduledPostId) return NextResponse.json({ error: 'scheduledPostId is required' }, { status: 400 })

  const [updated] = await db
    .update(scheduledPosts)
    .set({ status: 'cancelled', updatedAt: new Date() })
    .where(and(eq(scheduledPosts.id, scheduledPostId), eq(scheduledPosts.userId, userId), eq(scheduledPosts.status, 'queued')))
    .returning({ id: scheduledPosts.id })

  if (!updated) return NextResponse.json({ error: 'Post not found or already processed' }, { status: 404 })
  return NextResponse.json({ success: true })
}
