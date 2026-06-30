import { db } from '@/utils/db'
import { contentPieces } from '@/utils/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const { aiResponse } = await req.json()
  if (!aiResponse) return NextResponse.json({ error: 'aiResponse is required' }, { status: 400 })

  const [updated] = await db
    .update(contentPieces)
    .set({ aiResponse, updatedAt: new Date() })
    .where(and(eq(contentPieces.id, id), eq(contentPieces.userId, userId)))
    .returning({ id: contentPieces.id })

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = parseInt(params.id)
  if (isNaN(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 })

  const [deleted] = await db
    .delete(contentPieces)
    .where(and(eq(contentPieces.id, id), eq(contentPieces.userId, userId)))
    .returning({ id: contentPieces.id })

  if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
