import { db } from '@/utils/db'
import { contentPieces } from '@/utils/schema'
import { auth } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await db
    .select()
    .from(contentPieces)
    .where(eq(contentPieces.userId, userId))
    .orderBy(desc(contentPieces.id))

  return NextResponse.json(items)
}
