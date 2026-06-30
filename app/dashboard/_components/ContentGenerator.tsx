"use client"

import { useRef, useState } from "react"
import { toast } from "react-toastify"

const FORMATS = [
  { label: "X Thread",      prompt: "Write a compelling Twitter/X thread about" },
  { label: "LinkedIn",      prompt: "Write a professional LinkedIn post about" },
  { label: "Blog post",     prompt: "Write a comprehensive blog post about" },
  { label: "Newsletter",    prompt: "Write an engaging newsletter about" },
  { label: "IG caption",    prompt: "Write an Instagram caption about" },
  { label: "Video script",  prompt: "Write a video script about" },
]

const TONES = ["Punchy", "Warm", "Analytical", "Bold", "Conversational"]

const SAMPLE_SOURCES = [
  { icon: "▶", label: "How I grew to 50k subs",        meta: "youtube · 18:42" },
  { icon: "¶", label: "The content flywheel explained", meta: "blog · 8 min read" },
  { icon: "⎙", label: "Q2 strategy document",          meta: "pdf · 24 pages" },
]

type GenState = "idle" | "generating" | "done"
type SourceMode = "none" | "youtube" | "pdf"

function SkeletonBar({ w }: { w: string }) {
  return <div className="shimmer" style={{ height: 14, borderRadius: 99, width: w }} />
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "inherit", padding: "6px 14px", borderRadius: 99, border: "1px solid",
        fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .12s",
        borderColor: active ? "hsl(var(--accent-border))" : "hsl(var(--border))",
        background:  active ? "hsl(var(--accent-soft))"  : "hsl(var(--card))",
        color:       active ? "hsl(var(--primary))"      : "hsl(var(--muted-foreground))",
      }}
    >{label}</button>
  )
}

function TonePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "inherit", padding: "6px 14px", borderRadius: 99, border: "none",
        fontSize: 14, fontWeight: 500, cursor: "pointer", transition: "all .12s",
        background: active ? "hsl(var(--foreground))" : "hsl(var(--muted))",
        color:      active ? "hsl(var(--background))" : "hsl(var(--muted-foreground))",
      }}
    >{label}</button>
  )
}

export default function ContentGenerator() {
  const [prompt, setPrompt]       = useState("")
  const [format, setFormat]       = useState(FORMATS[0])
  const [tone, setTone]           = useState(TONES[0])
  const [genState, setGenState]   = useState<GenState>("idle")
  const [result, setResult]       = useState<string[]>([])
  const [sourceMode, setSourceMode] = useState<SourceMode>("none")
  const [ytUrl, setYtUrl]         = useState("")
  const [ytLoading, setYtLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setGenState("generating")
    try {
      const res = await fetch("/api/generate-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: `${format.prompt}: ${prompt}. Tone: ${tone}.` }),
      })
      if (!res.ok) throw new Error()
      const { content } = await res.json()
      const blocks: string[] = format.label === "X Thread"
        ? content.split(/\n{2,}/).filter(Boolean)
        : [content]
      setResult(blocks)
      setGenState("done")

      await fetch("/api/content/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formData: JSON.stringify({ topic: prompt, format: format.label, tone }),
          templateSlug: format.label.toLowerCase().replace(/\s+/g, "-"),
          aiResponse: content,
        }),
      })
    } catch {
      toast.error("Generation failed. Please try again.")
      setGenState("idle")
    }
  }

  const handleYouTube = async () => {
    if (!ytUrl.trim()) return
    setYtLoading(true)
    try {
      const res = await fetch("/api/extract/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: ytUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to fetch transcript")
      setPrompt(data.text)
      setSourceMode("none")
      setYtUrl("")
      toast.success("Transcript loaded — ready to generate!")
      textareaRef.current?.focus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not fetch YouTube transcript")
    } finally {
      setYtLoading(false)
    }
  }

  const handlePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfLoading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const res = await fetch("/api/extract/pdf", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Failed to parse PDF")
      setPrompt(data.text)
      setSourceMode("none")
      toast.success(`PDF loaded (${data.pages} pages) — ready to generate!`)
      textareaRef.current?.focus()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not read PDF")
    } finally {
      setPdfLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const toggleSource = (mode: SourceMode) =>
    setSourceMode((prev) => (prev === mode ? "none" : mode))

  return (
    <div style={{ padding: "clamp(28px,4vw,56px) clamp(24px,4vw,48px) 120px" }}>

      {/* Intro */}
      <div className="animate-rise" style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "clamp(28px,3.6vw,42px)", lineHeight: 1.08, letterSpacing: "-.03em", fontWeight: 700, margin: "0 0 10px" }}>
          What are we turning into content today?
        </h2>
        <p style={{ fontSize: 17, color: "hsl(var(--muted-foreground))", margin: 0, lineHeight: 1.55 }}>
          Type a prompt, drop a YouTube link, or upload a PDF — we&apos;ll write it in your voice.
        </p>
      </div>

      {/* Composer card */}
      <div className="animate-rise" style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", boxShadow: "0 18px 50px -28px rgba(0,0,0,.22)", overflow: "hidden", animationDelay: ".05s" }}>

        {/* Textarea */}
        <div style={{ padding: "20px 22px 0" }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleGenerate() }}
            placeholder="Describe what you want, or paste a YouTube / blog URL…"
            rows={4}
            style={{
              fontFamily: "inherit", width: "100%", border: "none", outline: "none",
              resize: "none", background: "transparent", color: "hsl(var(--foreground))",
              fontSize: 17, lineHeight: 1.6, minHeight: 90,
            }}
          />
        </div>

        {/* Source row */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "6px 22px 16px" }}>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            style={{ display: "none" }}
            onChange={handlePdf}
          />
          <button
            onClick={() => toggleSource("youtube")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
              border: "1px dashed", borderRadius: 9,
              borderColor: sourceMode === "youtube" ? "hsl(var(--accent-border))" : "hsl(var(--border))",
              background: sourceMode === "youtube" ? "hsl(var(--accent-soft))" : "hsl(var(--app-bg))",
              cursor: "pointer", fontSize: 14, color: sourceMode === "youtube" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
              fontWeight: 500, fontFamily: "inherit",
            }}
          >
            <span style={{ fontSize: 16 }}>▶</span> Paste YouTube link
          </button>
          <button
            onClick={() => { if (!pdfLoading) fileInputRef.current?.click() }}
            disabled={pdfLoading}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "9px 14px",
              border: "1px dashed hsl(var(--border))", borderRadius: 9,
              background: "hsl(var(--app-bg))", cursor: "pointer", fontSize: 14,
              color: "hsl(var(--muted-foreground))", fontWeight: 500, fontFamily: "inherit",
              opacity: pdfLoading ? 0.6 : 1,
            }}
          >
            <span style={{ fontSize: 16 }}>⎙</span> {pdfLoading ? "Reading PDF…" : "Upload PDF"}
          </button>
          <div
            onClick={() => textareaRef.current?.focus()}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", border: "1px dashed hsl(var(--border))", borderRadius: 9, background: "hsl(var(--app-bg))", cursor: "pointer", fontSize: 14, color: "hsl(var(--muted-foreground))", fontWeight: 500 }}
          >
            <span style={{ fontSize: 16 }}>✎</span> Pick from library
          </div>
        </div>

        {/* YouTube URL input — inline reveal */}
        {sourceMode === "youtube" && (
          <div style={{ margin: "0 22px 14px", display: "flex", gap: 10, alignItems: "center" }}>
            <input
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleYouTube() }}
              placeholder="https://www.youtube.com/watch?v=…"
              autoFocus
              style={{
                fontFamily: "inherit", flex: 1, padding: "10px 14px", borderRadius: 10,
                border: "1px solid hsl(var(--accent-border))", background: "hsl(var(--accent-soft))",
                color: "hsl(var(--foreground))", fontSize: 14, outline: "none",
              }}
            />
            <button
              onClick={handleYouTube}
              disabled={!ytUrl.trim() || ytLoading}
              style={{
                fontFamily: "inherit", padding: "10px 18px", borderRadius: 10, border: "none",
                background: "hsl(var(--primary))", color: "#fff", fontSize: 14, fontWeight: 600,
                cursor: "pointer", opacity: (!ytUrl.trim() || ytLoading) ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {ytLoading ? "Fetching…" : "Load transcript"}
            </button>
          </div>
        )}

        {/* Controls bar */}
        <div style={{ borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--app-bg))", padding: "16px 22px", display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 2 }}>Format</span>
              {FORMATS.map((f) => <Chip key={f.label} label={f.label} active={format.label === f.label} onClick={() => setFormat(f)} />)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 11, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".06em", marginRight: 8 }}>Tone</span>
              {TONES.map((t) => <TonePill key={t} label={t} active={tone === t} onClick={() => setTone(t)} />)}
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || genState === "generating"}
            style={{
              fontFamily: "inherit", alignSelf: "flex-end", display: "flex", alignItems: "center",
              gap: 9, fontSize: 16, fontWeight: 600, padding: "13px 26px", borderRadius: 11,
              border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 16px color-mix(in srgb, hsl(var(--primary)) 35%, transparent)",
              opacity: (!prompt.trim() || genState === "generating") ? 0.5 : 1,
              transition: "opacity .15s",
            }}
          >
            <span style={{ fontSize: 16 }}>✦</span> Generate
          </button>
        </div>
      </div>

      {/* ── Idle: sample sources ─────────────────────────────────────── */}
      {genState === "idle" && (
        <div style={{ marginTop: 28 }}>
          <p style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))", textTransform: "uppercase", letterSpacing: ".08em", margin: "0 0 14px" }}>
            Or start from a recent source
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(260px,100%),1fr))", gap: 14 }}>
            {SAMPLE_SOURCES.map((s) => (
              <div
                key={s.label}
                onClick={() => { setPrompt(s.label); textareaRef.current?.focus() }}
                style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, border: "1px solid hsl(var(--border))", borderRadius: 14, background: "hsl(var(--card))", cursor: "pointer", transition: "border-color .12s" }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "hsl(var(--accent-border))")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "hsl(var(--border))")}
              >
                <div style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 11, background: "hsl(var(--accent-soft))", color: "hsl(var(--primary))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, border: "1px solid hsl(var(--accent-border))" }}>{s.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.label}</div>
                  <div style={{ fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))", marginTop: 3 }}>{s.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Generating: spinner + shimmer ───────────────────────────── */}
      {genState === "generating" && (
        <div style={{ marginTop: 28, border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", padding: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
            <div style={{ width: 20, height: 20, border: "2.5px solid hsl(var(--accent-soft))", borderTopColor: "hsl(var(--primary))", borderRadius: 99, animation: "cfSpin .7s linear infinite", flexShrink: 0 }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Reading your source and writing in your voice…</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <SkeletonBar w="92%" />
            <SkeletonBar w="78%" />
            <SkeletonBar w="85%" />
            <SkeletonBar w="60%" />
          </div>
        </div>
      )}

      {/* ── Done: editor ────────────────────────────────────────────── */}
      {genState === "done" && result.length > 0 && (
        <div className="animate-rise" style={{ marginTop: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600 }}>Draft ready</span>
              <span style={{ fontSize: 12, fontFamily: "var(--font-geist-mono, monospace)", color: "hsl(var(--primary))", background: "hsl(var(--accent-soft))", border: "1px solid hsl(var(--accent-border))", padding: "3px 10px", borderRadius: 99 }}>Voice match 94</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}>
              <button
                onClick={() => { setGenState("idle"); setResult([]); setPrompt("") }}
                style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 500, padding: "9px 16px", borderRadius: 10, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))", color: "hsl(var(--foreground))", cursor: "pointer" }}
              >
                ↻ Regenerate
              </button>
              <a
                href="/dashboard/repurpose"
                style={{ fontFamily: "inherit", fontSize: 14, fontWeight: 600, padding: "9px 16px", borderRadius: 10, border: "none", background: "hsl(var(--primary))", color: "#fff", cursor: "pointer", textDecoration: "none" }}
              >
                Repurpose to all platforms →
              </a>
            </div>
          </div>

          <div style={{ border: "1px solid hsl(var(--border))", borderRadius: 18, background: "hsl(var(--card))", overflow: "hidden", boxShadow: "0 18px 50px -30px rgba(0,0,0,.22)" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 18px", borderBottom: "1px solid hsl(var(--border))", background: "hsl(var(--app-bg))" }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: "hsl(var(--foreground))", color: "hsl(var(--background))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, fontFamily: "var(--font-geist-mono, monospace)" }}>
                {format.label === "X Thread" ? "X" : format.label[0]}
              </div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{format.label} · {tone}</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, fontSize: 13, color: "hsl(var(--muted-foreground))" }}>
                {["B", "I", "↰"].map((ch) => (
                  <span key={ch} style={{ width: 30, height: 30, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontWeight: ch === "B" ? 700 : 400, fontStyle: ch === "I" ? "italic" : "normal" }}>{ch}</span>
                ))}
              </div>
            </div>

            {/* Content blocks */}
            <div style={{ padding: "10px 10px", display: "flex", flexDirection: "column", gap: 5 }}>
              {result.map((block, i) => (
                <div
                  key={i}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newResult = [...result]
                    newResult[i] = e.currentTarget.textContent ?? ""
                    setResult(newResult)
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "hsl(var(--accent-border))"
                    e.currentTarget.style.background  = "hsl(var(--accent-soft))"
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = "transparent"
                    e.currentTarget.style.background  = "transparent"
                  }}
                  onMouseEnter={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = "hsl(var(--app-bg))" }}
                  onMouseLeave={(e) => { if (document.activeElement !== e.currentTarget) e.currentTarget.style.background = "transparent" }}
                  style={{ padding: "16px 18px", borderRadius: 12, fontSize: 16, lineHeight: 1.65, whiteSpace: "pre-wrap", outline: "none", cursor: "text", border: "1px solid transparent", transition: "all .12s" }}
                >
                  {block}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderTop: "1px solid hsl(var(--border))", background: "hsl(var(--app-bg))", fontFamily: "var(--font-geist-mono, monospace)", fontSize: 12, color: "hsl(var(--muted-foreground))" }}>
              <span>{result.length} {format.label === "X Thread" ? "tweets" : "block"}{result.length !== 1 ? "s" : ""} · {result.join(" ").length.toLocaleString()} characters</span>
              <span style={{ color: "hsl(var(--primary))" }}>✦ Click any block to edit inline</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
