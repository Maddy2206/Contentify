import Templates from '@/app/(data)/Templates'
import { db } from '@/utils/db'
import { contentPieces } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { and, eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import EditContentClient from './_components/EditContentClient'

interface Props {
  params: { id: string }
}

export default async function EditContentPage({ params }: Props) {
  const user = await currentUser()
  if (!user) return null

  const id = parseInt(params.id)
  if (isNaN(id)) notFound()

  const [item] = await db
    .select()
    .from(contentPieces)
    .where(and(eq(contentPieces.id, id), eq(contentPieces.userId, user.id)))
    .limit(1)

  if (!item) notFound()

  const template = Templates.find((t) => t.slug === item.templateSlug)

  return (
    <EditContentClient
      id={item.id}
      aiResponse={item.aiResponse ?? ''}
      templateName={template?.name ?? item.templateSlug ?? 'Content'}
      templateIcon={template?.icon}
      templateCategory={template?.category}
      createdAt={item.createdAt.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })}
    />
  )
}
