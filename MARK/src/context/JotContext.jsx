import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from './AuthContext'

const JotContext = createContext(null)

export function JotProvider({ children }) {
  const auth = useAuth()
  const oldNotes = useMemo(() => Array.isArray(auth?.notes) ? auth.notes : [], [auth])
  const [jotNotes, setJotNotes] = useState([])
  const [loading, setLoading] = useState(true)

  // Fetch / Sync jot_notes from Supabase with LocalStorage & oldNotes fallback
  const fetchJotNotes = useCallback(async () => {
    setLoading(true)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      if (!userId) {
        setJotNotes(oldNotes)
        setLoading(false)
        return
      }

      // Query jot_notes table
      const { data, error } = await supabase
        .from('jot_notes')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (!error && Array.isArray(data) && data.length > 0) {
        setJotNotes(data)
        try { localStorage.setItem(`mark_jot_notes_${userId}`, JSON.stringify(data)) } catch { /* ignore */ }
        setLoading(false)
        return
      } else if (oldNotes && oldNotes.length > 0) {
        // If jot_notes table is empty, auto-sync existing notes from notes table into jot_notes
        console.log('[MARK] Syncing existing notes into jot_notes table...')
        const synced = oldNotes.map(n => ({
          title: n.title || 'Untitled Note',
          content: n.content || '',
          tags: n.tags ? (typeof n.tags === 'string' ? n.tags.split(',').map(t => t.trim()) : n.tags) : [],
          color: n.color || '#FFFFFF',
          is_pinned: Boolean(n.is_pinned),
          is_archived: Boolean(n.is_archived),
          is_checked: Boolean(n.is_checked),
          user_id: userId,
          created_at: n.created_at || new Date().toISOString(),
          updated_at: n.updated_at || new Date().toISOString()
        }))

        try {
          const { data: inserted, error: insertErr } = await supabase
            .from('jot_notes')
            .insert(synced)
            .select()

          if (!insertErr && Array.isArray(inserted) && inserted.length > 0) {
            setJotNotes(inserted)
            try { localStorage.setItem(`mark_jot_notes_${userId}`, JSON.stringify(inserted)) } catch { /* ignore */ }
            setLoading(false)
            return
          }
        } catch (e) {
          console.warn('[MARK] Supabase jot_notes sync error:', e)
        }
      }
    } catch (err) {
      console.warn('[MARK] Supabase jot_notes fetch error, falling back:', err)
    }

    // LocalStorage Fallback if jot_notes table missing or offline
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      if (userId) {
        const local = localStorage.getItem(`mark_jot_notes_${userId}`)
        if (local) {
          setJotNotes(JSON.parse(local))
          setLoading(false)
          return
        }
      }
    } catch { /* ignore */ }

    // Fallback to oldNotes if nothing else
    setJotNotes(oldNotes)
    setLoading(false)
  }, [oldNotes])

  useEffect(() => {
    fetchJotNotes()
  }, [fetchJotNotes])

  // Save / Update Jot Note
  const addOrUpdateJotNote = useCallback(async (notePayload) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      if (!userId) return

      let savedNote = { ...notePayload, user_id: userId }

      if (notePayload.id) {
        // Update existing
        try {
          const { data, error } = await supabase
            .from('jot_notes')
            .update({
              title: notePayload.title,
              content: notePayload.content,
              tags: notePayload.tags,
              color: notePayload.color,
              is_pinned: notePayload.is_pinned,
              is_archived: notePayload.is_archived,
              is_checked: notePayload.is_checked,
              checklist_items: notePayload.checklist_items || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', notePayload.id)
            .select()
            .single()

          if (!error && data) savedNote = data
        } catch (e) {
          console.warn('[MARK] jot_notes update error:', e)
        }

        setJotNotes(prev => {
          const updated = prev.map(n => n.id === notePayload.id ? { ...n, ...savedNote } : n)
          try { localStorage.setItem(`mark_jot_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
          return updated
        })
      } else {
        // Create new
        savedNote.id = 'jot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
        try {
          const { data, error } = await supabase
            .from('jot_notes')
            .insert([{
              title: notePayload.title,
              content: notePayload.content,
              tags: notePayload.tags,
              color: notePayload.color,
              is_pinned: notePayload.is_pinned,
              is_archived: notePayload.is_archived,
              is_checked: notePayload.is_checked,
              checklist_items: notePayload.checklist_items || [],
              user_id: userId
            }])
            .select()
            .single()

          if (!error && data) savedNote = data
        } catch (e) {
          console.warn('[MARK] jot_notes insert error:', e)
        }

        setJotNotes(prev => {
          const updated = [savedNote, ...prev]
          try { localStorage.setItem(`mark_jot_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
          return updated
        })
      }
    } catch (e) {
      console.error('[MARK] addOrUpdateJotNote error:', e)
    }
  }, [])

  // Delete Jot Note
  const deleteJotNote = useCallback(async (id) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id

      try {
        await supabase.from('jot_notes').delete().eq('id', id)
      } catch (e) {
        console.warn('[MARK] jot_notes delete error:', e)
      }

      setJotNotes(prev => {
        const updated = prev.filter(n => n.id !== id)
        if (userId) {
          try { localStorage.setItem(`mark_jot_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
        }
        return updated
      })
    } catch (e) {
      console.error('[MARK] deleteJotNote error:', e)
    }
  }, [])

  // Toggle Pin
  const togglePinJotNote = useCallback(async (id) => {
    const target = jotNotes.find(n => n.id === id)
    if (target) {
      await addOrUpdateJotNote({ ...target, is_pinned: !target.is_pinned })
    }
  }, [jotNotes, addOrUpdateJotNote])

  // Toggle Archive
  const toggleArchiveJotNote = useCallback(async (id) => {
    const target = jotNotes.find(n => n.id === id)
    if (target) {
      await addOrUpdateJotNote({ ...target, is_archived: !target.is_archived })
    }
  }, [jotNotes, addOrUpdateJotNote])

  const value = useMemo(() => ({
    jotNotes,
    loading,
    fetchJotNotes,
    addOrUpdateJotNote,
    deleteJotNote,
    togglePinJotNote,
    toggleArchiveJotNote
  }), [jotNotes, loading, fetchJotNotes, addOrUpdateJotNote, deleteJotNote, togglePinJotNote, toggleArchiveJotNote])

  return (
    <JotContext.Provider value={value}>
      {children}
    </JotContext.Provider>
  )
}

export function useJot() {
  const context = useContext(JotContext)
  if (!context) {
    throw new Error('useJot must be used within a JotProvider')
  }
  return context
}
