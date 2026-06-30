import Link from "next/link"
import ThemeToggle from "./_components/ThemeToggle"

const FAN_POSTS = [
  { badge: "in",  tint: "#0a66c2", name: "LinkedIn",   voice: "94" },
  { badge: "X",   tint: "#18181b", name: "X Thread",   voice: "91" },
  { badge: "IG",  tint: "#d6306d", name: "Instagram",  voice: "88" },
  { badge: "bs",  tint: "#0285ff", name: "Bluesky",    voice: "96" },
]

const PLATFORMS = [
  { badge: "in", tint: "#0a66c2", name: "LinkedIn"   },
  { badge: "X",  tint: "#18181b", name: "X"          },
  { badge: "IG", tint: "#d6306d", name: "Instagram"  },
  { badge: "bs", tint: "#0285ff", name: "Bluesky"    },
  { badge: "M",  tint: "#6364ff", name: "Mastodon"   },
  { badge: "NL", tint: "#ea580c", name: "Newsletter" },
]

const STEPS = [
  { n: "1", tag: "Ingest",   title: "Drop in your source",  body: "Paste a YouTube link, upload a PDF, or type your idea. We extract the signal." },
  { n: "2", tag: "Repurpose",title: "Contentify writes it", body: "AI rewrites it for each platform in your tone — threads, carousels, newsletters, and more." },
  { n: "3", tag: "Schedule", title: "Schedule & learn",     body: "Push to all connected accounts at once. We watch what performs and sharpen your voice model." },
]

const DIFFS = [
  { icon: "🎙", title: "Voice fidelity",  body: "Trained on your best-performing posts, not a generic style guide." },
  { icon: "📈", title: "Feedback loop",   body: "Every published post feeds back in — engagement data refines the next batch." },
  { icon: "⚡", title: "One click, six platforms", body: "Write once, distribute everywhere — LinkedIn, X, Instagram, Bluesky, Mastodon, Newsletter." },
]

const TESTIMONIALS = [
  { quote: "I used to spend Sundays scheduling posts manually. Now I paste one article on Monday and my whole week is done in ten minutes.", name: "Priya K.", role: "Indie founder, SaaS", initials: "PK", tint: "#0a66c2" },
  { quote: "The voice-matching is uncanny. My LinkedIn audience can't tell the difference — they think I'm just more prolific.", name: "Marcus B.", role: "Content strategist", initials: "MB", tint: "#6364ff" },
  { quote: "Finally a tool that understands Mastodon isn't just a smaller Twitter. The platform-native prompts are spot on.", name: "Saoirse M.", role: "Open-source maintainer", initials: "SM", tint: "#d6306d" },
]

const PERF_BARS = [
  { h: "32%", fill: "hsl(var(--muted))" },
  { h: "55%", fill: "hsl(var(--muted))" },
  { h: "43%", fill: "hsl(var(--muted))" },
  { h: "61%", fill: "hsl(var(--muted))" },
  { h: "38%", fill: "hsl(var(--muted))" },
  { h: "72%", fill: "hsl(var(--primary))" },
  { h: "88%", fill: "hsl(var(--primary))" },
]

const TIERS = [
  {
    name: "Free", price: "$0", per: "/ month",
    tagline: "Get started, no card required.",
    features: ["5 sources / month", "1 platform connection", "Manual publishing only", "Content library (5 posts)"],
    cta: "Start free", featured: false,
    border: "hsl(var(--border))", nameColor: "hsl(var(--foreground))",
    btnBg: "hsl(var(--muted))", btnFg: "hsl(var(--foreground))", shadow: "none",
  },
  {
    name: "Creator", price: "$29", per: "/ month",
    tagline: "For individuals who publish consistently.",
    features: ["30 sources / month", "All platform connections", "Scheduled auto-publishing", "Repurpose engine", "Analytics dashboard"],
    cta: "Start Creator", featured: true,
    border: "hsl(var(--primary))", nameColor: "hsl(var(--primary))",
    btnBg: "hsl(var(--primary))", btnFg: "#fff",
    shadow: "0 0 0 1px hsl(var(--primary)), 0 20px 56px -16px hsl(243 75% 59% / .45)",
  },
  {
    name: "Studio", price: "$79", per: "/ month",
    tagline: "For teams and agencies at scale.",
    features: ["Unlimited sources", "All platform connections", "Scheduled auto-publishing", "Repurpose engine", "Team seats (up to 5)", "Priority support"],
    cta: "Start Studio", featured: false,
    border: "hsl(var(--border))", nameColor: "hsl(var(--foreground))",
    btnBg: "hsl(var(--primary))", btnFg: "#fff", shadow: "none",
  },
]

const FOOTER_COLS = [
  { title: "Product", links: ["How it works", "Features", "Pricing", "Changelog"] },
  { title: "Company", links: ["About", "Blog", "Careers", "Press"] },
  { title: "Legal",   links: ["Privacy", "Terms", "Cookies"] },
]

function LogoIcon({ size = 32 }: { size?: number }) {
  const s = Math.round(size * 0.43)
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.27), background: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 10px color-mix(in srgb, hsl(var(--primary)) 40%, transparent)" }}>
      <div style={{ width: s, height: s, border: "2.5px solid #fff", borderRadius: 4, borderTopColor: "transparent", transform: "rotate(45deg)" }} />
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: "hsl(var(--app-bg))", color: "hsl(var(--foreground))", fontFamily: "var(--font-geist-sans, system-ui, sans-serif)" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, backdropFilter: "blur(14px)", background: "color-mix(in srgb, hsl(var(--background)) 82%, transparent)", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="lp-wrap" style={{ paddingTop: 16, paddingBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LogoIcon size={32} />
            <span style={{ fontWeight: 700, fontSize: 18, letterSpacing: "-.02em" }}>Contentify</span>
          </div>

          <nav className="lp-nav-links" style={{ fontSize: 15, color: "hsl(var(--muted-foreground))" }}>
            <a href="#how"      style={{ textDecoration: "none", color: "inherit" }}>How it works</a>
            <a href="#features" style={{ textDecoration: "none", color: "inherit" }}>Features</a>
            <a href="#pricing"  style={{ textDecoration: "none", color: "inherit" }}>Pricing</a>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <ThemeToggle />
            <Link href="/sign-in" style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", textDecoration: "none", whiteSpace: "nowrap" }}>Log in</Link>
            <Link href="/sign-up" style={{ fontFamily: "inherit", fontSize: 15, fontWeight: 600, padding: "10px 20px", borderRadius: 9, border: "none", background: "hsl(var(--primary))", color: "#fff", textDecoration: "none", whiteSpace: "nowrap", boxShadow: "0 1px 4px rgba(0,0,0,.12)" }}>Start free</Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: "clamp(56px,8vw,112px)", paddingBottom: "clamp(48px,6vw,80px)" }}>
        <div className="lp-wrap">
          <div className="lp-hero-grid">
            {/* Left copy */}
            <div className="animate-rise">
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "7px 14px", borderRadius: 99, border: "1px solid hsl(var(--accent-border))", background: "hsl(var(--accent-soft))", color: "hsl(var(--primary))", fontSize: 14, fontWeight: 500, marginBottom: 28 }}>
                <span style={{ width: 7, height: 7, borderRadius: 99, background: "hsl(var(--primary))" }} />
                Learns your voice. Gets sharper weekly.
              </div>
              <h1 style={{ fontSize: "clamp(44px,6.2vw,80px)", lineHeight: 1.03, letterSpacing: "-.038em", fontWeight: 700, margin: "0 0 24px" }}>
                One source in.<br />
                A <span style={{ color: "hsl(var(--primary))" }}>week of content</span><br />
                out — in your voice.
              </h1>
              <p style={{ fontSize: "clamp(17px,1.8vw,22px)", lineHeight: 1.55, color: "hsl(var(--muted-foreground))", margin: "0 0 36px", maxWidth: "28em" }}>
                Drop a YouTube video, a blog post, or a PDF. Contentify turns it into platform-native posts that actually sound like you — then learns from what performs.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, alignItems: "center" }}>
                <Link href="/sign-up" style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 600, padding: "15px 28px", borderRadius: 11, border: "none", background: "hsl(var(--primary))", color: "#fff", textDecoration: "none", boxShadow: "0 4px 18px color-mix(in srgb, hsl(var(--primary)) 38%, transparent)" }}>Start free →</Link>
                <Link href="/dashboard/repurpose" style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 500, padding: "15px 24px", borderRadius: 11, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", textDecoration: "none" }}>See it in action</Link>
              </div>
              <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", margin: "20px 0 0" }}>No credit card · 5 sources free every month</p>
            </div>

            {/* Right fan-out visual */}
            <div className="animate-rise" style={{ animationDelay: ".1s" }}>
              <div className="lp-fan-grid">
                {/* Source card */}
                <div style={{ width: "clamp(148px,17vw,210px)", border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: 18, boxShadow: "0 14px 40px -14px rgba(0,0,0,.22)" }}>
                  <div style={{ aspectRatio: "16/10", borderRadius: 11, background: "linear-gradient(135deg, color-mix(in srgb, hsl(var(--primary)) 18%, hsl(var(--muted))), hsl(var(--muted)))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 99, background: "hsl(var(--card))", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(0,0,0,.18)" }}>
                      <div style={{ width: 0, height: 0, borderLeft: "13px solid hsl(var(--primary))", borderTop: "8px solid transparent", borderBottom: "8px solid transparent", marginLeft: 3 }} />
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 5 }}>How I grew to 50k subs</div>
                  <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>youtube · 18:42</div>
                </div>

                {/* Platform cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {FAN_POSTS.map((p, i) => (
                    <div key={p.name} className="animate-fan" style={{ animationDelay: `${i * 0.12}s`, border: "1px solid hsl(var(--border))", borderRadius: 13, background: "hsl(var(--card))", padding: "13px 15px", display: "flex", gap: 12, alignItems: "center", boxShadow: "0 6px 20px -10px rgba(0,0,0,.18)" }}>
                      <div style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 9, background: p.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)" }}>{p.badge}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 7 }}>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
                          <span style={{ fontSize: 11, fontFamily: "var(--font-geist-mono, monospace)", color: "hsl(var(--primary))", background: "hsl(var(--accent-soft))", padding: "2px 7px", borderRadius: 99, border: "1px solid hsl(var(--accent-border))" }}>{p.voice}</span>
                        </div>
                        <div style={{ height: 5, borderRadius: 99, background: "hsl(var(--muted))", marginBottom: 5 }} />
                        <div style={{ height: 5, width: "68%", borderRadius: 99, background: "hsl(var(--muted))" }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform strip ──────────────────────────────────────────────── */}
      <section style={{ paddingBottom: "clamp(52px,7vw,88px)" }}>
        <div className="lp-wrap">
          <p style={{ textAlign: "center", fontSize: 13, letterSpacing: ".12em", textTransform: "uppercase", color: "hsl(var(--muted-foreground))", margin: "0 0 24px", fontFamily: "var(--font-geist-mono, monospace)" }}>Publishes natively to</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12 }}>
            {PLATFORMS.map((p) => (
              <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 20px", border: "1px solid hsl(var(--border))", borderRadius: 11, background: "hsl(var(--card))" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: p.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)" }}>{p.badge}</div>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section id="how" style={{ background: "hsl(var(--background))", borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="lp-wrap" style={{ paddingTop: "clamp(60px,8vw,100px)", paddingBottom: "clamp(60px,8vw,100px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(44px,5vw,68px)" }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--primary))", margin: "0 0 14px", letterSpacing: ".04em", textTransform: "uppercase" }}>How it works</p>
            <h2 style={{ fontSize: "clamp(32px,4.2vw,54px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 700, margin: 0 }}>Three steps. Then it runs itself.</h2>
          </div>
          <div className="lp-steps-grid">
            {STEPS.map((s) => (
              <div key={s.n} style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: "clamp(22px,2.8vw,36px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 20 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: "hsl(var(--accent-soft))", color: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)", fontSize: 17, border: "1px solid hsl(var(--accent-border))", flexShrink: 0 }}>{s.n}</div>
                  <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".08em" }}>{s.tag}</span>
                </div>
                <h3 style={{ fontSize: "clamp(18px,1.8vw,23px)", fontWeight: 600, letterSpacing: "-.02em", margin: "0 0 12px" }}>{s.title}</h3>
                <p style={{ fontSize: 16, lineHeight: 1.6, color: "hsl(var(--muted-foreground))", margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Differentiator ──────────────────────────────────────────────── */}
      <section id="features">
        <div className="lp-wrap" style={{ paddingTop: "clamp(60px,8vw,100px)", paddingBottom: "clamp(60px,8vw,100px)" }}>
          <div className="lp-diff-grid">
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: "hsl(var(--primary))", margin: "0 0 14px", letterSpacing: ".06em", textTransform: "uppercase" }}>Not just another AI writer</p>
              <h2 style={{ fontSize: "clamp(28px,3.8vw,50px)", lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 700, margin: "0 0 22px" }}>
                Generic tools sound like a robot wrote it. Contentify sounds like <span style={{ color: "hsl(var(--primary))" }}>you</span>.
              </h2>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "hsl(var(--muted-foreground))", margin: "0 0 32px" }}>
                Two things make the difference: a voice model trained on your best work, and a feedback loop that watches what actually lands.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
                {DIFFS.map((d) => (
                  <div key={d.title} style={{ display: "flex", gap: 16 }}>
                    <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 11, background: "hsl(var(--accent-soft))", color: "hsl(var(--primary))", border: "1px solid hsl(var(--accent-border))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{d.icon}</div>
                    <div>
                      <h4 style={{ fontSize: 17, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-.01em" }}>{d.title}</h4>
                      <p style={{ fontSize: 15, lineHeight: 1.55, color: "hsl(var(--muted-foreground))", margin: 0 }}>{d.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Voice + perf card */}
            <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 22, background: "hsl(var(--card))", padding: "clamp(22px,2.8vw,36px)", boxShadow: "0 28px 72px -28px rgba(0,0,0,.28)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>Voice match</span>
                <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 15, fontWeight: 700, color: "hsl(var(--primary))" }}>94 / 100</span>
              </div>
              <div style={{ height: 9, borderRadius: 99, background: "hsl(var(--muted))", overflow: "hidden", marginBottom: 28 }}>
                <div style={{ height: "100%", width: "94%", borderRadius: 99, background: "linear-gradient(90deg, hsl(var(--primary)), color-mix(in srgb, hsl(var(--primary)) 60%, #22d3ee))" }} />
              </div>
              <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 14 }}>This week vs. last</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 9, height: 140, marginBottom: 10 }}>
                {PERF_BARS.map((b, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                    <div style={{ width: "100%", borderRadius: "7px 7px 0 0", background: b.fill, height: b.h }} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))" }}>
                <span>Engagement +38%</span><span>since launch</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section style={{ background: "hsl(var(--background))", borderTop: "1px solid hsl(var(--border))", borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="lp-wrap" style={{ paddingTop: "clamp(56px,7vw,92px)", paddingBottom: "clamp(56px,7vw,92px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(36px,4vw,56px)" }}>
            <h2 style={{ fontSize: "clamp(28px,3.8vw,48px)", lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 700, margin: 0 }}>What creators are saying</h2>
          </div>
          <div className="lp-test-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: "clamp(22px,2.4vw,30px)", display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: "clamp(15px,1.4vw,18px)", lineHeight: 1.6, margin: "0 0 24px", letterSpacing: "-.01em" }}>&ldquo;{t.quote}&rdquo;</p>
                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 99, background: t.tint, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 16, flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: "hsl(var(--muted-foreground))" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section id="pricing">
        <div className="lp-wrap" style={{ paddingTop: "clamp(60px,8vw,100px)", paddingBottom: "clamp(60px,8vw,100px)" }}>
          <div style={{ textAlign: "center", marginBottom: "clamp(40px,5vw,60px)" }}>
            <h2 style={{ fontSize: "clamp(32px,4.2vw,54px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 700, margin: "0 0 14px" }}>Start free. Scale when it works.</h2>
            <p style={{ fontSize: 18, color: "hsl(var(--muted-foreground))", margin: 0 }}>No contracts. Cancel anytime.</p>
          </div>
          <div className="lp-price-grid">
            {TIERS.map((t) => (
              <div key={t.name} style={{ border: `1px solid ${t.border}`, borderRadius: 20, background: "hsl(var(--card))", padding: "clamp(24px,2.8vw,36px)", display: "flex", flexDirection: "column", position: "relative", boxShadow: t.shadow }}>
                {t.featured && (
                  <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "hsl(var(--primary))", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 14px", borderRadius: 99, fontFamily: "var(--font-geist-mono, monospace)", whiteSpace: "nowrap", letterSpacing: ".04em" }}>MOST POPULAR</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: t.nameColor }}>{t.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 8 }}>
                  <span style={{ fontSize: "clamp(40px,4vw,52px)", fontWeight: 700, letterSpacing: "-.03em" }}>{t.price}</span>
                  <span style={{ fontSize: 15, color: "hsl(var(--muted-foreground))" }}>{t.per}</span>
                </div>
                <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", margin: "0 0 24px", minHeight: 36 }}>{t.tagline}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 28 }}>
                  {t.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 15 }}>
                      <span style={{ color: "hsl(var(--primary))", fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <Link href="/sign-up" style={{ marginTop: "auto", width: "100%", display: "block", boxSizing: "border-box", textAlign: "center", fontSize: 15, fontWeight: 600, padding: "14px", borderRadius: 11, border: "none", background: t.btnBg, color: t.btnFg, textDecoration: "none" }}>{t.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────── */}
      <section style={{ background: "hsl(var(--primary))" }}>
        <div className="lp-wrap" style={{ paddingTop: "clamp(48px,6vw,80px)", paddingBottom: "clamp(48px,6vw,80px)", textAlign: "center" }}>
          <h2 style={{ fontSize: "clamp(28px,4vw,52px)", lineHeight: 1.1, letterSpacing: "-.03em", fontWeight: 700, color: "#fff", margin: "0 0 16px" }}>Ready to sound like yourself at scale?</h2>
          <p style={{ fontSize: "clamp(16px,1.6vw,19px)", color: "rgba(255,255,255,.75)", margin: "0 0 32px" }}>Join thousands of creators who stopped writing from scratch.</p>
          <Link href="/sign-up" style={{ fontFamily: "inherit", fontSize: 16, fontWeight: 600, padding: "15px 32px", borderRadius: 11, border: "none", background: "#fff", color: "hsl(var(--primary))", textDecoration: "none", display: "inline-block" }}>Get started free →</Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}>
        <div className="lp-wrap lp-foot-grid" style={{ paddingTop: "clamp(40px,5vw,64px)", paddingBottom: "clamp(40px,5vw,64px)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <LogoIcon size={30} />
              <span style={{ fontWeight: 700, fontSize: 17 }}>Contentify</span>
            </div>
            <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.6, margin: 0 }}>One source in. A week of content out — in your voice.</p>
          </div>
          {FOOTER_COLS.map((col) => (
            <div key={col.title}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{col.title}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {col.links.map((l) => (
                  <span key={l} style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", cursor: "pointer" }}>{l}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid hsl(var(--border))" }}>
          <div className="lp-wrap" style={{ paddingTop: 20, paddingBottom: 20, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "space-between", fontSize: 13, color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-geist-mono, monospace)" }}>
            <span>© 2026 Contentify, Inc.</span>
            <span>Privacy · Terms</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
