"use client"

import { useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"

interface ContentItem {
  id: number
  templateSlug: string | null
  aiResponse: string | null
  createdAt: string
  userEmail: string | null
}

const STATUS_FILTERS = ["All", "Draft", "Scheduled", "Published"]
const PLATFORM_FILTERS = [
  { label: "All",       tint: null },
  { label: "LinkedIn",  tint: "#0a66c2", badge: "in" },
  { label: "X",         tint: "#18181b", badge: "X"  },
  { label: "Instagram", tint: "#d6306d", badge: "IG" },
  { label: "Bluesky",   tint: "#0285ff", badge: "bs" },
  { label: "Mastodon",  tint: "#6364ff", badge: "M"  },
  { label: "Newsletter",tint: "#ea580c", badge: "NL" },
]

const CONTENT_ICONS: Record<string, string> = {
  "x-thread": "▶", "linkedin": "¶", "blog-post": "¶",
  "newsletter": "⎙", "ig-caption": "▶", "video-script": "▶",
  "email": "⎙",
}

function wordCount(text: string | null) {
  return text?.trim().split(/\s+/).length ?? 0
}

export default function MyContentClient({ items }: { items: ContentItem[] }) {
  const [search, setSearch]     = useState("")
  const [statusF, setStatusF]   = useState("All")
  const [platformF, setPlatF]   = useState("All")

  const totalWords    = items.reduce((s, i) => s + wordCount(i.aiResponse), 0)
  const now           = new Date()
  const thisMonth     = items.filter((i) => {
    const d = new Date(i.createdAt)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const filtered = items.filter((item) => {
    const title = item.templateSlug?.replace(/-/g, " ") ?? "Content"
    const body  = item.aiResponse ?? ""
    if (search && !title.toLowerCase().includes(search.toLowerCase()) && !body.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const chipStyle = (active: boolean) => ({
    fontFamily: "inherit", padding: "6px 14px", borderRadius: 99,
    border: "1px solid", fontSize: 14, fontWeight: 500, cursor: "pointer",
    borderColor: active ? "hsl(var(--accent-border))" : "hsl(var(--border))",
    background: active ? "hsl(var(--accent-soft))" : "hsl(var(--card))",
    color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
  } as React.CSSProperties)

  return (
    <div style={{ padding: "clamp(20px,3vw,36px) clamp(20px,3vw,36px) 120px" }}>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(200px,100%),1fr))", gap: 14, marginBottom: 24 }}>
        {[
          { label: "Content created",   value: items.length,               sub: "total pieces" },
          { label: "Scheduled",         value: 0,                          sub: "queued posts" },
          { label: "Avg. voice match",  value: "94",                       sub: "out of 100" },
          { label: "Total words",       value: totalWords.toLocaleString(), sub: "generated" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid hsl(var(--border))", borderRadius: 16, background: "hsl(var(--card))", padding: "20px 22px" }}>
            <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", marginBottom: 10, fontWeight: 500 }}>{s.label}</div>
            <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.02em", lineHeight: 1, marginBottom: 10, fontFamily: "var(--font-geist-mono, monospace)" }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, flex: 1, minWidth: 240, maxWidth: 380, padding: "10px 14px", border: "1px solid hsl(var(--border))", borderRadius: 11, background: "hsl(var(--card))" }}>
          <Search size={15} color="hsl(var(--muted-foreground))" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search content…"
            style={{ fontFamily: "inherit", flex: 1, border: "none", outline: "none", background: "transparent", color: "hsl(var(--foreground))", fontSize: 15, minWidth: 0 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {STATUS_FILTERS.map((f) => (
            <button key={f} style={chipStyle(statusF === f)} onClick={() => setStatusF(f)}>{f}</button>
          ))}
        </div>
      </div>

      {/* Platform filter */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 4 }}>Platform</span>
        {PLATFORM_FILTERS.map((p) => (
          <button key={p.label} style={chipStyle(platformF === p.label)} onClick={() => setPlatF(p.label)}>
            {p.tint && (
              <span style={{ display: "inline-block", width: 13, height: 13, borderRadius: 3, background: p.tint, color: "#fff", fontSize: 8, fontWeight: 700, marginRight: 6, verticalAlign: "middle", textAlign: "center", lineHeight: "13px" }}>{p.badge}</span>
            )}
            {p.label}
          </button>
        ))}
      </div>

      {/* Bulk bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "12px 16px", border: "1px solid hsl(var(--border))", borderRadius: 12, background: "hsl(var(--app-bg))", marginBottom: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>
          <input type="checkbox" style={{ width: 16, height: 16, accentColor: "hsl(var(--primary))" }} />
          Select all
        </label>
        <div style={{ display: "flex", gap: 9 }}>
          {["Schedule selected", "Delete"].map((l) => (
            <button key={l} style={{ fontFamily: "inherit", fontSize: 13, fontWeight: 500, padding: "8px 14px", borderRadius: 9, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>{l}</button>
          ))}
        </div>
      </div>

      {/* Content rows */}
      {filtered.length === 0 ? (
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: "72px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>▦</div>
          <p style={{ fontWeight: 600, fontSize: 18, marginBottom: 10 }}>No content yet</p>
          <p style={{ color: "hsl(var(--muted-foreground))", fontSize: 15, marginBottom: 28 }}>Head to the Dashboard to generate your first piece.</p>
          <Link href="/dashboard" style={{ padding: "12px 24px", borderRadius: 11, background: "hsl(var(--primary))", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none" }}>✦ Generate content</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {filtered.map((item) => {
            const slug      = item.templateSlug ?? "content"
            const typeLabel = slug.split("-").map((w) => w[0]?.toUpperCase() + w.slice(1)).join(" ")
            const icon      = CONTENT_ICONS[slug] ?? "¶"
            const date      = new Date(item.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
            const preview   = (item.aiResponse ?? "").slice(0, 140)
            const words     = wordCount(item.aiResponse)

            return (
              <div
                key={item.id}
                style={{ border: "1px solid hsl(var(--border))", borderRadius: 16, background: "hsl(var(--card))", padding: "18px 20px", display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center", transition: "border-color .12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--accent-border))")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
              >
                {/* Left: checkbox + icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <input type="checkbox" style={{ width: 16, height: 16, accentColor: "hsl(var(--primary))" }} />
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "hsl(var(--accent-soft))", color: "hsl(var(--primary))", border: "1px solid hsl(var(--accent-border))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{icon}</div>
                </div>

                {/* Middle */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em" }}>{typeLabel}</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: "hsl(var(--muted-foreground))", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))", padding: "2px 9px", borderRadius: 99, fontFamily: "var(--font-geist-mono, monospace)" }}>
                      <span style={{ width: 6, height: 6, borderRadius: 99, background: "hsl(var(--muted-foreground))" }} />
                      Draft
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 7 }}>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{typeLabel.toLowerCase()} · {date}</span>
                    <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>{words.toLocaleString()} words</span>
                  </div>
                  <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{preview}{preview.length < (item.aiResponse?.length ?? 0) ? "…" : ""}</p>
                </div>

                {/* Right */}
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Link href="/dashboard/repurpose" style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", cursor: "pointer", whiteSpace: "nowrap", textDecoration: "none" }}>
                    Open →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
