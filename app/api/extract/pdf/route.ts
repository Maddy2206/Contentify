import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 })

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "File must be a PDF" }, { status: 400 })
    }

    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: "PDF must be under 4 MB" }, { status: 413 })
    }

    const buffer = new Uint8Array(await file.arrayBuffer())

    // unpdf is listed in serverExternalPackages + webpack externals so webpack
    // never bundles it. The dynamic import resolves at runtime via Node require().
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getDocumentProxy, extractText } = require("unpdf") as typeof import("unpdf")
    const pdf  = await getDocumentProxy(buffer)
    const { totalPages, text } = await extractText(pdf, { mergePages: true })

    const body = (text ?? "").trim()
    if (!body) return NextResponse.json({ error: "Could not extract text from this PDF" }, { status: 422 })

    const truncated = body.length > 8000 ? body.slice(0, 8000) + "…" : body
    return NextResponse.json({ text: truncated, pages: totalPages })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to parse PDF"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
