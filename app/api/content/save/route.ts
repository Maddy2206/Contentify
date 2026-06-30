import { db } from '@/utils/db'
import { contentPieces } from '@/utils/schema'
import { ensureUser } from '@/lib/user'
import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { formData, templateSlug, aiResponse } = body

  if (!aiResponse) {
    return NextResponse.json({ error: 'aiResponse is required' }, { status: 400 })
  }

  const user = await currentUser()
  await ensureUser(userId, user?.primaryEmailAddress?.emailAddress, user?.fullName)

  const [inserted] = await db
    .insert(contentPieces)
    .values({
      userId,
      userEmail: user?.primaryEmailAddress?.emailAddress ?? null,
      templateSlug: templateSlug ?? null,
      formData: typeof formData === 'string' ? formData : JSON.stringify(formData),
      aiResponse,
    })
    .returning({ id: contentPieces.id })

  return NextResponse.json({ contentPieceId: inserted.id })
}
