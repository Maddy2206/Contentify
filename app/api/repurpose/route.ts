import { db } from '@/utils/db'
import { contentPieces, repurposedVariants } from '@/utils/schema'
import { repurpose } from '@/utils/repurpose'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { contentPieceId, platforms } = await req.json()

  if (!contentPieceId || !Array.isArray(platforms) || platforms.length === 0) {
    return NextResponse.json(
      { error: 'contentPieceId and platforms[] are required' },
      { status: 400 },
    )
  }

  const [piece] = await db
    .select({ id: contentPieces.id, aiResponse: contentPieces.aiResponse })
    .from(contentPieces)
    .where(and(eq(contentPieces.id, contentPieceId), eq(contentPieces.userId, userId)))
    .limit(1)

  if (!piece) return NextResponse.json({ error: 'Content not found' }, { status: 404 })
  if (!piece.aiResponse) return NextResponse.json({ error: 'No content to repurpose' }, { status: 400 })

  const results = await Promise.allSettled(
    (platforms as string[]).map(async (platform) => {
      const variantData = await repurpose(piece.aiResponse!, platform)
      const [inserted] = await db
        .insert(repurposedVariants)
        .values({
          contentPieceId,
          platform,
          variantType: variantData.type,
          variantData: JSON.stringify(variantData),
        })
        .returning({ id: repurposedVariants.id })
      return { platform, variantId: inserted.id, data: variantData }
    }),
  )

  const variants = results.map((r, i) =>
    r.status === 'fulfilled'
      ? r.value
      : { platform: platforms[i], variantId: null, data: null, error: 'Generation failed' },
  )

  return NextResponse.json({ variants })
}
