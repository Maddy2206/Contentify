"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, Link2, Loader2, LogOut, X } from 'lucide-react'
import { toast } from 'react-toastify'

interface ConnectedAccount {
  id: number
  platform: string
  handle: string | null
  isActive: boolean
}

// ── Platform metadata ─────────────────────────────────────────────────────

const PLATFORMS = [
  {
    key:         'bluesky',
    name:        'Bluesky',
    description: 'Connect via app password — no OAuth needed.',
    color:       '#0085FF',
    bg:          '#EFF6FF',
    form:        true,
    stub:        false,
  },
  {
    key:         'linkedin',
    name:        'LinkedIn',
    description: 'Share long-form posts and professional updates.',
    color:       '#0077B5',
    bg:          '#EFF6FF',
    form:        false,
    stub:        false,
  },
  {
    key:         'mastodon',
    name:        'Mastodon',
    description: 'Publish to any Mastodon instance via OAuth.',
    color:       '#6364FF',
    bg:          '#F5F3FF',
    form:        false,
    stub:        false,
    needsInstance: true,
  },
  {
    key:         'instagram',
    name:        'Instagram',
    description: 'Requires Meta Business App Review.',
    color:       '#E1306C',
    bg:          '#FFF0F5',
    form:        false,
    stub:        true,
    stubLabel:   'Requires App Review',
  },
  {
    key:         'twitter',
    name:        'Twitter / X',
    description: 'Requires a paid API subscription ($100/mo).',
    color:       '#18181B',
    bg:          '#F4F4F5',
    form:        false,
    stub:        true,
    stubLabel:   'Paid API Required',
  },
] as const

// ── Bluesky connect form ──────────────────────────────────────────────────

function BlueskyForm({ onSuccess }: { onSuccess: (handle: string) => void }) {
  const [handle, setHandle]         = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!handle.trim() || !appPassword.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/social/bluesky/connect', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ handle: handle.trim(), appPassword: appPassword.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Connection failed')
      toast.success(`Connected as @${data.handle}`)
      onSuccess(data.handle)
      setHandle('')
      setAppPassword('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className='mt-4 space-y-2.5'>
      <input
        value={handle}
        onChange={(e) => setHandle(e.target.value)}
        placeholder='handle.bsky.social'
        className='w-full border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-sm text-[#18181B] placeholder-[#C4C4CC] outline-none focus:border-[#0085FF] transition-colors bg-[#FAFAF8]'
      />
      <input
        type='password'
        value={appPassword}
        onChange={(e) => setAppPassword(e.target.value)}
        placeholder='App password (from bsky.app/settings/app-passwords)'
        className='w-full border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-sm text-[#18181B] placeholder-[#C4C4CC] outline-none focus:border-[#0085FF] transition-colors bg-[#FAFAF8]'
      />
      {error && <p className='text-[0.75rem] text-red-500'>{error}</p>}
      <button
        type='submit'
        disabled={loading || !handle.trim() || !appPassword.trim()}
        className='w-full py-2 rounded-xl text-[0.82rem] font-semibold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2'
        style={{ backgroundColor: '#0085FF' }}
      >
        {loading ? <><Loader2 className='w-3.5 h-3.5 animate-spin' />Connecting…</> : 'Connect Bluesky'}
      </button>
      <p className='text-[0.68rem] text-[#A1A1AA] text-center'>
        Use an <strong>app password</strong>, not your main password.
      </p>
    </form>
  )
}

// ── Mastodon connect form ─────────────────────────────────────────────────

function MastodonForm() {
  const [instanceUrl, setInstanceUrl] = useState('')

  const handleConnect = () => {
    if (!instanceUrl.trim()) return
    const clean = instanceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')
    window.location.href = `/api/social/connect/mastodon?instanceUrl=${encodeURIComponent(clean)}`
  }

  return (
    <div className='mt-4 space-y-2.5'>
      <input
        value={instanceUrl}
        onChange={(e) => setInstanceUrl(e.target.value)}
        placeholder='mastodon.social'
        onKeyDown={(e) => { if (e.key === 'Enter') handleConnect() }}
        className='w-full border border-[#E4E4E7] rounded-xl px-3.5 py-2 text-sm text-[#18181B] placeholder-[#C4C4CC] outline-none focus:border-[#6364FF] transition-colors bg-[#FAFAF8]'
      />
      <button
        onClick={handleConnect}
        disabled={!instanceUrl.trim()}
        className='w-full py-2 rounded-xl text-[0.82rem] font-semibold text-white transition-colors disabled:opacity-40 flex items-center justify-center gap-2'
        style={{ backgroundColor: '#6364FF' }}
      >
        <Link2 className='w-3.5 h-3.5' />Connect via OAuth
      </button>
    </div>
  )
}

// ── Platform card ─────────────────────────────────────────────────────────

function PlatformCard({
  platform,
  account,
  onDisconnect,
}: {
  platform: typeof PLATFORMS[number]
  account: ConnectedAccount | undefined
  onDisconnect: (id: number) => void
}) {
  const [disconnecting, setDisconnecting] = useState(false)
  const [expanded, setExpanded]           = useState(false)

  const isConnected = !!account

  const handleDisconnect = async () => {
    if (!account) return
    setDisconnecting(true)
    try {
      const res = await fetch('/api/social/disconnect', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ socialAccountId: account.id }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Disconnected ${platform.name}`)
      onDisconnect(account.id)
    } catch {
      toast.error('Failed to disconnect.')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
      isConnected ? 'border-[#18181B] shadow-sm' : 'border-[#E4E4E7]'
    } ${platform.stub ? 'opacity-60' : ''}`}>
      <div className='p-5'>
        {/* Header row */}
        <div className='flex items-start justify-between gap-3'>
          <div className='flex items-center gap-3'>
            {/* Platform dot */}
            <div
              className='w-9 h-9 rounded-xl flex items-center justify-center text-white text-[0.78rem] font-bold shrink-0'
              style={{ backgroundColor: platform.color }}
            >
              {platform.name[0]}
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-semibold text-[#18181B]'>{platform.name}</span>
                {platform.stub && (
                  <span className='text-[0.62rem] font-semibold px-2 py-0.5 rounded-full bg-[#F4F4F5] text-[#A1A1AA] uppercase tracking-wide'>
                    {(platform as any).stubLabel}
                  </span>
                )}
                {isConnected && (
                  <span className='flex items-center gap-1 text-[0.72rem] font-medium text-emerald-600'>
                    <Check className='w-3 h-3' />Connected
                  </span>
                )}
              </div>
              {isConnected && account.handle ? (
                <p className='text-[0.75rem] text-[#71717A] mt-0.5'>{account.handle}</p>
              ) : (
                <p className='text-[0.75rem] text-[#A1A1AA] mt-0.5'>{platform.description}</p>
              )}
            </div>
          </div>

          {/* Action button */}
          {!platform.stub && (
            isConnected ? (
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-medium text-red-500 bg-red-50 hover:bg-red-100 disabled:opacity-50 transition-colors'
              >
                {disconnecting ? <Loader2 className='w-3 h-3 animate-spin' /> : <LogOut className='w-3 h-3' />}
                Disconnect
              </button>
            ) : (
              <button
                onClick={() => {
                  if (platform.key === 'linkedin') {
                    window.location.href = '/api/social/connect/linkedin'
                  } else {
                    setExpanded((v) => !v)
                  }
                }}
                className='shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.72rem] font-semibold text-white transition-colors'
                style={{ backgroundColor: platform.color }}
              >
                <Link2 className='w-3 h-3' />
                {expanded ? 'Cancel' : 'Connect'}
              </button>
            )
          )}
        </div>

        {/* Expanded connect forms */}
        {!platform.stub && !isConnected && expanded && (
          platform.key === 'bluesky'
            ? <BlueskyForm onSuccess={() => window.location.reload()} />
            : platform.key === 'mastodon'
            ? <MastodonForm />
            : null
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────

export default function ConnectionsClient({
  connectedAccounts,
}: {
  connectedAccounts: ConnectedAccount[]
}) {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const [accounts, setAccounts] = useState<ConnectedAccount[]>(connectedAccounts)

  // Handle OAuth redirect success/error messages
  useEffect(() => {
    const connected = searchParams.get('connected')
    const error     = searchParams.get('error')

    if (connected) {
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected!`)
      router.replace('/dashboard/connections')
      router.refresh()
    }
    if (error) {
      const messages: Record<string, string> = {
        invalid_state:          'OAuth flow expired. Please try again.',
        token_exchange_failed:  'Token exchange failed. Try reconnecting.',
        profile_fetch_failed:   'Could not fetch profile. Try again.',
        linkedin_not_configured:'LinkedIn env vars not set (LINKEDIN_CLIENT_ID / SECRET).',
        mastodon_registration_failed: 'Could not register with that Mastodon instance.',
        missing_mastodon_data:  'Mastodon session expired. Please try again.',
      }
      toast.error(messages[error] ?? `OAuth error: ${error}`)
      router.replace('/dashboard/connections')
    }
  }, [searchParams]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDisconnect = (id: number) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id))
  }

  const accountByPlatform = (key: string) =>
    accounts.find((a) => a.platform === key && a.isActive)

  return (
    <div style={{ minHeight: '100%', background: 'var(--bg-subtle)' }}>
      <div className='max-w-3xl mx-auto px-6 pt-8 pb-16'>

        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-3 mb-1'>
            <div className='w-10 h-10 rounded-xl bg-[#18181B] flex items-center justify-center'>
              <Link2 className='w-5 h-5 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-[#18181B]'>Connections</h1>
              <p className='text-sm text-[#71717A]'>Link your social accounts to enable auto-posting</p>
            </div>
          </div>

          {accounts.length > 0 && (
            <div className='mt-4 flex items-center gap-2 flex-wrap'>
              <span className='text-[0.72rem] text-[#71717A]'>
                {accounts.length} account{accounts.length > 1 ? 's' : ''} connected
              </span>
            </div>
          )}
        </div>

        {/* Token encryption notice */}
        <div className='mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-[0.78rem] text-amber-700'>
          <strong>Before connecting accounts:</strong> Make sure <code className='bg-amber-100 px-1 rounded'>TOKEN_ENCRYPTION_KEY</code> is set in your <code className='bg-amber-100 px-1 rounded'>.env.local</code> — run <code className='bg-amber-100 px-1 rounded'>openssl rand -hex 32</code> to generate one.
        </div>

        {/* Platform grid */}
        <div className='space-y-3'>
          {PLATFORMS.map((platform) => (
            <PlatformCard
              key={platform.key}
              platform={platform}
              account={accountByPlatform(platform.key)}
              onDisconnect={handleDisconnect}
            />
          ))}
        </div>

        {/* LinkedIn setup note */}
        <div className='mt-6 px-4 py-3 bg-[#F4F4F5] rounded-xl text-[0.78rem] text-[#71717A]'>
          <strong>LinkedIn setup:</strong> Create an app at <code className='bg-white px-1 rounded'>developer.linkedin.com</code>, add products <em>Share on LinkedIn</em> + <em>Sign In with LinkedIn</em>, set redirect URL to <code className='bg-white px-1 rounded'>{'{NEXT_PUBLIC_APP_URL}'}/api/social/callback/linkedin</code>, then add <code className='bg-white px-1 rounded'>LINKEDIN_CLIENT_ID</code> and <code className='bg-white px-1 rounded'>LINKEDIN_CLIENT_SECRET</code> to <code className='bg-white px-1 rounded'>.env.local</code>.
        </div>
      </div>
    </div>
  )
}
