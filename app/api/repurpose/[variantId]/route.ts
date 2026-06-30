import { db } from '@/utils/db'
import { contentPieces, repurposedVariants } from '@/utils/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  req: NextRequest,
  { params }: { params: { variantId: string } },
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const variantId = parseInt(params.variantId)
  if (isNaN(variantId)) return NextResponse.json({ error: 'Invalid variantId' }, { status: 400 })

  const { editedData } = await req.json()
  if (!editedData) return NextResponse.json({ error: 'editedData is required' }, { status: 400 })

  // Verify ownership via join
  const [row] = await db
    .select({ id: repurposedVariants.id })
    .from(repurposedVariants)
    .innerJoin(contentPieces, eq(repurposedVariants.contentPieceId, contentPieces.id))
    .where(and(eq(repurposedVariants.id, variantId), eq(contentPieces.userId, userId)))
    .limit(1)

  if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db
    .update(repurposedVariants)
    .set({ editedData: JSON.stringify(editedData), updatedAt: new Date() })
    .where(eq(repurposedVariants.id, variantId))

  return NextResponse.json({ success: true })
}
