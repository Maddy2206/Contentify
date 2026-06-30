import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/utils/db'
import { socialAccounts } from '@/utils/schema'
import { and, eq } from 'drizzle-orm'

export async function DELETE(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { socialAccountId } = await req.json()
  if (!socialAccountId) {
    return NextResponse.json({ error: 'socialAccountId is required' }, { status: 400 })
  }

  await db
    .update(socialAccounts)
    .set({
      isActive: false,
      accessTokenEnc: null,
      refreshTokenEnc: null,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(socialAccounts.id, socialAccountId),
        eq(socialAccounts.userId, userId),
      ),
    )

  return NextResponse.json({ success: true })
}
