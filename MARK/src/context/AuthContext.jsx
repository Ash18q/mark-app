import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [links, setLinks] = useState([])
  const [notes, setNotes] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  // ─── Fetch links for the logged-in user ─────────────────────────────────────
  const fetchLinks = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (!error && data) {
        setLinks(data)
      }
    } catch (err) {
      console.error('[MARK] Fetch links error:', err)
    }
  }, [])

  // ─── Fetch notes for the logged-in user ─────────────────────────────────────
  const fetchNotes = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (!error && data) {
        setNotes(data)
        try { localStorage.setItem(`mark_notes_${userId}`, JSON.stringify(data)) } catch { /* ignore */ }
        return
      }
    } catch (err) {
      console.warn('[MARK] Supabase notes fetch error, using local fallback:', err)
    }

    // LocalStorage Fallback if Supabase notes table is missing or offline
    try {
      const local = localStorage.getItem(`mark_notes_${userId}`)
      if (local) {
        setNotes(JSON.parse(local))
      }
    } catch { /* ignore */ }
  }, [])

  // Combined tags calculation
  useEffect(() => {
    const linkTags = links.flatMap((l) => l.tag ? l.tag.split(',').map(t => t.trim()) : [])
    const noteTags = notes.flatMap((n) => n.tags ? n.tags.split(',').map(t => t.trim()) : [])
    const combined = [...new Set([...linkTags, ...noteTags].filter(Boolean))]
    setTags(combined)
  }, [links, notes])

  // ─── Link Operations ────────────────────────────────────────────────────────
  const addLink = useCallback(async ({ url, tag, platform }) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      throw new Error('Not authenticated. Please log in again.')
    }

    const userId = session.user.id

    const { data: existing } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', userId)
      .eq('url', url.trim())
      .maybeSingle()

    if (existing) {
      throw new Error('This link is already saved in your library!')
    }

    const { data, error } = await supabase
      .from('links')
      .insert([{ url: url.trim(), tag: tag.trim(), platform: platform.trim(), user_id: userId }])
      .select()
      .single()

    if (error) {
      console.error('[MARK] Insert error:', error)
      throw error
    }

    setLinks((prev) => [data, ...prev])
    return data
  }, [])

  const deleteLink = useCallback(async (id) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (error) {
      console.error('[MARK] Delete error:', error)
      throw error
    }
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  const updateLink = useCallback(async (id, { url, tag, platform }) => {
    const updates = { tag: tag.trim(), platform: platform.trim() }
    if (url !== undefined) updates.url = url.trim()

    const { data, error } = await supabase
      .from('links')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('[MARK] Update error:', error)
      throw error
    }

    setLinks((prev) => prev.map((l) => (l.id === id ? data : l)))
    return data
  }, [])

  // ─── Note Operations ────────────────────────────────────────────────────────
  const addNote = useCallback(async (noteData) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) throw new Error('Not authenticated. Please log in.')

    const newNote = {
      user_id: userId,
      title: (noteData.title || '').trim(),
      content: (noteData.content || '').trim(),
      type: noteData.type || 'text',
      checklist_items: noteData.checklist_items || [],
      tags: (noteData.tags || '').trim(),
      is_pinned: !!noteData.is_pinned,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    let createdNote = { ...newNote, id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) }

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single()

      if (!error && data) {
        createdNote = data
      }
    } catch (e) {
      console.warn('[MARK] Note insert Supabase error, using local fallback:', e)
    }

    setNotes((prev) => {
      const updated = [createdNote, ...prev]
      try { localStorage.setItem(`mark_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
      return updated
    })

    return createdNote
  }, [])

  const updateNote = useCallback(async (id, updates) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const updatedFields = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    try {
      await supabase.from('notes').update(updatedFields).eq('id', id)
    } catch (e) {
      console.warn('[MARK] Note update Supabase error:', e)
    }

    setNotes((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, ...updatedFields } : n))
      if (userId) {
        try { localStorage.setItem(`mark_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
      }
      return updated
    })
  }, [])

  const deleteNote = useCallback(async (id) => {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    try {
      await supabase.from('notes').delete().eq('id', id)
    } catch (e) {
      console.warn('[MARK] Note delete Supabase error:', e)
    }

    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      if (userId) {
        try { localStorage.setItem(`mark_notes_${userId}`, JSON.stringify(updated)) } catch { /* ignore */ }
      }
      return updated
    })
  }, [])

  const togglePinNote = useCallback(async (id) => {
    const target = notes.find((n) => n.id === id)
    if (target) {
      await updateNote(id, { is_pinned: !target.is_pinned })
    }
  }, [notes, updateNote])

  const toggleArchiveNote = useCallback(async (id) => {
    const target = notes.find((n) => n.id === id)
    if (target) {
      await updateNote(id, { is_archived: !target.is_archived })
    }
  }, [notes, updateNote])

  // ─── Auth helpers ────────────────────────────────────────────────────────────
  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setLinks([])
    setNotes([])
    setTags([])
  }, [])

  // ─── Session listener ────────────────────────────────────────────────────────
  useEffect(() => {
    try {
      const storageKeys = Object.keys(localStorage)
      const tokenKey = storageKeys.find((k) => k.includes('auth-token') || k.includes('sb-'))
      if (tokenKey) {
        const cached = JSON.parse(localStorage.getItem(tokenKey) || '{}')
        const u = cached?.user || cached?.currentSession?.user
        if (u) {
          setUser(u)
          setLoading(false)
          fetchLinks(u.id)
          fetchNotes(u.id)
        }
      }
    } catch { /* fallback to getSession */ }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('[MARK] getSession error:', error)
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchLinks(u.id)
        fetchNotes(u.id)
      }
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      setUser(u)
      if (u) {
        fetchLinks(u.id)
        fetchNotes(u.id)
      } else {
        setLinks([])
        setNotes([])
        setTags([])
      }
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchLinks, fetchNotes])

  return (
    <AuthContext.Provider
      value={{
        user,
        links,
        notes,
        tags,
        loading,
        addLink,
        updateLink,
        deleteLink,
        addNote,
        updateNote,
        deleteNote,
        togglePinNote,
        toggleArchiveNote,
        signUp,
        signIn,
        signOut,
        fetchLinks,
        fetchNotes,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
