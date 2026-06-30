"use client"

import { useState } from 'react'
import { Check, Loader2, Save, CalendarPlus, X, ChevronRight, ChevronLeft, CalendarDays } from 'lucide-react'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import type { VariantResult } from '@/utils/repurpose'

// ── Types ────────────────────────────────────────────────────────────────

interface ContentPiece {
  id: number
  title: string | null
  templateSlug: string | null
  aiResponse: string | null
  createdAt: string
}

interface ScheduledPost {
  id: number
  platform: string
  status: string
  scheduledAt: string
  contentSnapshot: string
}

const PLATFORMS = [
  { key: 'twitter',      label: 'Twitter / X Thread' },
  { key: 'linkedin',     label: 'LinkedIn Post' },
  { key: 'instagram',    label: 'Instagram Caption' },
  { key: 'video_script', label: 'Video Script' },
  { key: 'newsletter',   label: 'Newsletter' },
]

interface VariantWithMeta {
  platform: string
  variantId: number | null
  data: VariantResult | null
  error?: string
}

// ── Status styles ─────────────────────────────────────────────────────────

const STATUS_PILL: Record<string, string> = {
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

// ── Variant content editor ───────────────────────────────────────────────

function VariantContent({ data, onChange }: { data: VariantResult; onChange: (d: VariantResult) => void }) {
  const ta  = 'w-full border border-[#E4E4E7] rounded-xl px-4 py-3 text-sm text-[#18181B] resize-none outline-none focus:border-[#A1A1AA] transition-colors bg-[#FAFAF8]'
  const inp = 'w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-sm text-[#18181B] outline-none focus:border-[#A1A1AA] transition-colors bg-[#FAFAF8]'
  const lbl = 'block text-[0.68rem] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5'

  if (data.type === 'thread') return (
    <div className='space-y-3'>
      {data.tweets.map((tweet, i) => {
        const over = tweet.length > 280
        return (
          <div key={i}>
            <div className='flex items-center justify-between mb-1'>
              <span className={lbl}>Tweet {i + 1}</span>
              <span className={`text-[0.68rem] font-medium ${over ? 'text-red-500' : 'text-[#A1A1AA]'}`}>{tweet.length}/280</span>
            </div>
            <textarea value={tweet} rows={3}
              onChange={(e) => { const tweets = [...data.tweets]; tweets[i] = e.target.value; onChange({ ...data, tweets }) }}
              className={`${ta} ${over ? 'border-red-300' : ''}`}
            />
          </div>
        )
      })}
    </div>
  )

  if (data.type === 'linkedin_post') return (
    <div className='space-y-3'>
      <div><label className={lbl}>Post</label>
        <textarea value={data.content} rows={7} onChange={(e) => onChange({ ...data, content: e.target.value })} className={ta} />
      </div>
      <div><label className={lbl}>Hashtags</label>
        <div className='flex flex-wrap gap-1.5'>
          {data.hashtags.map((tag, i) => <span key={i} className='px-2.5 py-1 text-[0.72rem] font-medium rounded-full bg-blue-50 text-blue-600'>#{tag}</span>)}
        </div>
      </div>
    </div>
  )

  if (data.type === 'instagram_caption') return (
    <div className='space-y-3'>
      <div><label className={lbl}>Caption</label>
        <textarea value={data.caption} rows={5} onChange={(e) => onChange({ ...data, caption: e.target.value })} className={ta} />
      </div>
      <div><label className={lbl}>Hashtags</label>
        <div className='flex flex-wrap gap-1.5'>
          {data.hashtags.map((tag, i) => <span key={i} className='px-2.5 py-1 text-[0.72rem] font-medium rounded-full bg-pink-50 text-pink-600'>#{tag}</span>)}
        </div>
      </div>
    </div>
  )

  if (data.type === 'video_script') return (
    <div className='space-y-4'>
      {(['hook', 'body', 'cta'] as const).map((field) => (
        <div key={field}><label className={lbl}>{field === 'cta' ? 'Call to Action' : field.charAt(0).toUpperCase() + field.slice(1)}</label>
          <textarea value={data[field]} rows={field === 'body' ? 7 : 3} onChange={(e) => onChange({ ...data, [field]: e.target.value })} className={ta} />
        </div>
      ))}
    </div>
  )

  if (data.type === 'newsletter') return (
    <div className='space-y-4'>
      <div><label className={lbl}>Subject Line</label><input value={data.subject} onChange={(e) => onChange({ ...data, subject: e.target.value })} className={inp} /></div>
      <div><label className={lbl}>Preview Text</label><input value={data.preview} onChange={(e) => onChange({ ...data, preview: e.target.value })} className={inp} /></div>
      <div><label className={lbl}>Body</label><textarea value={data.body} rows={8} onChange={(e) => onChange({ ...data, body: e.target.value })} className={ta} /></div>
    </div>
  )

  return null
}

// ── Schedule modal ───────────────────────────────────────────────────────

function ScheduleModal({ variantId, platform, onClose }: { variantId: number; platform: string; onClose: () => void }) {
  const router = useRouter()
  const platformLabel = PLATFORMS.find((p) => p.key === platform)?.label ?? platform
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Minimum: 5 min from now, formatted as datetime-local
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  const handleSubmit = async () => {
    if (!scheduledAt) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, platform, scheduledAt }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Failed') }
      toast.success('Post scheduled!')
      router.refresh()
      onClose()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to schedule.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/30 backdrop-blur-sm' onClick={onClose} />
      <div className='relative bg-white rounded-2xl shadow-2xl border border-[#E4E4E7] w-full max-w-sm p-6'>
        <div className='flex items-center justify-between mb-5'>
          <div className='flex items-center gap-2'>
            <CalendarDays className='w-4 h-4 text-[#18181B]' />
            <h3 className='font-semibold text-[#18181B]'>Schedule Post</h3>
          </div>
          <button onClick={onClose} className='text-[#A1A1AA] hover:text-[#18181B] transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='mb-4'>
          <span className='inline-block px-3 py-1 rounded-full text-xs font-medium text-white' style={{ background: 'var(--accent)' }}>
            {platformLabel}
          </span>
        </div>

        <div className='mb-6'>
          <label className='block text-[0.72rem] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2'>
            Date &amp; Time
          </label>
          <input
            type='datetime-local'
            value={scheduledAt}
            min={minDatetime}
            onChange={(e) => setScheduledAt(e.target.value)}
            className='w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-sm text-[#18181B] outline-none focus:border-[#A1A1AA] transition-colors bg-[#FAFAF8]'
          />
          {scheduledAt && (
            <p className='text-[0.72rem] text-[#71717A] mt-2'>
              Will post on {new Date(scheduledAt).toLocaleString('en-GB', {
                weekday: 'short', day: 'numeric', month: 'short',
                year: 'numeric', hour: '2-digit', minute: '2-digit',
              })}
            </p>
          )}
          <p className='text-[0.68rem] text-[#A1A1AA] mt-2'>
            Connect a social account in <strong>Connections</strong> to enable auto-posting.
          </p>
        </div>

        <div className='flex gap-2'>
          <button onClick={onClose}
            className='flex-1 py-2 rounded-xl text-sm font-medium text-[#52525B] bg-[#F4F4F5] hover:bg-[#E4E4E7] transition-colors'>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!scheduledAt || submitting}
            className='flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5' style={{ background: 'var(--accent)' }}>
            {submitting ? <><Loader2 className='w-3.5 h-3.5 animate-spin' />Scheduling…</> : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Variant card ─────────────────────────────────────────────────────────

function VariantCard({ variant }: { variant: VariantWithMeta }) {
  const [localData, setLocalData] = useState<VariantResult | null>(variant.data)
  const [saving, setSaving] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  const platformLabel = PLATFORMS.find((p) => p.key === variant.platform)?.label ?? variant.platform

  const handleSave = async () => {
    if (!variant.variantId || !localData) return
    setSaving(true)
    try {
      const res = await fetch(`/api/repurpose/${variant.variantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ editedData: localData }),
      })
      if (!res.ok) throw new Error()
      toast.success('Edits saved.')
    } catch {
      toast.error('Failed to save edits.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='bg-white rounded-2xl border border-[#E4E4E7] overflow-hidden'>
      <div className='flex items-center justify-between px-5 py-3.5 border-b border-[#F4F4F5]'>
        <span className='text-sm font-semibold text-[#18181B]'>{platformLabel}</span>
        <div className='flex items-center gap-2'>
          <button onClick={() => setShowSchedule(true)} disabled={!variant.variantId}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium text-[#52525B] bg-[#F4F4F5] hover:bg-[#E4E4E7] disabled:opacity-40 transition-colors'>
            <CalendarPlus className='w-3.5 h-3.5' />Schedule
          </button>
          <button onClick={handleSave} disabled={saving || !variant.variantId}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold text-white disabled:opacity-40 transition-colors' style={{ background: 'var(--accent)' }}>
            <Save className='w-3.5 h-3.5' />{saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      <div className='p-5'>
        {variant.error
          ? <p className='text-sm text-red-500'>{variant.error}</p>
          : localData
          ? <VariantContent data={localData} onChange={(d) => setLocalData(d as VariantResult)} />
          : null}
      </div>
      {showSchedule && variant.variantId && (
        <ScheduleModal variantId={variant.variantId} platform={variant.platform} onClose={() => setShowSchedule(false)} />
      )}
    </div>
  )
}

// ── Scheduled posts list ─────────────────────────────────────────────────

function ScheduledPostsList({ posts }: { posts: ScheduledPost[] }) {
  const router = useRouter()
  const [cancelling, setCancelling] = useState<number | null>(null)

  const handleCancel = async (postId: number) => {
    setCancelling(postId)
    try {
      const res = await fetch('/api/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledPostId: postId }),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Failed') }
      toast.success('Post cancelled.')
      router.refresh()
    } catch (e: any) {
      toast.error(e.message ?? 'Failed to cancel.')
    } finally {
      setCancelling(null)
    }
  }

  const active = posts.filter((p) => p.status !== 'cancelled')

  return (
    <div className='max-w-5xl mx-auto px-6 pb-16 mt-2'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='flex-1 h-px bg-[#E4E4E7]' />
        <span className='text-[0.68rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em] flex items-center gap-1.5'>
          <CalendarDays className='w-3 h-3' />Scheduled Posts
        </span>
        <div className='flex-1 h-px bg-[#E4E4E7]' />
      </div>

      {active.length === 0 ? (
        <div className='bg-white rounded-2xl border border-[#E4E4E7] p-8 text-center'>
          <CalendarDays className='w-8 h-8 text-[#D4D4D8] mx-auto mb-2' />
          <p className='text-sm text-[#A1A1AA]'>No scheduled posts yet.</p>
          <p className='text-[0.78rem] text-[#C4C4CC] mt-0.5'>Repurpose content above and click Schedule to queue a post.</p>
        </div>
      ) : (
        <div className='space-y-2'>
          {active.map((post) => {
            const d = new Date(post.scheduledAt)
            const preview = (() => {
              try {
                const parsed = JSON.parse(post.contentSnapshot)
                return parsed.tweets?.[0] ?? parsed.content ?? parsed.caption ?? parsed.hook ?? parsed.subject ?? post.contentSnapshot
              } catch { return post.contentSnapshot }
            })()

            return (
              <div key={post.id} className='flex items-start gap-3 bg-white rounded-xl border border-[#F4F4F5] px-4 py-3'>
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${STATUS_DOT[post.status] ?? STATUS_DOT.queued}`} />
                <div className='flex-1 min-w-0'>
                  <div className='flex items-center gap-2 mb-0.5'>
                    <span className='text-sm font-medium text-[#18181B] capitalize'>{post.platform.replace('_', ' ')}</span>
                    <span className={`text-[0.65rem] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_PILL[post.status] ?? STATUS_PILL.queued}`}>
                      {post.status}
                    </span>
                  </div>
                  <p className='text-[0.78rem] text-[#71717A] truncate'>{preview}</p>
                  <p className='text-[0.7rem] text-[#A1A1AA] mt-0.5'>
                    {d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {post.status === 'queued' && (
                  <button onClick={() => handleCancel(post.id)} disabled={cancelling === post.id}
                    className='shrink-0 text-[0.72rem] font-medium text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50'>
                    {cancelling === post.id ? '…' : 'Cancel'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────

export default function RepurposeClient({
  pieces,
  scheduledPosts,
}: {
  pieces: ContentPiece[]
  scheduledPosts: ScheduledPost[]
}) {
  const [selected, setSelected] = useState<ContentPiece | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<VariantWithMeta[]>([])

  const togglePlatform = (key: string) => {
    setSelectedPlatforms((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleRepurpose = async () => {
    if (!selected || selectedPlatforms.size === 0) return
    setLoading(true)
    setVariants([])
    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentPieceId: selected.id, platforms: Array.from(selectedPlatforms) }),
      })
      if (!res.ok) throw new Error()
      const { variants: v } = await res.json()
      setVariants(v)
    } catch {
      toast.error('Repurposing failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (pieces.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center px-6'>
        <p className='text-sm text-[#A1A1AA] mb-1'>No content yet.</p>
        <p className='text-[0.8rem] text-[#C4C4CC]'>Generate content on the Home page first.</p>
      </div>
    )
  }

  return (
    <>
      <div className='max-w-5xl mx-auto px-6 py-8'>

        {/* Step 1: Pick content */}
        <div className='mb-8'>
          <h2 className='text-[0.72rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em] mb-3'>
            1 · Select Content
          </h2>
          <div className='grid grid-cols-1 gap-2'>
            {pieces.map((piece) => {
              const isSelected = selected?.id === piece.id
              const preview = piece.aiResponse?.slice(0, 130) ?? ''
              const date = new Date(piece.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })
              return (
                <button key={piece.id} onClick={() => { setSelected(piece); setVariants([]) }}
                  className={`text-left w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
                    isSelected ? 'bg-white shadow-sm' : 'border-[#E4E4E7] bg-white hover:border-[#C4C4CC]'
                  }`}
                  style={{ borderColor: isSelected ? 'var(--accent)' : undefined }}>
                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? '' : 'border-[#D4D4D8]'
                  }`}
                  style={{ borderColor: isSelected ? 'var(--accent)' : undefined, background: isSelected ? 'var(--accent)' : undefined }}>
                    {isSelected && <Check className='w-2.5 h-2.5 text-white' strokeWidth={3} />}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2 mb-0.5'>
                      {piece.templateSlug && (
                        <span className='text-[0.65rem] font-semibold uppercase tracking-wider text-[#A1A1AA]'>
                          {piece.templateSlug.replace(/-/g, ' ')}
                        </span>
                      )}
                      <span className='text-[0.65rem] text-[#C4C4CC]'>{date}</span>
                    </div>
                    <p className='text-[0.82rem] text-[#18181B] truncate'>{preview}…</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-colors ${isSelected ? 'text-[#18181B]' : 'text-[#D4D4D8]'}`} />
                </button>
              )
            })}
          </div>
        </div>

        {/* Step 2: Pick platforms */}
        {selected && (
          <div className='mb-8'>
            <h2 className='text-[0.72rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em] mb-3'>
              2 · Choose Platforms
            </h2>
            <div className='bg-white rounded-2xl border border-[#E4E4E7] p-5'>
              <div className='flex flex-wrap gap-2 mb-5'>
                {PLATFORMS.map((p) => (
                  <button key={p.key} onClick={() => togglePlatform(p.key)}
                    className={`px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium transition-all duration-150 select-none ${
                      selectedPlatforms.has(p.key)
                        ? 'text-white'
                        : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#EBEBEB]'
                    }`}
                    style={{ background: selectedPlatforms.has(p.key) ? 'var(--accent)' : undefined }}>
                    {p.label}
                  </button>
                ))}
              </div>

              <button onClick={handleRepurpose} disabled={selectedPlatforms.size === 0 || loading}
                className='flex items-center gap-2 px-5 py-2.5 text-white text-[0.82rem] font-semibold rounded-xl disabled:opacity-35 disabled:cursor-not-allowed transition-all active:scale-[0.97]'
                style={{ background: 'var(--accent)' }}>
                {loading
                  ? <><Loader2 className='w-3.5 h-3.5 animate-spin' />Repurposing for {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? 's' : ''}…</>
                  : <>Repurpose for {selectedPlatforms.size} platform{selectedPlatforms.size > 1 ? 's' : ''}</>}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Variant cards */}
        {variants.length > 0 && (
          <div>
            <h2 className='text-[0.72rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em] mb-3'>
              3 · Edit &amp; Schedule
            </h2>
            <div className='space-y-4'>
              {variants.map((v, i) => <VariantCard key={i} variant={v} />)}
            </div>
          </div>
        )}
      </div>

      {/* Scheduled posts section */}
      <ScheduledPostsList posts={scheduledPosts} />
    </>
  )
}
