import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [links, setLinks] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)

  // ─── Fetch links for the logged-in user ─────────────────────────────────────
  const fetchLinks = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('links')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (!error && data) {
      setLinks(data)
      // Extract distinct tags for autocomplete
      const distinctTags = [...new Set(data.map((l) => l.tag).filter(Boolean))]
      setTags(distinctTags)
    }
  }, [])

  // ─── Add a new link ──────────────────────────────────────────────────────────
  const addLink = useCallback(async ({ url, tag, platform }) => {
    // ✅ FIX: Live session se user_id lo — React state stale ho sakti hai
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      console.error('[MARK] Session missing on insert:', sessionError)
      throw new Error('Not authenticated. Please log in again.')
    }

    const userId = session.user.id
    console.debug('[MARK] Inserting link with user_id:', userId)

    // ✅ Duplicate URL check
    const { data: existing, error: checkError } = await supabase
      .from('links')
      .select('id')
      .eq('user_id', userId)
      .eq('url', url.trim())
      .maybeSingle()

    if (checkError) {
      console.error('[MARK] Duplicate check error:', checkError)
    }

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
    setTags((prev) => (prev.includes(tag) ? prev : [tag, ...prev]))
    return data
  }, [])  // ✅ user dependency hataya — ab live session use hoti hai

  // ─── Delete a link ───────────────────────────────────────────────────────────
  const deleteLink = useCallback(async (id) => {
    const { error } = await supabase.from('links').delete().eq('id', id)
    if (error) {
      console.error('[MARK] Delete error:', error)
      throw error
    }
    setLinks((prev) => prev.filter((l) => l.id !== id))
  }, [])

  // ─── Update a link (url + tag + platform) ───────────────────────────────────
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

    // Optimistic local update — no page refresh needed
    setLinks((prev) => prev.map((l) => (l.id === id ? data : l)))
    setTags((prev) => (prev.includes(data.tag) ? prev : [data.tag, ...prev]))
    return data
  }, [])

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
    setTags([])
  }, [])

  // ─── Session listener ────────────────────────────────────────────────────────
  useEffect(() => {
    // ⚡ Fast synchronous check of cached session from localStorage to eliminate open delay
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
        }
      }
    } catch { /* fallback to getSession */ }

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) console.error('[MARK] getSession error:', error)
      const u = session?.user ?? null
      console.debug('[MARK] Initial session user:', u?.id ?? 'none')
      setUser(u)
      if (u) fetchLinks(u.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user ?? null
      console.debug('[MARK] Auth event:', event, '| user:', u?.id ?? 'none')
      setUser(u)
      if (u) fetchLinks(u.id)
      else { setLinks([]); setTags([]) }
      setLoading(false)
    })

    return () => listener.subscription.unsubscribe()
  }, [fetchLinks])

  return (
    <AuthContext.Provider value={{ user, links, tags, loading, addLink, updateLink, deleteLink, signUp, signIn, signOut, fetchLinks }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
