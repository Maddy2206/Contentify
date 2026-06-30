import { db } from "@/utils/db"
import { contentPieces } from "@/utils/schema"
import { currentUser } from "@clerk/nextjs/server"
import { desc, eq } from "drizzle-orm"
import MyContentClient from "./_components/MyContentClient"

export default async function MyContentPage() {
  const user = await currentUser()
  if (!user) return null

  const items = await db
    .select()
    .from(contentPieces)
    .where(eq(contentPieces.userId, user.id))
    .orderBy(desc(contentPieces.id))

  const serialized = items.map((i) => ({
    ...i,
    createdAt: i.createdAt.toISOString(),
  }))

  return <MyContentClient items={serialized} />
}
