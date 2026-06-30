"use client"

import { UserButton } from "@clerk/nextjs"
import { usePathname } from "next/navigation"
import ThemeToggle from "@/app/_components/ThemeToggle"

const TITLES: Record<string, { title: string; sub: string }> = {
  "/dashboard":             { title: "Dashboard",   sub: "What are we turning into content today?" },
  "/dashboard/repurpose":   { title: "Repurpose",   sub: "Turn one source into 5 platform-native posts" },
  "/dashboard/history":     { title: "My Content",  sub: "All your generated and scheduled posts" },
  "/dashboard/analytics":   { title: "Analytics",   sub: "Performance across all platforms" },
  "/dashboard/connections": { title: "Connections", sub: "Manage your connected social accounts" },
}

// Overlapping connected-account avatars (placeholder - design detail)
const CONNECTED = [
  { badge: "in", tint: "#0a66c2", name: "LinkedIn"  },
  { badge: "bs", tint: "#0285ff", name: "Bluesky"   },
  { badge: "M",  tint: "#6364ff", name: "Mastodon"  },
]

export default function DashboardHeader() {
  const pathname = usePathname()
  const { title, sub } = TITLES[pathname] ?? { title: "Dashboard", sub: "" }

  return (
    <header style={{ height: 60, flexShrink: 0, borderBottom: "1px solid hsl(var(--border))", background: "color-mix(in srgb, hsl(var(--background)) 85%, transparent)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 clamp(16px,2.5vw,28px)", position: "sticky", top: 0, zIndex: 20 }}>
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 600, letterSpacing: "-.01em", margin: 0, whiteSpace: "nowrap" }}>{title}</h1>
        <span style={{ fontSize: 13, color: "hsl(var(--muted-foreground))", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</span>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <ThemeToggle />
        {/* Connected account avatar stack */}
        <div style={{ display: "flex", alignItems: "center", marginRight: 4 }}>
          {CONNECTED.map((a, i) => (
            <div key={a.name} title={a.name} style={{ width: 30, height: 30, borderRadius: 99, background: a.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)", border: "2px solid hsl(var(--background))", marginLeft: i === 0 ? 0 : -8 }}>
              {a.badge}
            </div>
          ))}
        </div>
        <UserButton afterSignOutUrl="/" />
      </div>
    </header>
  )
}
