import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { YoutubeTranscript } = require("youtube-transcript") as typeof import("youtube-transcript")

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:shorts\/)([a-zA-Z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 })

    const videoId = extractVideoId(url)
    if (!videoId) return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })

    const segments = await YoutubeTranscript.fetchTranscript(videoId)
    const transcript = segments.map((s) => s.text).join(" ")

    if (!transcript.trim()) {
      return NextResponse.json({ error: "No transcript available for this video" }, { status: 422 })
    }

    // Truncate to ~8k chars to stay within prompt limits
    const text = transcript.length > 8000 ? transcript.slice(0, 8000) + "…" : transcript

    return NextResponse.json({ text, videoId })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch transcript"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
