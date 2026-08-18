import { GoogleGenerativeAI } from '@google/generative-ai'

// Collect Gemini API Keys from import.meta.env or process.env
const getEnvVar = (name) => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    if (import.meta.env[name]) return import.meta.env[name]
    if (import.meta.env[`VITE_${name}`]) return import.meta.env[`VITE_${name}`]
  }
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[name]) return process.env[name]
    if (process.env[`VITE_${name}`]) return process.env[`VITE_${name}`]
  }
  return null
}

const GEMINI_KEYS = [
  getEnvVar('GEMINI_API_KEY_1'),
  getEnvVar('GEMINI_API_KEY_2'),
  getEnvVar('GEMINI_API_KEY_3'),
  getEnvVar('GEMINI_API_KEY_4'),
  getEnvVar('GEMINI_API_KEY_5'),
  getEnvVar('GEMINI_API_KEY_6'),
  getEnvVar('GEMINI_API_KEY_7'),
  getEnvVar('GEMINI_API_KEY')
].filter(Boolean)

const GROQ_KEY = getEnvVar('GROQ_API_KEY')
const OPENROUTER_KEY = getEnvVar('OPENROUTER_API_KEY')

let currentKeyIndex = 0

function getGeminiClient() {
  if (GEMINI_KEYS.length === 0) return null
  const key = GEMINI_KEYS[currentKeyIndex % GEMINI_KEYS.length]
  currentKeyIndex++
  return new GoogleGenerativeAI(key)
}

export async function generateSummary(content, categoryHint = 'General') {
  const cleanContent = (content || '').trim()

  const systemPrompt = `
You are an expert AI content summarizer for MARK Link & Note Manager.
Analyze the provided web article, GitHub repository, news blog, or video transcript/caption in detail.

Task Instructions:
1. **Title**: Create a clear, engaging, highly specific title (5-10 words) representing the exact topic discussed (DO NOT output generic titles like "Overview" or "Shared Link").
2. **Summary**: Write a rich, thorough 3-5 sentence executive summary explaining what the content/video/tool is, why it matters, and key details.
3. **Key Points**: List 4-7 detailed, actionable bullet point takeaways (include specific tools, links, statistics, or steps mentioned).
4. **Suggested Tag**: Choose a concise 1-word category (e.g. AI, Tech, Jobs, Productivity, Coding, Finance, Islam, Social).

Content to Analyze:
${cleanContent.slice(0, 15000)}

Category Hint: ${categoryHint || 'General'}

Output ONLY valid, raw JSON with this exact key structure:
{
  "title": "Specific Catchy Title",
  "summary": "Detailed 3-5 sentence summary of the article/video/post...",
  "keyPoints": [
    "Key takeaway point 1 with detail",
    "Key takeaway point 2 with detail",
    "Key takeaway point 3 with detail"
  ],
  "suggestedTag": "Category"
}
`

  // 1. Primary: Try Gemini API Key Load Balancing Rotation
  if (GEMINI_KEYS.length > 0) {
    for (let attempts = 0; attempts < GEMINI_KEYS.length; attempts++) {
      try {
        const genAI = getGeminiClient()
        if (!genAI) break

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const result = await model.generateContent(systemPrompt)
        const response = await result.response
        const rawText = response.text()

        // Clean JSON markdown blocks
        const cleanedJson = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
        const parsed = JSON.parse(cleanedJson)

        if (parsed && parsed.summary && parsed.summary.length > 20) {
          return {
            title: parsed.title || 'AI Content Summary',
            summary: parsed.summary,
            keyPoints: Array.isArray(parsed.keyPoints) && parsed.keyPoints.length > 0 ? parsed.keyPoints : [],
            suggestedTag: parsed.suggestedTag || categoryHint || 'General'
          }
        }
      } catch (err) {
        console.warn(`[MARK AI] Gemini key ${currentKeyIndex - 1} attempt failed, rotating to next key...`, err)
      }
    }
  }

  // 2. Secondary: Groq API Backup (if GROQ_API_KEY is available)
  if (GROQ_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: systemPrompt }],
          response_format: { type: 'json_object' }
        })
      })

      if (res.ok) {
        const data = await res.json()
        const rawText = data.choices?.[0]?.message?.content || ''
        const parsed = JSON.parse(rawText)
        if (parsed && parsed.summary) {
          return {
            title: parsed.title || 'AI Summary',
            summary: parsed.summary,
            keyPoints: parsed.keyPoints || [],
            suggestedTag: parsed.suggestedTag || categoryHint || 'General'
          }
        }
      }
    } catch (err) {
      console.warn('[MARK AI] Groq backup attempt failed:', err)
    }
  }

  // 3. OpenRouter Backup (if OPENROUTER_API_KEY is available)
  if (OPENROUTER_KEY) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'google/gemini-flash-1.5',
          messages: [{ role: 'user', content: systemPrompt }]
        })
      })

      if (res.ok) {
        const data = await res.json()
        const rawText = data.choices?.[0]?.message?.content || ''
        const cleanedJson = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
        const parsed = JSON.parse(cleanedJson)
        if (parsed && parsed.summary) {
          return {
            title: parsed.title || 'AI Summary',
            summary: parsed.summary,
            keyPoints: parsed.keyPoints || [],
            suggestedTag: parsed.suggestedTag || categoryHint || 'General'
          }
        }
      }
    } catch (err) {
      console.warn('[MARK AI] OpenRouter backup attempt failed:', err)
    }
  }

  // 4. Intelligent Rule-Based Extractor Fallback (Guarantees rich summary even if all AI API keys hit limits)
  const sentences = cleanContent
    .replace(/Title:\s*/g, '')
    .replace(/^https?:\/\/\S+/gm, '')
    .split(/(?<=[.?!])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && !s.includes('http://') && !s.includes('https://'))

  const summaryText = sentences.slice(0, 4).join(' ') || cleanContent.slice(0, 400)
  const takeaways = sentences.slice(4, 9)

  // Derive title from first line or sentence
  const inferredTitle = sentences[0] ? sentences[0].slice(0, 60) : (categoryHint !== 'General' ? `${categoryHint} Summary` : 'Link Summary')

  return {
    title: inferredTitle,
    summary: summaryText || 'Extracted summary from link content.',
    keyPoints: takeaways.length > 0 ? takeaways : ['Includes full article/link reference.', 'Saved to your AI Knowledge Hub.'],
    suggestedTag: categoryHint || 'General'
  }
}
