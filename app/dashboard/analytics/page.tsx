import { auth } from "@clerk/nextjs/server"
import { db } from "@/utils/db"
import { contentPieces, scheduledPosts } from "@/utils/schema"
import { eq } from "drizzle-orm"
import AnalyticsClient from "./_components/AnalyticsClient"

function wordCount(text: string | null) {
  return text?.trim().split(/\s+/).filter(Boolean).length ?? 0
}

export default async function AnalyticsPage() {
  const { userId } = await auth()

  let realStats = {
    totalPieces:      0,
    thisMonthPieces:  0,
    totalWords:       0,
    scheduled:        0,
    published:        0,
    byTemplate:       {} as Record<string, number>,
    byPlatform:       {} as Record<string, number>,
    last7:            0,
    last30:           0,
    last90:           0,
  }

  if (userId) {
    const now = new Date()
    const ago = (d: number) => { const dt = new Date(now); dt.setDate(dt.getDate() - d); return dt }
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [pieces, posts] = await Promise.all([
      db.select().from(contentPieces).where(eq(contentPieces.userId, userId)),
      db.select().from(scheduledPosts).where(eq(scheduledPosts.userId, userId)),
    ])

    const byTemplate: Record<string, number> = {}
    for (const p of pieces) {
      const k = p.templateSlug ?? "other"
      byTemplate[k] = (byTemplate[k] ?? 0) + 1
    }

    const byPlatform: Record<string, number> = {}
    for (const p of posts) {
      byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + 1
    }

    realStats = {
      totalPieces:     pieces.length,
      thisMonthPieces: pieces.filter((p) => p.createdAt >= startOfMonth).length,
      totalWords:      pieces.reduce((s, p) => s + wordCount(p.aiResponse), 0),
      scheduled:       posts.filter((p) => p.status === "queued").length,
      published:       posts.filter((p) => p.status === "posted").length,
      byTemplate,
      byPlatform,
      last7:           pieces.filter((p) => p.createdAt >= ago(7)).length,
      last30:          pieces.filter((p) => p.createdAt >= ago(30)).length,
      last90:          pieces.filter((p) => p.createdAt >= ago(90)).length,
    }
  }

  return <AnalyticsClient stats={realStats} />
}
