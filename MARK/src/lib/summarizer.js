import { GoogleGenerativeAI } from '@google/generative-ai'

// Collect Gemini API Keys from environment (Vite import.meta.env or process.env)
const GEMINI_KEYS = [
  import.meta.env?.VITE_GEMINI_API_KEY_1 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_1),
  import.meta.env?.VITE_GEMINI_API_KEY_2 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_2),
  import.meta.env?.VITE_GEMINI_API_KEY_3 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_3),
  import.meta.env?.VITE_GEMINI_API_KEY_4 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_4),
  import.meta.env?.VITE_GEMINI_API_KEY_5 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_5),
  import.meta.env?.VITE_GEMINI_API_KEY_6 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_6),
  import.meta.env?.VITE_GEMINI_API_KEY_7 || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY_7),
  import.meta.env?.VITE_GEMINI_API_KEY || (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY)
].filter(Boolean)

let currentKeyIndex = 0

function getGeminiClient() {
  if (GEMINI_KEYS.length === 0) return null
  const key = GEMINI_KEYS[currentKeyIndex % GEMINI_KEYS.length]
  currentKeyIndex++
  return new GoogleGenerativeAI(key)
}

export async function generateSummary(content, categoryHint = 'General') {
  const prompt = `
You are an expert AI content summarizer for MARK Link & Note Manager.
Analyze the following web content, video caption, or article text and produce a structured, high-value summary:

Content to Analyze:
${(content || '').slice(0, 12000)}

Category Hint: ${categoryHint || 'General'}

Provide output ONLY as valid, raw JSON with exact key structure:
{
  "title": "Concise, Catchy Title (max 10 words)",
  "summary": "Clear, informative overview (2-4 sentences explaining what this link/video is about)",
  "keyPoints": [
    "Key takeaway or actionable insight 1",
    "Key takeaway or actionable insight 2",
    "Key takeaway or actionable insight 3"
  ],
  "suggestedTag": "Short 1-word Category (e.g. AI, Tech, Jobs, Productivity, Finance, Islam, Social)"
}
`

  // 1. Try Gemini API Key Rotation
  if (GEMINI_KEYS.length > 0) {
    for (let attempts = 0; attempts < GEMINI_KEYS.length; attempts++) {
      try {
        const genAI = getGeminiClient()
        if (!genAI) break

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(prompt)
        const response = await result.response
        const rawText = response.text()

        // Clean JSON markdown block
        const cleanedJson = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
        const parsed = JSON.parse(cleanedJson)

        if (parsed && parsed.summary) {
          return {
            title: parsed.title || 'AI Summary',
            summary: parsed.summary,
            keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
            suggestedTag: parsed.suggestedTag || categoryHint || 'General'
          }
        }
      } catch (err) {
        console.warn(`[MARK AI] Gemini key index ${currentKeyIndex - 1} failed, rotating...`, err)
      }
    }
  }

  // 2. Intelligent Rule-Based Fallback Summary generator if AI keys unavailable or rate-limited
  const textClean = (content || '').replace(/\s+/g, ' ').trim()
  const sentences = textClean.split(/(?<=[.?!])\s+/).filter(s => s.length > 15)
  const firstSentences = sentences.slice(0, 3).join(' ') || textClean.slice(0, 300)

  return {
    title: categoryHint !== 'General' ? `${categoryHint} Overview` : 'Link Summary',
    summary: firstSentences || 'Summary generated from link content preview.',
    keyPoints: sentences.slice(3, 7).map(s => s.trim()).filter(Boolean),
    suggestedTag: categoryHint || 'General'
  }
}
