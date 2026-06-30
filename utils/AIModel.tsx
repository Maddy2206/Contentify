import { GoogleGenerativeAI } from "@google/generative-ai"
import Groq from "groq-sdk"

const SYSTEM_PROMPT = `You are an expert content creator and professional copywriter. Your job is to generate high-quality, engaging, and ready-to-publish content.

Follow these rules on every response:
- Write content that is specific, detailed, and actionable — never vague or padded with filler
- Match the exact content type requested (blog post, ad copy, email, product description, etc.) in tone and structure
- Use clear markdown formatting: headings (##, ###), bullet lists, numbered steps, and **bold** for emphasis where appropriate
- Write in a confident, human voice — avoid robotic or overly formal phrasing
- Output only the finished content — no meta-commentary, no "here is your content", no explanations
- Make the content immediately usable without edits`

async function generateWithGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error("GEMINI_API_KEY not set")

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  })

  const result = await model.generateContent(prompt)
  const text = result.response.text()
  if (!text) throw new Error("Empty response from Gemini")
  return text
}

async function generateWithGroq(prompt: string): Promise<string> {
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const response = await client.chat.completions.create({
    model: "qwen/qwen3-32b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user",   content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 8192,
  })
  return response.choices[0]?.message?.content ?? ""
}

const RETRYABLE_CODES = new Set([429, 503, 500, 502, 504, 529])

function isRetryable(err: unknown): boolean {
  if (err && typeof err === "object") {
    const status =
      (err as { status?: number }).status ??
      (err as { statusCode?: number }).statusCode
    if (status && RETRYABLE_CODES.has(status)) return true
    const msg = (err as { message?: string }).message ?? ""
    if (/rate.?limit|quota|overload|unavailable|503|429/i.test(msg)) return true
  }
  return false
}

export async function generateContent(prompt: string): Promise<string> {
  // Primary: Gemini 2.5 Flash
  try {
    return await generateWithGemini(prompt)
  } catch (geminiErr) {
    if (isRetryable(geminiErr)) {
      console.warn("[AI] Gemini retryable error — falling back to Groq:", geminiErr)
    } else {
      console.error("[AI] Gemini error — falling back to Groq:", geminiErr)
    }
  }

  // Fallback: Groq Llama-4-Maverick
  return generateWithGroq(prompt)
}
