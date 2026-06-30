# Handoff: Contentify — full app (7 screens, light + dark)

## Overview
Contentify is an AI content platform: drop one long-form source (YouTube / blog / PDF) →
get a week of platform-native content in the user's voice → it learns from performance.
This package specifies the **complete UI**: Landing, Login, Register, Dashboard,
Repurpose, Analytics, and My Content — in both light and dark mode.

## About the design files
`Contentify.dc.html` in this folder is a **design reference**, not production code to copy.
It's an interactive HTML prototype that shows the intended look, layout, copy, and behavior.
**Do not paste it into the app.** Your task is to **recreate these screens in the target
stack — Next.js (App Router) + Tailwind + shadcn/ui — using that stack's idioms.** Every
pattern below maps cleanly to a shadcn component; the prototype only used inline styles
because of its authoring format.

> If you open the `.dc.html` directly it needs its runtime to render. Easiest way to view it:
> use the rendered screenshots in `/screenshots` (if included) as the source of truth for pixels,
> and this README as the source of truth for values.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and radii below are final. Recreate
pixel-faithfully using shadcn components themed with the exact tokens in **Design Tokens**.
Do not invent new colors, fonts, or spacing.

---

## ⭐ The #1 thing that makes this look "exact": theme the tokens first
Most failed handoffs look wrong because the default shadcn theme (slate + black primary) is
left in place. **Before building any screen, overwrite the shadcn CSS variables** in
`globals.css` with the values below and set the font to Geist. Once `--primary` is indigo and
the neutrals are these specific zinc values, every shadcn component already looks 80% right.

```css
/* globals.css — replace shadcn's :root / .dark blocks with these */
:root {
  --background: 0 0% 100%;        /* page card surfaces  #ffffff */
  --app-bg:     240 5% 98%;       /* app canvas          #fafafa  (use bg-[hsl(var(--app-bg))]) */
  --foreground: 240 10% 4%;       /* text                #09090b */
  --card: 0 0% 100%;
  --card-foreground: 240 10% 4%;
  --muted: 240 5% 96%;            /* #f4f4f5 */
  --muted-foreground: 240 4% 46%; /* #71717a */
  --border: 240 6% 91%;           /* #e7e7ec */
  --input: 240 6% 91%;
  --primary: 243 75% 59%;         /* indigo #4f46e5 */
  --primary-foreground: 0 0% 100%;
  --accent-soft: 226 100% 97%;    /* #eef2ff (badges, soft fills) */
  --accent-border: 226 78% 86%;   /* #c7d2fe */
  --ring: 243 75% 59%;
  --radius: 0.625rem;             /* 10px base; cards step up to 14–18px */
}
.dark {
  --background: 240 7% 5%;        /* card #141417 → use 240 7% 8% for cards, 240 9% 4% for canvas */
  --app-bg: 240 9% 4%;           /* #09090b */
  --foreground: 0 0% 98%;        /* #fafafa */
  --card: 240 6% 8%;             /* #141417 */
  --card-foreground: 0 0% 98%;
  --muted: 240 6% 12%;           /* #1d1d22 */
  --muted-foreground: 240 5% 65%;/* #a1a1aa */
  --border: 240 4% 15%;          /* #262629 */
  --input: 240 4% 15%;
  --primary: 239 84% 67%;        /* indigo-500 #6366f1 — brighter on dark */
  --primary-foreground: 0 0% 100%;
  --accent-soft: 249 33% 16%;    /* #1e1b34 */
  --accent-border: 246 34% 29%;  /* #373063 */
  --ring: 239 84% 67%;
}
```

(HSL triples above are the shadcn convention; the source hex is in the comments and in
**Design Tokens**. If you prefer, paste the hex directly with the oklch/hex Tailwind v4 syntax —
just keep the exact colors.)

**Fonts:** Geist Sans everywhere, Geist Mono for data/labels/timestamps/counts.
```bash
# next/font
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
```
Use `font-mono` (Geist Mono) for: stat values, character counts, timestamps, "synced 4m ago",
uppercase eyebrow labels, table numbers, and the platform badge letters.

**Theme switching:** use `next-themes` (`class` strategy). The moon/sun toggle is in every header.

---

## Global building blocks (define once, reuse everywhere)

| Prototype element | Build with (shadcn) | Notes |
|---|---|---|
| Buttons | `Button` | `default` = indigo primary; `outline` = border + card bg; `ghost` for nav |
| Cards / panels | `Card` | radius 14–18px, border `--border`, subtle shadow `0 16px 44px -28px rgba(0,0,0,.2)` |
| Filter chips (Format, Status, Source, Platform) | `ToggleGroup` (single) or `Button` size sm | active = `bg-accent-soft text-primary border-accent-border` |
| Tone pills | `ToggleGroup` | active = inverted: `bg-foreground text-background` |
| Inputs / textarea | `Input`, `Textarea` | focus ring = `0 0 0 3px var(--accent-soft)` + `border-primary` |
| Avatars / connected accounts | `Avatar` | overlapping stack, `-ml-2`, 2px card-colored ring |
| Status badges | `Badge` | colors in **Status tokens** below; always dot + label, mono font |
| Tables (My Content rows, Analytics top posts) | `Table` or CSS grid | grid columns given per screen |
| Charts (Analytics) | **Recharts** (shadcn `Chart`) | bar chart for trend; horizontal bars for breakdown |
| Sidebar | shadcn `Sidebar` or custom 248px column | nav item active = `bg-accent-soft text-primary` |
| Toast on "Generate"/"Schedule" | `Sonner` | optional polish |

### Platform brand colors (badge backgrounds, white text)
| Platform | Hex | Badge text |
|---|---|---|
| LinkedIn | `#0a66c2` | `in` |
| X | `#18181b` (light) / `#3a3a40` (dark) | `X` |
| Instagram | `#d6306d` | `IG` |
| Bluesky | `#0285ff` | `bs` |
| Mastodon | `#6364ff` | `M` |
| Newsletter | `#ea580c` | `NL` |
| Video script | `#7c3aed` | `▷` |

Badges are a rounded square (`rounded-[6–9px]`), white letters, Geist Mono, weight 700.

### Status tokens (queued / scheduled / posted / failed / draft)
| Status | Dot / accent | Soft bg | Text |
|---|---|---|---|
| Scheduled | `--primary` (indigo) | `--accent-soft` | `--primary` |
| Queued | `#d97706` | `#f59e0b` @ 14% over card | `#b45309` |
| Posted / Published | `#16a34a` | `#22c55e` @ 13% over card | `#15803d` |
| Failed | `#dc2626` | `#ef4444` @ 13% over card | `#dc2626` |
| Draft | `--muted-foreground` | `--muted` | `--muted-foreground` |

### Voice-match indicator (used on every variant + top posts)
Score 0–100 in a pill with a tiny inline progress bar. Color by score:
- **≥ 92** → green `#15803d` (label "On-voice")
- **85–91** → indigo `--primary` (label "On-voice")
- **< 85** → amber `#b45309` (label "Review")
Pill = `bg` of that color @ ~13%, 1px border same hue, mono number + 34px×5px bar.

### Typography scale
| Use | Size | Weight | Tracking |
|---|---|---|---|
| Hero H1 | `clamp(40px,5.4vw,62px)` | 700 | `-0.035em` |
| Section H2 | `clamp(30px,3.6vw,44px)` | 700 | `-0.03em` |
| Card title | 17–20px | 600 | `-0.02em` |
| Body | 14–16px | 400 | normal, `text-wrap: pretty` |
| Small / meta | 12–13px | 400–500 | normal |
| Mono eyebrow | 10–11px | 500 | `0.06–0.08em`, UPPERCASE |
| Stat value | 26–40px | 700 | `-0.02em` |

### Spacing & layout
Content max-width: marketing 1200px, app screens 1180px. Page padding `clamp(20px,3vw,32px)`.
Card padding 16–28px. Gaps 12–20px. Use CSS grid `repeat(auto-fit, minmax(min(280px,100%),1fr))`
for responsive card rows (the prototype avoids media queries; you can use Tailwind breakpoints).

### App shell (Dashboard / Repurpose / Analytics / My Content share this)
- **Sidebar 248px**, sticky full height, `border-r`. Logo (click → landing) → "New content"
  primary button → nav list (Dashboard ◈, Repurpose ✦, My Content ▦ `24`, Analytics ◢,
  Connections ⚯ `5`) → bottom usage card ("Monthly sources 12/30" progress + "Upgrade plan →").
- **Header 60px**, sticky, blurred `bg`, `border-b`: screen title + subtitle on the left;
  theme toggle, overlapping connected-account avatars, user avatar on the right.
- **Main**: `bg-[app-bg]`, scrolls.

---

## Screens

### 1. Landing  (`/`)
Full marketing page, own sticky nav (logo, How it works / Features / Pricing, theme toggle,
"Log in" → /login, "Start free" → /register).
- **Hero** (2-col, stacks): left = pill badge "Learns your voice. Gets sharper weekly.",
  H1 "One source in. A week of content out — in your voice." ("week of content" in indigo),
  subhead, primary "Start free" + outline "See it in action →", microcopy
  "No credit card · 5 sources free every month". Right = **fan-out visual**: a source card
  (YouTube thumbnail w/ play triangle, "How I grew to 50k subs", mono "youtube · 18:42") →
  a column of 4 platform mini-cards (badge + name + voice pill + 2 skeleton lines), each
  animating in with `cfFan` (staggered .13s).
- **Logo strip**: mono eyebrow "Publishes natively to" + 5 platform chips.
- **How it works**: 3 cards (Ingest / Repurpose / Schedule & learn), numbered badge in
  accent-soft, mono tag, title, body.
- **Differentiator**: 2-col. Left = "Not just another AI writer" + H2 (".. sounds like *you*")
  + two feature rows (🎙 Voice fidelity, 📈 Feedback loop). Right = elevated card: "Voice match
  94/100" bar + a 7-bar "this week vs last" mini chart (last 2 bars indigo) + "Engagement +38%".
- **Testimonials**: 3 quote cards (avatar monogram + name + role).
- **Pricing**: 3 tiers (Free $0, Creator $29 — *featured*, ringed in indigo w/ "MOST POPULAR"
  tab + glow shadow, Studio $79). Feature lists with indigo ✓. CTAs → /register.
- **Footer**: logo + tagline, 3 link columns, bottom legal bar (mono).

### 2. Login  (`/login`)  &  3. Register  (`/register`)
Split layout, two equal columns (stack on narrow).
- **Left brand panel**: solid indigo (`--primary`) with a cyan radial-glow overlay
  (`radial-gradient(120% 80% at 100% 0%, #22d3ee@55%, transparent)`). Logo top, a mini
  glassmorphic fan-out ("One source" chip → 4 translucent platform rows), H2 "A week of
  content, in your voice — from a single source.", 3 proof stats (12k+ / 5 / 94), © footer.
- **Right form panel** (`bg-[app-bg]`): theme toggle top-right.
  - Login: H1 "Welcome back" + sub. Register: H1 "Create your account" + "Start free — 5
    sources a month, no card required."
  - Two social buttons (Continue with Google, Continue with X).
  - "or with email" divider.
  - Fields: **Register adds Name**; both have Email, Password (Login shows "Forgot?").
  - Primary submit ("Log in" / "Create account") → /dashboard.
  - Footer cross-link (Login↔Register). Register adds Terms/Privacy microcopy.

### 4. Dashboard  (`/dashboard`)
Centered, max-width 880px.
- Intro H2 "What are we turning into content today?" + subhead.
- **Composer card**: large `Textarea` ("Describe what you want, or paste a YouTube / blog URL…"),
  a source row (3 dashed buttons: ▶ Paste link, ⎙ Upload PDF, ✎ Pick from library), then a
  controls bar on `bg-[app-bg]`: **Format** chips (X Thread, LinkedIn, Blog post, Newsletter,
  IG caption, Video script — single-select) + **Tone** pills (Punchy, Warm, Analytical, Bold,
  Conversational), and a primary **✦ Generate** button.
- **Idle**: below the composer, "Or start from a recent source" → 3 source cards (clicking one
  fills the textarea).
- **Generating** (state): spinner row "Reading your source and writing in your voice…" + 3
  shimmer skeleton lines (~1.5s).
- **Done** (state): "Draft ready" + "Voice match 94" badge, Regenerate + "Repurpose to all
  platforms →" (→ /repurpose). Editor card = toolbar (X badge, title, B/I/undo) + 4
  **contenteditable** tweet blocks (focus → accent-soft bg + accent border) + footer
  "4 tweets · 1,012 characters".
- **State machine**: `idle → generating → done`; Regenerate → idle.

### 5. Repurpose  (`/repurpose`)  ← signature screen
Two regions, max-width 1280px.
- **Top: master → variants.** Left (sticky, 280–360px) = **master source card** (16:9
  thumbnail + play, "YouTube video · 18:42 · transcribed", title, summary, "↻ Regenerate all
  variants"). Right = header "5 platform-native variants · all in your voice" + "auto-saved"
  dot, then a responsive grid of **5 variant cards** (LinkedIn, X thread, Instagram, Video
  Script, Newsletter). Each card:
  - Head: platform badge + name + `@account` + **voice pill** (number + mini bar).
  - Body: **contenteditable**. X card renders as **numbered tweet blocks**; others as one text
    block. (Char-count over-limit turns red — X is intentionally 318/280 → red.)
  - Foot (`bg-[app-bg]`): mono char count + status badge; a date/time selector (🗓 "Mon · 9:00
    AM" or empty) + primary **Schedule** button.
- **Bottom: scheduling calendar** = "This week's queue · Drag a variant onto a slot." A legend
  (queued/scheduled/posted/failed), an **unscheduled tray** of draggable pills (HTML5
  drag-and-drop), and a week grid (72px time gutter + Mon–Fri columns × 3 rows: 9:00 AM /
  2:00 PM / 6:00 PM). Dropping a tray pill into a cell creates a scheduled chip; cells show the
  variant badge + label + status. **This is the centerpiece — keep the drag interaction.**
  In React: track `dragVariant` in state; cell `onDragOver={e=>e.preventDefault()}` +
  `onDrop` writes `schedule[cellKey] = {...}`. (dnd-kit is fine if you prefer.)

### 6. Analytics  (`/analytics`)
Max-width 1180px. Sells the cross-source feedback loop.
- **Sync strip** (top): "Live from" + each connected source as a pill with a green dot and a
  mono "synced 4m ago"; "↻ Sync now" on the right. (This is what communicates *fetched from
  different sources* — keep it.)
- **Filters**: range `ToggleGroup` (Last 7 / 30 / 90 days) + Source filter (All, LinkedIn, X,
  Instagram, Bluesky, Mastodon, Newsletter). Both update the data below.
- **Overview**: 4 KPI cards (Impressions, Engagements, Avg. engagement rate, Followers gained)
  each with value + green ↑ change "vs prev". Values change per range.
- **Charts row** (2-col): left = **Impressions bar chart** (14 bars, last 4 in indigo, rest
  muted-indigo) titled "across all sources · last N days"; right = **By platform** horizontal
  bars (badge + name + mono impressions + green change %, bar width = share, colored per
  platform). Filtering by a source narrows the breakdown + top posts.
- **Top performing posts** table: columns Post (badge + title) | Impressions | Engagements |
  Rate | Voice (voice-match pill). Mono numbers, right-aligned.
- Use **Recharts** for both charts. Sample data is in the prototype's `analyticsData()`.

### 7. My Content  (`/content`)
Max-width 1180px. Library/management.
- 4 stat cards (Published 18, Scheduled 6, Avg. engagement 7.6%, Avg. voice match 94).
- Toolbar: search input (filters by title) + Status chips (All / Draft / Scheduled /
  Published).
- Platform filter row (All, LinkedIn, X, Instagram, Bluesky, Mastodon, Newsletter).
- Bulk bar: "Select all" checkbox + "Schedule selected" / "Delete".
- **Content rows** (grid `auto 1fr auto`): checkbox + type icon (▶/¶/⎙ in accent-soft) |
  title + status badge + mono "kind · date" + overlapping variant badges (each ringed in its
  child status color via `box-shadow: 0 0 0 1.5px <statusDot>`) + "N variants" | on the right,
  **for published items only** show Impressions + Eng. rate (with ↑/↓ trend) + "Open →".
- Filters compose (status AND platform AND search) and re-render the list live.

---

## Interactions & behavior (don't drop these — they're the product story)
- Theme toggle (every header + auth) via `next-themes`.
- Dashboard generate: `idle → generating (~1.5s skeletons) → done (editable result)`.
- Repurpose: editable variant cards (contenteditable or controlled textareas); **drag-to-schedule**
  calendar with queued/scheduled/posted/failed states.
- Analytics: range + source filters recompute KPIs, chart, breakdown, and top posts.
- My Content: search + status + platform filters compose.
- Entrance animations: `cfRise` (translateY 14px + fade, .5s) and `cfFan` (translateX -18px +
  scale .96 → 1, staggered) — use Tailwind `animate-in` / Framer Motion equivalents.
- Hover: cards lift border to `accent-border`; nav/chips have the active styles above.

## State management
Per screen: `theme`; dashboard `{prompt, format, tone, genState}`; repurpose `{schedule map,
dragVariant, per-variant edits}`; analytics `{range, sourceFilter}`; content `{search,
statusFilter, platformFilter, selection}`. All client state — no backend required for the
design; wire real data later where the prototype uses sample arrays.

## Design tokens (exact hex)
**Light** — bg `#ffffff`, canvas `#fafafa`, fg `#09090b`, muted `#f4f4f5`, muted-fg `#71717a`,
border `#e7e7ec`, primary `#4f46e5`, accent-soft `#eef2ff`, accent-border `#c7d2fe`.
**Dark** — canvas `#09090b`, card `#141417`, fg `#fafafa`, muted `#1d1d22`, muted-fg `#a1a1aa`,
border `#262629`, primary `#6366f1`, accent-soft `#1e1b34`, accent-border `#373063`.
Radius: base 10px; cards 14–18px; pills 9999px. Shadow (cards): `0 16px 44px -28px rgba(0,0,0,.2)`.
Plus platform / status / voice colors in the tables above.

## Assets
No external images. Source thumbnails are gradient placeholders — substitute real media or keep
a neutral `bg-muted` 16:9 block with a play glyph. Platform "logos" are **letter badges**, not
official marks (LinkedIn `in`, X `X`, IG `IG`, Bluesky `bs`, Mastodon `M`) — keep them as
monochrome glyphs or swap for the user's licensed icon set. Icons used (◈ ✦ ▦ ◢ ⚯ ▶ ¶ ⎙ ⌕ 🗓)
can be replaced with **lucide-react** equivalents (LayoutGrid, Sparkles, Library, BarChart2,
Link2, Play, FileText, Upload, Search, Calendar).

## Files
- `Contentify.dc.html` — the interactive reference prototype (all 7 screens, both themes).
  View via the included screenshots or render with its runtime; use README values for pixels.

## How to drive Claude Code (recommended order)
1. "Read `design_handoff_contentify/README.md` fully before writing code."
2. **Step 1 — theme only:** "Set up Geist fonts and replace the shadcn CSS variables in
   globals.css with the exact tokens in the README. Add next-themes. Stop and show me a
   themed Button + Card in light and dark." (Verify this looks right before continuing —
   this is where most attempts go wrong.)
3. **Step 2 — shell:** build the sidebar + header app shell.
4. **Step 3 — one screen at a time**, in this order: Dashboard → Repurpose → Analytics →
   My Content → Landing → Login/Register. Finish and review each before the next.
5. Tell it explicitly: *"Use shadcn components, not hand-rolled divs; match the README's
   component mapping; keep the listed interactions."*
Doing it screen-by-screen (not "build all 7 now") is the single biggest quality lever.
