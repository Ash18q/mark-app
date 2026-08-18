import { supabase } from '../supabaseClient'
import { detectContentType, extractTextContent, extractVideoContent } from '../lib/contentDetector'
import { generateSummary } from '../lib/summarizer'

const LOCAL_AI_NOTES_KEY = 'mark_app_ai_notes_v1'

function getLocalAINotes() {
  try {
    const raw = localStorage.getItem(LOCAL_AI_NOTES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalAINotes(notes) {
  try {
    localStorage.setItem(LOCAL_AI_NOTES_KEY, JSON.stringify(notes))
  } catch (err) {
    console.error('Failed to cache AI note locally:', err)
  }
}

/**
 * Fetch all AI Notes for the logged in user
 */
export async function getAINotes(userId) {
  const localNotes = getLocalAINotes()

  if (!userId) return localNotes

  try {
    const { data, error } = await supabase
      .from('ai_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[MARK AI] Supabase fetch error, using local fallback:', error.message)
      return localNotes
    }

    if (data) {
      // Sync local notes
      saveLocalAINotes(data)
      return data
    }
  } catch (err) {
    console.warn('[MARK AI] getAINotes error:', err)
  }

  return localNotes
}

/**
 * Main Summarization function with Duplicate Prevention
 */
export async function processLinkSummarization({ url, tag = 'General', linkId = null, userId = null }) {
  if (!url) {
    throw new Error('URL is required for summarization')
  }

  const cleanUrl = url.trim()

  // 1. Check Duplicate: Has this link already been validly summarized by user?
  const existingNotes = await getAINotes(userId)
  const existingNote = existingNotes.find(
    n => (n.source_url === cleanUrl || (linkId && n.link_id === linkId)) &&
         n.summary && !n.summary.startsWith('Shared Video Link') && !n.summary.startsWith('Article URL')
  )

  if (existingNote) {
    return {
      success: true,
      alreadyExists: true,
      note: existingNote,
      message: 'This link has already been summarized!'
    }
  }

  // 2. Content Type Detection
  const sourceType = await detectContentType(cleanUrl)

  // 3. Content Extraction
  let extractedResult = { text: '', thumbnail: null, title: '' }
  if (sourceType === 'video') {
    extractedResult = await extractVideoContent(cleanUrl)
  } else {
    extractedResult = await extractTextContent(cleanUrl)
  }

  // 4. AI Summarization Call (Gemini Multi-Key Load Balancer)
  const aiResult = await generateSummary(extractedResult.text, tag)

  const finalTag = tag && tag !== 'General' ? tag : (aiResult.suggestedTag || 'General')
  const finalTitle = aiResult.title || extractedResult.title || 'AI Summary'
  const finalThumbnail = extractedResult.thumbnail || null

  const newNotePayload = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `note_${Date.now()}`,
    user_id: userId || 'local_user',
    link_id: linkId || null,
    tag: finalTag,
    title: finalTitle,
    summary: aiResult.summary,
    key_points: aiResult.keyPoints || [],
    source_url: cleanUrl,
    source_type: sourceType,
    thumbnail_url: finalThumbnail,
    metadata: { processedAt: new Date().toISOString() },
    is_processed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // 5. Save to Supabase (with LocalStorage cache fallback)
  if (userId) {
    try {
      const { data, error } = await supabase
        .from('ai_notes')
        .insert({
          user_id: userId,
          link_id: linkId || null,
          tag: finalTag,
          title: finalTitle,
          summary: aiResult.summary,
          key_points: aiResult.keyPoints || [],
          source_url: cleanUrl,
          source_type: sourceType,
          thumbnail_url: finalThumbnail,
          metadata: newNotePayload.metadata,
          is_processed: true
        })
        .select()
        .single()

      if (!error && data) {
        const updatedLocal = [data, ...existingNotes.filter(n => n.id !== data.id)]
        saveLocalAINotes(updatedLocal)
        return { success: true, alreadyExists: false, note: data }
      }
    } catch (dbErr) {
      console.warn('[MARK AI] Supabase insert fallback to local:', dbErr)
    }
  }

  // Save to local cache if no user or table offline
  const updatedLocal = [newNotePayload, ...existingNotes]
  saveLocalAINotes(updatedLocal)

  return { success: true, alreadyExists: false, note: newNotePayload }
}

/**
 * Delete AI Note
 */
export async function deleteAINote(noteId, userId) {
  const localNotes = getLocalAINotes().filter(n => n.id !== noteId)
  saveLocalAINotes(localNotes)

  if (userId) {
    try {
      await supabase.from('ai_notes').delete().eq('id', noteId)
    } catch (err) {
      console.warn('[MARK AI] Error deleting from Supabase:', err)
    }
  }
}
