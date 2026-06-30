import { db } from '@/utils/db'
import { scheduledPosts } from '@/utils/schema'
import { currentUser } from '@clerk/nextjs/server'
import { desc, eq } from 'drizzle-orm'
import { CalendarDays } from 'lucide-react'
import ScheduleCalendar from './_components/ScheduleCalendar'

export default async function SchedulePage() {
  const user = await currentUser()
  if (!user) return null

  const posts = await db
    .select({
      id: scheduledPosts.id,
      platform: scheduledPosts.platform,
      status: scheduledPosts.status,
      scheduledAt: scheduledPosts.scheduledAt,
      contentSnapshot: scheduledPosts.contentSnapshot,
    })
    .from(scheduledPosts)
    .where(eq(scheduledPosts.userId, user.id))
    .orderBy(desc(scheduledPosts.scheduledAt))

  // Serialize dates for the client component
  const serialized = posts.map((p) => ({
    ...p,
    scheduledAt: p.scheduledAt.toISOString(),
  }))

  return (
    <div className='m-5' style={{ background: '#FAFAF8', minHeight: '100%' }}>
      <div className='max-w-4xl mx-auto px-2 pt-8 pb-16'>
        {/* Page header */}
        <div className='flex items-center gap-3 mb-8'>
          <div className='w-10 h-10 rounded-xl bg-[#18181B] flex items-center justify-center'>
            <CalendarDays className='w-5 h-5 text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-bold text-[#18181B]'>Schedule</h1>
            <p className='text-sm text-[#71717A]'>View and manage your queued posts</p>
          </div>
        </div>

        <div className='bg-white rounded-2xl border border-[#E4E4E7] shadow-sm p-6'>
          <ScheduleCalendar posts={serialized} />
        </div>
      </div>
    </div>
  )
}
