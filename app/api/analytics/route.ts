import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/utils/db"
import { contentPieces, scheduledPosts } from "@/utils/schema"
import { eq } from "drizzle-orm"

function wordCount(text: string | null) {
  return text?.trim().split(/\s+/).filter(Boolean).length ?? 0
}

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const ago = (days: number) => { const d = new Date(now); d.setDate(d.getDate() - days); return d }

  const [pieces, posts] = await Promise.all([
    db.select().from(contentPieces).where(eq(contentPieces.userId, userId)),
    db.select().from(scheduledPosts).where(eq(scheduledPosts.userId, userId)),
  ])

  const totalWords = pieces.reduce((s, p) => s + wordCount(p.aiResponse), 0)
  const thisMonthPieces = pieces.filter((p) => p.createdAt >= startOfMonth)
  const scheduled = posts.filter((p) => p.status === "queued").length
  const published = posts.filter((p) => p.status === "posted").length

  const byTemplate: Record<string, number> = {}
  for (const p of pieces) {
    const k = p.templateSlug ?? "other"
    byTemplate[k] = (byTemplate[k] ?? 0) + 1
  }

  const byPlatform: Record<string, number> = {}
  for (const p of posts) {
    byPlatform[p.platform] = (byPlatform[p.platform] ?? 0) + 1
  }

  // 30-day trend: count pieces per day
  const start30 = ago(30)
  const trend: Record<string, number> = {}
  for (const p of pieces) {
    if (p.createdAt >= start30) {
      const day = p.createdAt.toISOString().slice(0, 10)
      trend[day] = (trend[day] ?? 0) + 1
    }
  }

  return NextResponse.json({
    totalPieces: pieces.length,
    thisMonthPieces: thisMonthPieces.length,
    totalWords,
    scheduled,
    published,
    byTemplate,
    byPlatform,
    trend,
    last7:  pieces.filter((p) => p.createdAt >= ago(7)).length,
    last30: pieces.filter((p) => p.createdAt >= ago(30)).length,
    last90: pieces.filter((p) => p.createdAt >= ago(90)).length,
  })
}
