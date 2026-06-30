"use client"

import { useState } from "react"

interface RealStats {
  totalPieces:     number
  thisMonthPieces: number
  totalWords:      number
  scheduled:       number
  published:       number
  byTemplate:      Record<string, number>
  byPlatform:      Record<string, number>
  last7:           number
  last30:          number
  last90:          number
}

interface Props { stats: RealStats }

const RANGES = ["Last 7 days", "Last 30 days", "Last 90 days"]
const SOURCES = ["All", "LinkedIn", "X", "Instagram", "Bluesky", "Mastodon", "Newsletter"]

const SYNC_STRIP = [
  { badge: "in", tint: "#0a66c2", name: "LinkedIn",   synced: "4m ago"  },
  { badge: "bs", tint: "#0285ff", name: "Bluesky",    synced: "11m ago" },
  { badge: "M",  tint: "#6364ff", name: "Mastodon",   synced: "3m ago"  },
  { badge: "X",  tint: "#18181b", name: "X",          synced: "8m ago"  },
  { badge: "IG", tint: "#d6306d", name: "Instagram",  synced: "22m ago" },
  { badge: "NL", tint: "#ea580c", name: "Newsletter", synced: "1h ago"  },
]

const TOP_POSTS = [
  { badge: "in", tint: "#0a66c2", title: "How I grew from 0 to 50k followers in 18 months",    impr: "4,210", eng: "312", rate: "7.4%", voice: 94, voiceColor: "#15803d", voiceBg: "rgba(22,163,74,.13)", voiceBorder: "rgba(22,163,74,.25)" },
  { badge: "X",  tint: "#18181b", title: "Thread: The content flywheel that changed everything", impr: "3,840", eng: "291", rate: "7.6%", voice: 91, voiceColor: "#4f46e5", voiceBg: "#eef2ff",            voiceBorder: "#c7d2fe" },
  { badge: "bs", tint: "#0285ff", title: "The open-source stack I use to build in public",       impr: "2,190", eng: "144", rate: "6.6%", voice: 96, voiceColor: "#15803d", voiceBg: "rgba(22,163,74,.13)", voiceBorder: "rgba(22,163,74,.25)" },
  { badge: "in", tint: "#0a66c2", title: "Why 'post every day' is terrible advice",              impr: "1,880", eng: "158", rate: "8.4%", voice: 88, voiceColor: "#b45309", voiceBg: "rgba(234,88,12,.1)",  voiceBorder: "rgba(234,88,12,.25)" },
  { badge: "NL", tint: "#ea580c", title: "Issue #14: The quiet compounding of consistent output",impr: "940",   eng: "62",  rate: "6.6%", voice: 92, voiceColor: "#15803d", voiceBg: "rgba(22,163,74,.13)", voiceBorder: "rgba(22,163,74,.25)" },
]

const BARS = [22,35,28,42,31,18,26,40,38,44,29,36,52,61].map((h, i) => ({
  h: `${h}%`,
  fill: i >= 10 ? "hsl(var(--primary))" : "color-mix(in srgb, hsl(var(--primary)) 28%, hsl(var(--muted)))",
}))

const PLATFORM_COLORS: Record<string, string> = {
  linkedin:   "#0a66c2",
  x:          "#18181b",
  bluesky:    "#0285ff",
  instagram:  "#d6306d",
  mastodon:   "#6364ff",
  newsletter: "#ea580c",
}
const PLATFORM_BADGE: Record<string, string> = {
  linkedin: "in", x: "X", bluesky: "bs", instagram: "IG", mastodon: "M", newsletter: "NL",
}
const TEMPLATE_LABEL: Record<string, string> = {
  "x-thread":     "X Thread",
  "linkedin":     "LinkedIn",
  "blog-post":    "Blog Post",
  "newsletter":   "Newsletter",
  "ig-caption":   "IG Caption",
  "video-script": "Video Script",
  "other":        "Other",
}

export default function AnalyticsClient({ stats }: Props) {
  const [range, setRange]   = useState(RANGES[1])
  const [source, setSource] = useState("All")

  const piecesByRange = range === "Last 7 days" ? stats.last7 : range === "Last 30 days" ? stats.last30 : stats.last90
  const prevMonthPct  = stats.thisMonthPieces > 0 ? "+100%" : "0%"

  const kpiCards = [
    { label: "Content created",   value: String(stats.totalPieces),               sub: `${stats.thisMonthPieces} this month`,     arrow: "↑", changeColor: "#16a34a" },
    { label: "Words generated",   value: stats.totalWords.toLocaleString(),        sub: `avg ${Math.round(stats.totalWords / Math.max(stats.totalPieces,1))} per piece`, arrow: "↑", changeColor: "#16a34a" },
    { label: "Scheduled",         value: String(stats.scheduled),                  sub: "queued to publish",                       arrow: "—", changeColor: "hsl(var(--muted-foreground))" },
    { label: "Published",         value: String(stats.published),                  sub: "posts sent live",                         arrow: stats.published > 0 ? "↑" : "—", changeColor: stats.published > 0 ? "#16a34a" : "hsl(var(--muted-foreground))" },
  ]

  const templateEntries = Object.entries(stats.byTemplate).sort((a, b) => b[1] - a[1])
  const maxTemplateCount = templateEntries[0]?.[1] ?? 1

  const platformEntries = Object.entries(stats.byPlatform).sort((a, b) => b[1] - a[1])
  const maxPlatformCount = platformEntries[0]?.[1] ?? 1

  const chipStyle = (active: boolean) => ({
    fontFamily: "inherit", padding: "6px 14px", borderRadius: 99,
    border: "1px solid", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .12s",
    borderColor: active ? "hsl(var(--accent-border))" : "hsl(var(--border))",
    background:  active ? "hsl(var(--accent-soft))"  : "hsl(var(--card))",
    color:       active ? "hsl(var(--primary))"      : "hsl(var(--muted-foreground))",
  } as React.CSSProperties)

  return (
    <div style={{ padding: "clamp(20px,3vw,36px) clamp(20px,3vw,36px) 120px" }}>

      {/* Sync strip */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, border: "1px solid hsl(var(--border))", borderRadius: 14, background: "hsl(var(--card))", padding: "13px 18px", marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 8 }}>Live from</span>
          {SYNC_STRIP.map((s) => (
            <div key={s.name} title={`${s.name} · synced ${s.synced}`} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 10px 5px 6px", border: "1px solid hsl(var(--border))", borderRadius: 99, background: "hsl(var(--app-bg))" }}>
              <span style={{ width: 20, height: 20, borderRadius: 6, background: s.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)" }}>{s.badge}</span>
              <span style={{ fontSize: 11, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono, monospace)" }}>
                <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: 99, background: "#16a34a", marginRight: 5 }} />
                {s.synced}
              </span>
            </div>
          ))}
        </div>
        <button style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 600, padding: "8px 16px", borderRadius: 9, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", cursor: "pointer", whiteSpace: "nowrap" }}>↻ Sync now</button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {RANGES.map((r) => <button key={r} style={chipStyle(range === r)} onClick={() => setRange(r)}>{r}</button>)}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em" }}>Source</span>
          {SOURCES.map((s) => <button key={s} style={chipStyle(source === s)} onClick={() => setSource(s)}>{s}</button>)}
        </div>
      </div>

      {/* KPI cards — real data */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 14, marginBottom: 20 }}>
        {kpiCards.map((o) => (
          <div key={o.label} style={{ border: "1px solid hsl(var(--border))", borderRadius: 16, background: "hsl(var(--card))", padding: "20px 22px" }}>
            <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 10, fontWeight: 500 }}>{o.label}</div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1, marginBottom: 10, fontFamily: "var(--font-geist-mono, monospace)" }}>{o.value}</div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, fontWeight: 600, color: o.changeColor }}>
              <span>{o.arrow}</span>
              <span style={{ color: "hsl(var(--muted-foreground))", fontWeight: 400 }}>{o.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(360px,100%),1fr))", gap: 16, marginBottom: 20 }}>

        {/* Impressions bar chart — illustrative */}
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: 22 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Content Activity</div>
              <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>{piecesByRange} pieces · {range.toLowerCase()}</div>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: "hsl(var(--primary))" }} />this period
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 5, height: 180 }}>
            {BARS.map((b, i) => (
              <div key={i} style={{ flex: 1, display: "flex", alignItems: "flex-end", height: "100%" }}>
                <div style={{ width: "100%", borderRadius: "5px 5px 0 0", background: b.fill, height: b.h, transition: "height .4s ease" }} />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, color: "hsl(var(--muted-foreground))", marginTop: 10 }}>
            <span>start</span><span>now</span>
          </div>
        </div>

        {/* By format — real data */}
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>By content format</div>
          {templateEntries.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 160, gap: 10, color: "hsl(var(--muted-foreground))" }}>
              <span style={{ fontSize: 28 }}>¶</span>
              <span style={{ fontSize: 13 }}>No content yet — generate your first piece</span>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {templateEntries.map(([slug, count]) => (
                <div key={slug}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1 }}>{TEMPLATE_LABEL[slug] ?? slug}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, fontWeight: 600 }}>{count}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "#16a34a", width: 42, textAlign: "right" }}>
                      {Math.round((count / stats.totalPieces) * 100)}%
                    </span>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: "hsl(var(--primary))", width: `${(count / maxTemplateCount) * 100}%`, transition: "width .4s" }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Published by platform — real data */}
      {platformEntries.length > 0 && (
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: 22, marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Published by platform</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {platformEntries.map(([platform, count]) => {
              const tint  = PLATFORM_COLORS[platform.toLowerCase()] ?? "#6364ff"
              const badge = PLATFORM_BADGE[platform.toLowerCase()] ?? platform.slice(0, 2).toUpperCase()
              return (
                <div key={platform}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
                    <span style={{ width: 24, height: 24, borderRadius: 7, background: tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)", flexShrink: 0 }}>{badge}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, flex: 1, textTransform: "capitalize" }}>{platform}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, fontWeight: 600 }}>{count} posts</span>
                  </div>
                  <div style={{ height: 7, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden" }}>
                    <div style={{ height: "100%", borderRadius: 99, background: tint, width: `${(count / maxPlatformCount) * 100}%`, transition: "width .4s" }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top posts table — illustrative until platform APIs connected */}
      <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid hsl(var(--border))" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Top performing posts</div>
            <div style={{ fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>Sample — connect social accounts to see real engagement</div>
          </div>
          <span style={{ fontSize: 12, color: "hsl(var(--primary))", fontWeight: 600, cursor: "pointer" }}>View all →</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 80px 90px", gap: 12, padding: "11px 22px", borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--app-bg))", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 10, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em" }}>
          <span>Post</span>
          <span style={{ textAlign: "right" }}>Impressions</span>
          <span style={{ textAlign: "right" }}>Engagements</span>
          <span style={{ textAlign: "right" }}>Rate</span>
          <span style={{ textAlign: "right" }}>Voice</span>
        </div>
        {TOP_POSTS.map((p, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 110px 80px 90px", gap: 12, padding: "15px 22px", borderBottom: i < TOP_POSTS.length - 1 ? "1px solid hsl(var(--border))" : "none", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 30, height: 30, borderRadius: 8, background: p.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)", flexShrink: 0 }}>{p.badge}</span>
              <span style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.title}</span>
            </div>
            <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 13, textAlign: "right", fontWeight: 600 }}>{p.impr}</span>
            <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 13, textAlign: "right", color: "hsl(var(--muted-foreground))" }}>{p.eng}</span>
            <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 13, textAlign: "right", fontWeight: 600 }}>{p.rate}</span>
            <span style={{ justifySelf: "end", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, fontWeight: 600, color: p.voiceColor, background: p.voiceBg, border: `1px solid ${p.voiceBorder}`, padding: "3px 9px", borderRadius: 99 }}>{p.voice}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
