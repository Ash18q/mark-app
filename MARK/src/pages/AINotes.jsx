import React, { useState, useEffect, useMemo } from 'react'
import { getAINotes, deleteAINote } from '../services/aiSummarizeService'

export default function AINotes({ userId, isGhostMode = false }) {
  const [notes, setNotes] = useState([])
  const [selectedTag, setSelectedTag] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)
  const [activeModalNote, setActiveModalNote] = useState(null)

  useEffect(() => {
    loadNotes()
  }, [userId])

  const loadNotes = async () => {
    setLoading(true)
    const data = await getAINotes(userId)
    setNotes(data || [])
    setLoading(false)
  }

  const handleDelete = async (noteId, e) => {
    if (e) e.stopPropagation()
    if (!window.confirm('Delete this AI summary note?')) return
    await deleteAINote(noteId, userId)
    setNotes(prev => prev.filter(n => n.id !== noteId))
    if (activeModalNote?.id === noteId) setActiveModalNote(null)
  }

  const handleCopyNote = (note, e) => {
    if (e) e.stopPropagation()
    const pointsText = note.key_points?.length ? `\n\nTakeaways:\n• ${note.key_points.join('\n• ')}` : ''
    const textToCopy = `📌 ${note.title}\n\nSummary:\n${note.summary}${pointsText}\n\nSource: ${note.source_url}`
    
    navigator.clipboard.writeText(textToCopy)
    setCopiedId(note.id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Derive unique tags
  const tagsList = useMemo(() => {
    const set = new Set(['All'])
    notes.forEach(n => {
      if (n.tag) set.add(n.tag)
    })
    return Array.from(set)
  }, [notes])

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesTag = selectedTag === 'All' || n.tag?.toLowerCase() === selectedTag.toLowerCase()
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch = !q || (
        n.title?.toLowerCase().includes(q) ||
        n.summary?.toLowerCase().includes(q) ||
        n.tag?.toLowerCase().includes(q) ||
        n.source_url?.toLowerCase().includes(q)
      )
      return matchesTag && matchesSearch
    })
  }, [notes, selectedTag, searchQuery])

  return (
    <div className="space-y-5 pb-24">
      {/* ── Page Header ── */}
      <div className="bg-gradient-to-tr from-indigo-900 via-purple-900 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🧠</span>
              <span className="text-xs font-black uppercase tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-purple-200">
                AI Knowledge Hub
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">AI Notes & Summaries</h1>
            <p className="text-xs text-purple-200/80 mt-1 max-w-md">
              Automated smart takeaways from your saved links, reels, articles & videos.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={loadNotes}
              className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs px-3 py-2 rounded-2xl border border-white/15 transition cursor-pointer flex items-center gap-1.5"
              title="Refresh Summaries"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
            <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-center">
              <div className="text-lg font-black leading-none">{notes.length}</div>
              <div className="text-[9px] font-bold uppercase tracking-wider text-purple-200">Summaries</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Category Filter Chips ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search AI notes, keywords, sources..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-200 font-medium pr-8"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {tagsList.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full font-extrabold text-[11px] transition cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag === 'All' ? '📚 All' : `📂 ${tag}`}
              {tag !== 'All' && (
                <span className="ml-1 text-[10px] opacity-75">
                  ({notes.filter(n => n.tag === tag).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Notes Content List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-bold">Loading AI summaries...</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="text-4xl">🤖</div>
          <h3 className="text-base font-extrabold text-slate-800">No AI Notes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || selectedTag !== 'All'
              ? 'No AI notes match your current filter or search term.'
              : 'Save any link or Instagram reel in your Library and click "✨ Summarize" to automatically generate smart notes!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotes.map(note => (
            <div
              key={note.id}
              onClick={() => setActiveModalNote(note)}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between space-y-3 relative group cursor-pointer"
            >
              {/* Top Header */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                      📂 {note.tag || 'General'}
                    </span>
                    <span className="text-[10px] font-extrabold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full uppercase">
                      {note.source_type || 'text'}
                    </span>
                  </div>

                  {/* Actions Right */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleCopyNote(note, e)}
                      className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 transition cursor-pointer text-xs"
                      title="Copy Summary"
                    >
                      {copiedId === note.id ? '✅' : '📋'}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDelete(note.id, e)}
                      className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer text-xs"
                      title="Delete AI Note"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Title & Thumbnail */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-extrabold text-sm sm:text-base text-slate-900 leading-snug ${isGhostMode ? 'blur-xs select-none' : ''}`}>
                      {isGhostMode ? '🔒 Private AI Summary' : note.title}
                    </h3>
                  </div>
                  {note.thumbnail_url && (
                    <img
                      src={note.thumbnail_url}
                      alt=""
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shrink-0"
                    />
                  )}
                </div>

                {/* Summary Text */}
                <p className={`text-xs text-slate-700 leading-relaxed mt-2.5 ${isGhostMode ? 'blur-xs select-none' : ''}`}>
                  {isGhostMode ? '••••••••••••••••••••••••••••••••••••' : note.summary}
                </p>

                {/* Key Takeaway Bullets */}
                {!isGhostMode && note.key_points && note.key_points.length > 0 && (
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1.5">
                    <div className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <span>💡</span>
                      <span>Key Takeaways</span>
                    </div>
                    <ul className="space-y-1 text-[11px] text-slate-800 font-semibold">
                      {note.key_points.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-snug">
                          <span className="text-indigo-600 font-black shrink-0">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Card Footer: Source URL Button & Date */}
              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>
                  {note.created_at ? new Date(note.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>

                {note.source_url && (
                  <a
                    href={note.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-indigo-600 font-extrabold hover:underline flex items-center gap-1 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 text-[10px]"
                  >
                    <span>🔗 View Source</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Full Note Detail Modal ── */}
      {activeModalNote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                  📂 {activeModalNote.tag || 'General'}
                </span>
                <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full uppercase">
                  {activeModalNote.source_type}
                </span>
              </div>
              <button
                onClick={() => setActiveModalNote(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-sm transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Title & Thumbnail */}
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {activeModalNote.title}
              </h2>
              {activeModalNote.thumbnail_url && (
                <img src={activeModalNote.thumbnail_url} alt="" className="w-16 h-16 rounded-2xl object-cover shrink-0 border" />
              )}
            </div>

            {/* Full Summary */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Executive Summary</h4>
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line font-medium">
                {activeModalNote.summary}
              </p>
            </div>

            {/* All Key Takeaway Bullets */}
            {activeModalNote.key_points && activeModalNote.key_points.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <span>💡</span>
                  <span>All Key Takeaways ({activeModalNote.key_points.length})</span>
                </h4>
                <div className="bg-indigo-50/60 border border-indigo-100 p-4 rounded-2xl space-y-2">
                  {activeModalNote.key_points.map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 font-medium">
                      <span className="text-indigo-600 font-black">•</span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {activeModalNote.source_url && (
                <a
                  href={activeModalNote.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition"
                >
                  <span>🔗</span>
                  <span>Open Source Link</span>
                </a>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleCopyNote(activeModalNote, e)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  {copiedId === activeModalNote.id ? '✅ Copied' : '📋 Copy Summary'}
                </button>
                <button
                  onClick={(e) => handleDelete(activeModalNote.id, e)}
                  className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition cursor-pointer"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
