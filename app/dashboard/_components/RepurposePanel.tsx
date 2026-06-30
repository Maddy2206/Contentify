"use client"

import { useState } from 'react'
import { Check, Loader2, Save, CalendarPlus, X } from 'lucide-react'
import { toast } from 'react-toastify'
import type { VariantResult } from '@/utils/repurpose'

// ── Platform definitions ───────────────────────────────────────────────────

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

// ── Variant content renderer ───────────────────────────────────────────────

function VariantContent({
  data,
  onChange,
}: {
  data: VariantResult
  onChange: (d: VariantResult) => void
}) {
  const baseTextarea = 'w-full border border-[#E4E4E7] rounded-xl px-4 py-3 text-sm text-[#18181B] placeholder-[#C4C4CC] resize-none outline-none focus:border-[#A1A1AA] transition-colors bg-[#FAFAF8]'
  const baseInput = 'w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-sm text-[#18181B] outline-none focus:border-[#A1A1AA] transition-colors bg-[#FAFAF8]'
  const label = 'block text-[0.7rem] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-1.5'

  if (data.type === 'thread') {
    return (
      <div className='space-y-3'>
        {data.tweets.map((tweet, i) => {
          const over = tweet.length > 280
          return (
            <div key={i}>
              <div className='flex items-center justify-between mb-1'>
                <span className={label}>Tweet {i + 1}</span>
                <span className={`text-[0.7rem] font-medium ${over ? 'text-red-500' : 'text-[#A1A1AA]'}`}>
                  {tweet.length}/280
                </span>
              </div>
              <textarea
                value={tweet}
                rows={3}
                onChange={(e) => {
                  const tweets = [...data.tweets]
                  tweets[i] = e.target.value
                  onChange({ ...data, tweets })
                }}
                className={`${baseTextarea} ${over ? 'border-red-300 focus:border-red-400' : ''}`}
              />
            </div>
          )
        })}
      </div>
    )
  }

  if (data.type === 'linkedin_post') {
    return (
      <div className='space-y-3'>
        <div>
          <label className={label}>Post</label>
          <textarea
            value={data.content}
            rows={7}
            onChange={(e) => onChange({ ...data, content: e.target.value })}
            className={baseTextarea}
          />
        </div>
        <div>
          <label className={label}>Hashtags</label>
          <div className='flex flex-wrap gap-1.5'>
            {data.hashtags.map((tag, i) => (
              <span key={i} className='px-2.5 py-1 text-[0.72rem] font-medium rounded-full bg-blue-50 text-blue-600'>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.type === 'instagram_caption') {
    return (
      <div className='space-y-3'>
        <div>
          <label className={label}>Caption</label>
          <textarea
            value={data.caption}
            rows={5}
            onChange={(e) => onChange({ ...data, caption: e.target.value })}
            className={baseTextarea}
          />
        </div>
        <div>
          <label className={label}>Hashtags</label>
          <div className='flex flex-wrap gap-1.5'>
            {data.hashtags.map((tag, i) => (
              <span key={i} className='px-2.5 py-1 text-[0.72rem] font-medium rounded-full bg-pink-50 text-pink-600'>
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (data.type === 'video_script') {
    return (
      <div className='space-y-4'>
        {(['hook', 'body', 'cta'] as const).map((field) => (
          <div key={field}>
            <label className={label}>
              {field === 'cta' ? 'Call to Action' : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>
            <textarea
              value={data[field]}
              rows={field === 'body' ? 7 : 3}
              onChange={(e) => onChange({ ...data, [field]: e.target.value })}
              className={baseTextarea}
            />
          </div>
        ))}
      </div>
    )
  }

  if (data.type === 'newsletter') {
    return (
      <div className='space-y-4'>
        <div>
          <label className={label}>Subject Line</label>
          <input
            value={data.subject}
            onChange={(e) => onChange({ ...data, subject: e.target.value })}
            className={baseInput}
          />
        </div>
        <div>
          <label className={label}>Preview Text</label>
          <input
            value={data.preview}
            onChange={(e) => onChange({ ...data, preview: e.target.value })}
            className={baseInput}
          />
        </div>
        <div>
          <label className={label}>Body</label>
          <textarea
            value={data.body}
            rows={8}
            onChange={(e) => onChange({ ...data, body: e.target.value })}
            className={baseTextarea}
          />
        </div>
      </div>
    )
  }

  return null
}

// ── Schedule modal ─────────────────────────────────────────────────────────

function ScheduleModal({
  variantId,
  platform,
  onClose,
  onScheduled,
}: {
  variantId: number
  platform: string
  onClose: () => void
  onScheduled: () => void
}) {
  const platformLabel = PLATFORMS.find((p) => p.key === platform)?.label ?? platform
  const [scheduledAt, setScheduledAt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Minimum datetime: 5 minutes from now
  const minDatetime = new Date(Date.now() + 5 * 60 * 1000)
    .toISOString()
    .slice(0, 16)

  const handleSubmit = async () => {
    if (!scheduledAt) return
    setSubmitting(true)
    try {
      const res = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, platform, scheduledAt }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed')
      }
      toast.success('Post scheduled!')
      onScheduled()
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
          <h3 className='font-semibold text-[#18181B]'>Schedule Post</h3>
          <button onClick={onClose} className='text-[#A1A1AA] hover:text-[#18181B] transition-colors'>
            <X className='w-4 h-4' />
          </button>
        </div>

        <div className='mb-5'>
          <span className='inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#18181B] text-white'>
            {platformLabel}
          </span>
        </div>

        <div className='mb-6'>
          <label className='block text-[0.72rem] font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2'>
            Publish date &amp; time
          </label>
          <input
            type='datetime-local'
            value={scheduledAt}
            min={minDatetime}
            onChange={(e) => setScheduledAt(e.target.value)}
            className='w-full border border-[#E4E4E7] rounded-xl px-4 py-2.5 text-sm text-[#18181B] outline-none focus:border-[#A1A1AA] transition-colors'
          />
          <p className='text-[0.7rem] text-[#A1A1AA] mt-2'>
            Connect a social account on the <strong>Connections</strong> page to enable auto-posting.
          </p>
        </div>

        <div className='flex gap-2'>
          <button
            onClick={onClose}
            className='flex-1 py-2 rounded-xl text-sm font-medium text-[#52525B] bg-[#F4F4F5] hover:bg-[#E4E4E7] transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!scheduledAt || submitting}
            className='flex-1 py-2 rounded-xl text-sm font-semibold bg-[#18181B] text-white hover:bg-[#27272A] disabled:opacity-40 transition-colors'
          >
            {submitting ? 'Scheduling…' : 'Schedule'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Variant card ───────────────────────────────────────────────────────────

function VariantCard({
  variant,
  onSchedule,
}: {
  variant: VariantWithMeta
  onSchedule: () => void
}) {
  const [localData, setLocalData] = useState<VariantResult | null>(variant.data)
  const [saving, setSaving] = useState(false)
  const [scheduled, setScheduled] = useState(false)

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
      {/* Card header */}
      <div className='flex items-center justify-between px-5 py-3.5 border-b border-[#F4F4F5]'>
        <span className='text-sm font-semibold text-[#18181B]'>{platformLabel}</span>
        <div className='flex items-center gap-2'>
          {scheduled && (
            <span className='flex items-center gap-1 text-[0.7rem] text-emerald-600 font-medium'>
              <Check className='w-3 h-3' />Scheduled
            </span>
          )}
          <button
            onClick={onSchedule}
            disabled={!variant.variantId}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-medium text-[#52525B] bg-[#F4F4F5] hover:bg-[#E4E4E7] disabled:opacity-40 transition-colors'
          >
            <CalendarPlus className='w-3.5 h-3.5' />Schedule
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !variant.variantId}
            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.75rem] font-semibold bg-[#18181B] text-white hover:bg-[#27272A] disabled:opacity-40 transition-colors'
          >
            <Save className='w-3.5 h-3.5' />
            {saving ? 'Saving…' : 'Save edits'}
          </button>
        </div>
      </div>

      {/* Card body */}
      <div className='p-5'>
        {variant.error ? (
          <p className='text-sm text-red-500'>{variant.error}</p>
        ) : localData ? (
          <VariantContent
            data={localData}
            onChange={(d) => setLocalData(d as VariantResult)}
          />
        ) : null}
      </div>
    </div>
  )
}

// ── Main panel ─────────────────────────────────────────────────────────────

export default function RepurposePanel({ contentPieceId }: { contentPieceId: number }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [variants, setVariants] = useState<VariantWithMeta[]>([])
  const [scheduleModal, setScheduleModal] = useState<{ variantId: number; platform: string } | null>(null)

  const togglePlatform = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const handleRepurpose = async () => {
    if (selected.size === 0) return
    setLoading(true)
    setVariants([])
    try {
      const res = await fetch('/api/repurpose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentPieceId, platforms: Array.from(selected) }),
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

  return (
    <div className='max-w-5xl mx-auto px-6 pb-16'>
      {/* Section divider */}
      <div className='flex items-center gap-4 mb-6'>
        <div className='flex-1 h-px bg-[#E4E4E7]' />
        <span className='text-[0.68rem] font-semibold text-[#A1A1AA] uppercase tracking-[0.12em] select-none'>
          Repurpose
        </span>
        <div className='flex-1 h-px bg-[#E4E4E7]' />
      </div>

      <div className='bg-white rounded-2xl border border-[#E4E4E7] p-5 mb-6'>
        <p className='text-sm text-[#52525B] mb-4'>
          Adapt your content for different platforms in one click.
        </p>

        {/* Platform toggles */}
        <div className='flex flex-wrap gap-2 mb-5'>
          {PLATFORMS.map((p) => (
            <button
              key={p.key}
              onClick={() => togglePlatform(p.key)}
              className={`px-3.5 py-1.5 rounded-full text-[0.8rem] font-medium transition-all duration-150 select-none ${
                selected.has(p.key)
                  ? 'bg-[#18181B] text-white'
                  : 'bg-[#F4F4F5] text-[#52525B] hover:bg-[#EBEBEB]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleRepurpose}
          disabled={selected.size === 0 || loading}
          className='flex items-center gap-2 px-5 py-2.5 bg-[#18181B] text-white text-[0.82rem] font-semibold rounded-xl hover:bg-[#27272A] disabled:opacity-35 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.97]'
        >
          {loading ? (
            <><Loader2 className='w-3.5 h-3.5 animate-spin' />Repurposing for {selected.size} platform{selected.size > 1 ? 's' : ''}…</>
          ) : (
            <>Repurpose for {selected.size} platform{selected.size > 1 ? 's' : ''}</>
          )}
        </button>
      </div>

      {/* Variant cards */}
      {variants.length > 0 && (
        <div className='space-y-4'>
          {variants.map((v, i) => (
            <VariantCard
              key={i}
              variant={v}
              onSchedule={() => {
                if (v.variantId) setScheduleModal({ variantId: v.variantId, platform: v.platform })
              }}
            />
          ))}
        </div>
      )}

      {/* Schedule modal */}
      {scheduleModal && (
        <ScheduleModal
          variantId={scheduleModal.variantId}
          platform={scheduleModal.platform}
          onClose={() => setScheduleModal(null)}
          onScheduled={() => setScheduleModal(null)}
        />
      )}
    </div>
  )
}
