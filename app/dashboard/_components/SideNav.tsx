"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

const NAV = [
  { icon: "◈", label: "Dashboard",   path: "/dashboard",             count: null },
  { icon: "✦", label: "Repurpose",   path: "/dashboard/repurpose",   count: null },
  { icon: "▦", label: "My Content",  path: "/dashboard/history",     count: "24" },
  { icon: "◢", label: "Analytics",   path: "/dashboard/analytics",   count: null },
  { icon: "⚯", label: "Connections", path: "/dashboard/connections", count: "5"  },
]

function LogoIcon() {
  return (
    <div style={{ width: 30, height: 30, borderRadius: 8, background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      <div style={{ width: 13, height: 13, border: "2.5px solid #fff", borderRadius: 4, borderTopColor: "transparent", transform: "rotate(45deg)" }} />
    </div>
  )
}

export default function SideNav() {
  const pathname = usePathname()
  const router   = useRouter()

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", paddingBottom: 14 }}>
      {/* Logo */}
      <div
        onClick={() => router.push("/")}
        style={{ padding: "18px 18px 14px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
      >
        <LogoIcon />
        <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-.02em" }}>Contentify</span>
      </div>

      {/* New content button */}
      <div style={{ padding: "0 12px 4px" }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ fontFamily: "inherit", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 14, fontWeight: 600, padding: 10, borderRadius: 9, border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer", boxShadow: "0 1px 2px rgba(0,0,0,.1)" }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New content
        </button>
      </div>

      {/* Nav items */}
      <nav style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: 3 }}>
        {NAV.map(({ icon, label, path, count }) => {
          const active = pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
          return (
            <Link
              key={path}
              href={path}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8,
                fontSize: 14, fontWeight: active ? 600 : 400,
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                background: active ? "hsl(var(--accent-soft))" : "transparent",
                textDecoration: "none", transition: "background .1s, color .1s",
              }}
            >
              <span style={{ width: 18, textAlign: "center", fontSize: 15 }}>{icon}</span>
              <span style={{ flex: 1 }}>{label}</span>
              {count && (
                <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))", padding: "1px 7px", borderRadius: 99 }}>{count}</span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Usage card */}
      <div style={{ marginTop: "auto", padding: 14 }}>
        <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 12, padding: 14, background: "hsl(var(--card))" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Monthly sources</span>
            <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>12 / 30</span>
          </div>
          <div style={{ height: 6, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden", marginBottom: 10 }}>
            <div style={{ height: "100%", width: "40%", borderRadius: 99, background: "hsl(var(--primary))" }} />
          </div>
          <span style={{ fontSize: 12, color: "hsl(var(--primary))", fontWeight: 600, cursor: "pointer" }}>Upgrade plan →</span>
        </div>
      </div>
    </div>
  )
}
