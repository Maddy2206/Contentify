import { db } from '@/utils/db'
import { scheduledPosts, postLogs, socialAccounts } from '@/utils/schema'
import { and, eq, isNull, lte, or } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'
import { publishBluesky  } from '@/utils/platforms/bluesky'
import { publishLinkedIn } from '@/utils/platforms/linkedin'
import { publishMastodon } from '@/utils/platforms/mastodon'

// Vercel Cron calls this. Secured via CRON_SECRET bearer token.
// vercel.json schedule: "0 * * * *" (hourly on Hobby) / "* * * * *" (Pro)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  // Single UPDATE atomically claims eligible rows — prevents double-processing
  // when multiple cron invocations overlap.
  const claimed = await db
    .update(scheduledPosts)
    .set({ status: 'posting', updatedAt: now })
    .where(
      and(
        eq(scheduledPosts.status, 'queued'),
        lte(scheduledPosts.scheduledAt, now),
        or(isNull(scheduledPosts.nextRetryAt), lte(scheduledPosts.nextRetryAt, now)),
      ),
    )
    .returning()

  const processed: { id: number; status: string; platform: string }[] = []

  for (const post of claimed) {
    const attempt = post.retryCount + 1

    // ── Guard: must have a connected social account ─────────────────────
    if (!post.socialAccountId) {
      await markFailed(post.id, attempt, 'No social account linked to this scheduled post')
      processed.push({ id: post.id, status: 'failed', platform: post.platform })
      continue
    }

    // ── Load the social account ──────────────────────────────────────────
    const [account] = await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.id, post.socialAccountId))
      .limit(1)

    if (!account || !account.isActive) {
      await markFailed(post.id, attempt, 'Social account not found or disconnected')
      processed.push({ id: post.id, status: 'failed', platform: post.platform })
      continue
    }

    // ── Publish via the correct platform adapter ─────────────────────────
    try {
      let platformPostId: string

      switch (post.platform) {
        case 'bluesky':
          platformPostId = await publishBluesky(post.contentSnapshot, account)
          break
        case 'linkedin':
          platformPostId = await publishLinkedIn(post.contentSnapshot, account)
          break
        case 'mastodon':
          platformPostId = await publishMastodon(post.contentSnapshot, account)
          break
        default:
          throw new Error(`No publish adapter for platform: ${post.platform}`)
      }

      // Mark success
      await db.update(scheduledPosts).set({
        status:         'posted',
        postedAt:       new Date(),
        platformPostId,
        updatedAt:      new Date(),
      }).where(eq(scheduledPosts.id, post.id))

      await db.insert(postLogs).values({
        scheduledPostId: post.id,
        attempt,
        status:          'success',
        platformResponse: JSON.stringify({ platformPostId }),
      })

      processed.push({ id: post.id, status: 'posted', platform: post.platform })

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Exponential backoff: +10 min, +20 min, +40 min → fail permanently
      const MAX_RETRIES = 3
      if (attempt >= MAX_RETRIES) {
        await markFailed(post.id, attempt, errorMessage)
      } else {
        const backoffMs = Math.pow(2, attempt) * 10 * 60 * 1000 // 20m, 40m, 80m
        await db.update(scheduledPosts).set({
          status:      'queued',
          retryCount:  attempt,
          nextRetryAt: new Date(Date.now() + backoffMs),
          updatedAt:   new Date(),
        }).where(eq(scheduledPosts.id, post.id))
      }

      await db.insert(postLogs).values({
        scheduledPostId: post.id,
        attempt,
        status:       'error',
        errorMessage,
      })

      processed.push({ id: post.id, status: attempt >= MAX_RETRIES ? 'failed' : 'retrying', platform: post.platform })
    }
  }

  return NextResponse.json({ processed: processed.length, details: processed })
}

async function markFailed(postId: number, attempt: number, reason: string) {
  await db.update(scheduledPosts).set({
    status:     'failed',
    retryCount: attempt,
    updatedAt:  new Date(),
  }).where(eq(scheduledPosts.id, postId))

  await db.insert(postLogs).values({
    scheduledPostId: postId,
    attempt,
    status:       'error',
    errorMessage: reason,
  })
}
