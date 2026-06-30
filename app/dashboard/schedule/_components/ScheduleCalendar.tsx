"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface ScheduledPost {
  id: number
  platform: string
  status: string
  scheduledAt: string
  contentSnapshot: string
}

const STATUS_STYLES: Record<string, string> = {
  queued:    'bg-blue-50 text-blue-600',
  posting:   'bg-amber-50 text-amber-600',
  posted:    'bg-emerald-50 text-emerald-600',
  failed:    'bg-red-50 text-red-500',
  cancelled: 'bg-[#F4F4F5] text-[#A1A1AA]',
}

const STATUS_DOT: Record<string, string> = {
  queued:    'bg-blue-400',
  posting:   'bg-amber-400',
  posted:    'bg-emerald-400',
  failed:    'bg-red-400',
  cancelled: 'bg-[#D4D4D8]',
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function ScheduleCalendar({ posts }: { posts: ScheduledPost[] }) {
  const router = useRouter()
  const [current, setCurrent] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [cancelling, setCancelling] = useState<number | null>(null)

  const year = current.getFullYear()
  const month = current.getMonth()

  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Group posts by calendar day for this month
  const postsByDay: Record<number, ScheduledPost[]> = {}
  for (const post of posts) {
    const d = new Date(post.scheduledAt)
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate()
      postsByDay[day] = postsByDay[day] ?? []
      postsByDay[day].push(post)
    }
  }

  const prev = () => setCurrent(new Date(year, month - 1, 1))
  const next = () => setCurrent(new Date(year, month + 1, 1))
  const goToday = () => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    setCurrent(d)
  }

  const isToday = (day: number) => {
    const t = new Date()
    return t.getFullYear() === year && t.getMonth() === month && t.getDate() === day
  }

  const handleCancel = async (postId: number) => {
    setCancelling(postId)
    try {
      const res = await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledPostId: postId }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed')
      }
      toast.success('Post cancelled.')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to cancel.')
    } finally {
      setCancelling(null)
    }
  }

  // Upcoming posts sorted by date
  const upcoming = [...posts]
    .filter((p) => p.status !== 'cancelled')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())

  const cells: (number | null)[] = [
    ...Array(firstDayOfWeek).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div>
      {/* Calendar header */}
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-3'>
          <h2 className='text-lg font-semibold text-[#18181B]'>
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={goToday}
            className='px-2.5 py-1 text-[0.72rem] font-medium rounded-lg bg-[#F4F4F5] text-[#52525B] hover:bg-[#E4E4E7] transition-colors'
          >
            Today
          </button>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={prev}
            className='p-1.5 rounded-lg text-[#52525B] hover:bg-[#F4F4F5] transition-colors'
          >
            <ChevronLeft className='w-4 h-4' />
          </button>
          <button
            onClick={next}
            className='p-1.5 rounded-lg text-[#52525B] hover:bg-[#F4F4F5] transition-colors'
          >
            <ChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>

      {/* Day-of-week headers */}
      <div className='grid grid-cols-7 mb-1'>
        {DAYS.map((d) => (
          <div key={d} className='text-center text-[0.7rem] font-semibold text-[#A1A1AA] py-2 uppercase tracking-wider'>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className='grid grid-cols-7 gap-1'>
        {cells.map((day, i) => (
          <div
            key={i}
            className={`min-h-[90px] rounded-xl p-2 border transition-colors ${
              day === null
                ? 'border-transparent'
                : isToday(day)
                ? 'border-[#18181B] bg-white'
                : 'border-[#F4F4F5] bg-white hover:border-[#E4E4E7]'
            }`}
          >
            {day !== null && (
              <>
                <span
                  className={`text-[0.75rem] font-semibold ${
                    isToday(day) ? 'text-[#18181B]' : 'text-[#71717A]'
                  }`}
                >
                  {day}
                </span>
                <div className='mt-1 space-y-0.5'>
                  {(postsByDay[day] ?? []).slice(0, 3).map((post) => (
                    <div
                      key={post.id}
                      className={`text-[0.65rem] font-medium rounded px-1.5 py-0.5 truncate ${STATUS_STYLES[post.status] ?? STATUS_STYLES.queued}`}
                      title={`${post.platform} — ${post.status}`}
                    >
                      {post.platform}
                    </div>
                  ))}
                  {(postsByDay[day]?.length ?? 0) > 3 && (
                    <span className='text-[0.65rem] text-[#A1A1AA]'>
                      +{postsByDay[day].length - 3} more
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className='flex items-center gap-4 mt-4 flex-wrap'>
        {Object.entries(STATUS_DOT)
          .filter(([s]) => s !== 'cancelled')
          .map(([status, dot]) => (
            <span key={status} className='flex items-center gap-1.5 text-[0.7rem] text-[#71717A] capitalize'>
              <span className={`w-2 h-2 rounded-full ${dot}`} />
              {status}
            </span>
          ))}
      </div>

      {/* Upcoming list */}
      <div className='mt-8'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='flex-1 h-px bg-[#E4E4E7]' />
          <span className='text-[0.68rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em]'>
            Upcoming Posts
          </span>
          <div className='flex-1 h-px bg-[#E4E4E7]' />
        </div>

        {upcoming.length === 0 ? (
          <p className='text-center text-sm text-[#A1A1AA] py-8'>
            No posts scheduled yet. Repurpose content and schedule it from the Home page.
          </p>
        ) : (
          <div className='space-y-2'>
            {upcoming.map((post) => {
              const d = new Date(post.scheduledAt)
              const preview = (() => {
                try {
                  const parsed = JSON.parse(post.contentSnapshot)
                  if (parsed.tweets) return parsed.tweets[0]
                  if (parsed.content) return parsed.content
                  if (parsed.caption) return parsed.caption
                  if (parsed.hook) return parsed.hook
                  if (parsed.subject) return parsed.subject
                  return post.contentSnapshot
                } catch {
                  return post.contentSnapshot
                }
              })()

              return (
                <div
                  key={post.id}
                  className='flex items-start gap-3 bg-white rounded-xl border border-[#F4F4F5] px-4 py-3'
                >
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[post.status] ?? STATUS_DOT.queued}`} />
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-0.5'>
                      <span className='text-sm font-medium text-[#18181B]'>{post.platform}</span>
                      <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_STYLES[post.status] ?? STATUS_STYLES.queued}`}>
                        {post.status}
                      </span>
                    </div>
                    <p className='text-[0.78rem] text-[#71717A] truncate'>{preview}</p>
                    <p className='text-[0.7rem] text-[#A1A1AA] mt-0.5'>
                      {d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' at '}
                      {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {post.status === 'queued' && (
                    <button
                      onClick={() => handleCancel(post.id)}
                      disabled={cancelling === post.id}
                      className='flex-shrink-0 text-[0.72rem] font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50'
                    >
                      {cancelling === post.id ? '…' : 'Cancel'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
