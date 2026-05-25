import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are an expert content creator and professional copywriter. Your job is to generate high-quality, engaging, and ready-to-publish content.

Follow these rules on every response:
- Write content that is specific, detailed, and actionable — never vague or padded with filler
- Match the exact content type requested (blog post, ad copy, email, product description, etc.) in tone and structure
- Use clear markdown formatting: headings (##, ###), bullet lists, numbered steps, and **bold** for emphasis where appropriate
- Write in a confident, human voice — avoid robotic or overly formal phrasing
- Output only the finished content — no meta-commentary, no "here is your content", no explanations
- Make the content immediately usable without edits`;

export async function generateContent(prompt: string): Promise<string> {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: 0.75,
    max_tokens: 8192,
  });
  return response.choices[0]?.message?.content ?? '';
}
