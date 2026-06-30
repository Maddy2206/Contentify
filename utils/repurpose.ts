import { GoogleGenerativeAI } from '@google/generative-ai'
import Groq from 'groq-sdk'
import { z } from 'zod'

// ── Zod schemas — one per platform output shape ────────────────────────────

export const TwitterThreadSchema = z.object({
  type: z.literal('thread'),
  tweets: z.array(z.string().max(280)).min(2).max(20),
})

export const LinkedInSchema = z.object({
  type: z.literal('linkedin_post'),
  content: z.string().min(1),
  hashtags: z.array(z.string()),
})

export const InstagramSchema = z.object({
  type: z.literal('instagram_caption'),
  caption: z.string().min(1),
  hashtags: z.array(z.string()),
})

export const VideoScriptSchema = z.object({
  type: z.literal('video_script'),
  hook: z.string().min(1),
  body: z.string().min(1),
  cta: z.string().min(1),
})

export const NewsletterSchema = z.object({
  type: z.literal('newsletter'),
  subject: z.string().min(1),
  preview: z.string().min(1),
  body: z.string().min(1),
})

export type VariantResult =
  | z.infer<typeof TwitterThreadSchema>
  | z.infer<typeof LinkedInSchema>
  | z.infer<typeof InstagramSchema>
  | z.infer<typeof VideoScriptSchema>
  | z.infer<typeof NewsletterSchema>

// ── Platform configs ───────────────────────────────────────────────────────

const PLATFORM_CONFIGS: Record<string, { schema: z.ZodTypeAny; instruction: string }> = {
  twitter: {
    schema: TwitterThreadSchema,
    instruction: `Convert this content into a Twitter/X thread.
Return ONLY valid JSON — no markdown, no explanation outside the JSON object.
Format: {"type":"thread","tweets":["tweet1","tweet2",...]}
Rules: each tweet ≤ 280 chars, 5–10 tweets, first tweet is a hook.`,
  },
  linkedin: {
    schema: LinkedInSchema,
    instruction: `Convert this content into a LinkedIn post.
Return ONLY valid JSON.
Format: {"type":"linkedin_post","content":"...","hashtags":["tag1","tag2"]}
Rules: 150–300 words, professional tone, 3–5 hashtags without the # symbol.`,
  },
  instagram: {
    schema: InstagramSchema,
    instruction: `Convert this content into an Instagram caption.
Return ONLY valid JSON.
Format: {"type":"instagram_caption","caption":"...","hashtags":["tag1","tag2"]}
Rules: engaging caption 50–150 words, 10–15 hashtags without the # symbol.`,
  },
  video_script: {
    schema: VideoScriptSchema,
    instruction: `Convert this content into a short-form video script.
Return ONLY valid JSON.
Format: {"type":"video_script","hook":"...","body":"...","cta":"..."}
Rules: hook = 1–2 attention-grabbing sentences; body covers main points (2–3 min spoken); cta = single clear call to action.`,
  },
  newsletter: {
    schema: NewsletterSchema,
    instruction: `Convert this content into a newsletter entry.
Return ONLY valid JSON.
Format: {"type":"newsletter","subject":"...","preview":"...","body":"..."}
Rules: compelling subject line; preview = 1–2 sentence teaser; body in markdown.`,
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function extractJson(raw: string): unknown {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('No JSON object found in AI response')
  return JSON.parse(match[0])
}

const RETRYABLE_CODES = new Set([429, 503, 500, 502, 504, 529])

function isRetryable(err: unknown): boolean {
  if (err && typeof err === 'object') {
    const status =
      (err as { status?: number }).status ??
      (err as { statusCode?: number }).statusCode
    if (status && RETRYABLE_CODES.has(status)) return true
    const msg = (err as { message?: string }).message ?? ''
    if (/rate.?limit|quota|overload|unavailable|503|429/i.test(msg)) return true
  }
  return false
}

async function repurposeWithGemini(masterContent: string, instruction: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: `You are a social media content expert. ${instruction}`,
  })
  const result = await model.generateContent(masterContent)
  const text = result.response.text()
  if (!text) throw new Error('Empty response from Gemini')
  return text
}

async function repurposeWithGroq(masterContent: string, instruction: string): Promise<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: `You are a social media content expert. ${instruction}` },
      { role: 'user',   content: masterContent },
    ],
    temperature: 0.6,
    max_tokens: 2048,
  })
  return response.choices[0]?.message?.content ?? ''
}

// ── Main export ────────────────────────────────────────────────────────────

export async function repurpose(
  masterContent: string,
  targetPlatform: string,
): Promise<VariantResult> {
  const config = PLATFORM_CONFIGS[targetPlatform]
  if (!config) throw new Error(`Unknown platform: ${targetPlatform}`)

  let raw: string

  // Primary: Gemini 2.5 Flash
  try {
    raw = await repurposeWithGemini(masterContent, config.instruction)
  } catch (geminiErr) {
    if (isRetryable(geminiErr)) {
      console.warn('[Repurpose] Gemini retryable error — falling back to Groq:', geminiErr)
    } else {
      console.error('[Repurpose] Gemini error — falling back to Groq:', geminiErr)
    }
    // Fallback: Groq Llama-4-Scout
    raw = await repurposeWithGroq(masterContent, config.instruction)
  }

  const parsed = extractJson(raw)
  return config.schema.parse(parsed) as VariantResult
}
