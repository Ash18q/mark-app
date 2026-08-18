import React, { useState, useMemo } from 'react'
import { useJot } from '../../context/JotContext'
import JotList from './JotList'
import JotEditor from './JotEditor'

export default function JotMain({ isGhostMode = false }) {
  const {
    jotNotes = [],
    loading,
    addOrUpdateJotNote,
    deleteJotNote,
    togglePinJotNote,
    toggleArchiveJotNote
  } = useJot()

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  // Editor Modal
  const [editorState, setEditorState] = useState({ isOpen: false, note: null })

  // Derive available tags
  const allTags = useMemo(() => {
    const tagsSet = new Set()
    if (Array.isArray(jotNotes)) {
      jotNotes.forEach(n => {
        if (!n) return
        if (Array.isArray(n.tags)) {
          n.tags.forEach(t => t && tagsSet.add(t))
        } else if (typeof n.tags === 'string') {
          n.tags.split(',').forEach(t => t && tagsSet.add(t.trim()))
        }
      })
    }
    return [...tagsSet].filter(Boolean)
  }, [jotNotes])

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    if (!Array.isArray(jotNotes)) return []
    return jotNotes.filter(n => {
      if (!n) return false

      // Archive filter
      if (showArchived ? !n.is_archived : n.is_archived) return false

      // Tag filter
      if (selectedTag) {
        const noteTags = Array.isArray(n.tags)
          ? n.tags
          : typeof n.tags === 'string'
            ? n.tags.split(',').map(t => t.trim())
            : []
        if (!noteTags.map(t => t.toLowerCase()).includes(selectedTag.toLowerCase())) return false
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = (n.title || '').toLowerCase().includes(q)
        const contentMatch = (n.content || '').toLowerCase().includes(q)
        const tagsMatch = Array.isArray(n.tags) ? n.tags.some(t => (t || '').toLowerCase().includes(q)) : (n.tags || '').toLowerCase().includes(q)
        if (!titleMatch && !contentMatch && !tagsMatch) return false
      }

      return true
    })
  }, [jotNotes, showArchived, selectedTag, searchQuery])

  return (
    <div className="space-y-5 pb-20">
      
      {/* ── Header Title Row ── */}
      <div className="flex items-center justify-between bg-white border border-slate-100/90 rounded-2xl px-4 py-3.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center font-bold text-base shadow-sm">
            📝
          </div>
          <div>
            <h2 className="text-slate-900 font-extrabold text-base tracking-tight leading-tight flex items-center gap-2">
              <span>Jot Notes</span>
              <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-2 py-0.5 rounded-full font-extrabold shadow-2xs">
                PRO
              </span>
            </h2>
            <p className="text-slate-400 text-[10px] font-medium">{filteredNotes.length} notes available</p>
          </div>
        </div>

        {/* Top Right Create Note Button */}
        <button
          type="button"
          onClick={() => setEditorState({ isOpen: true, note: null })}
          className="px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <span>➕</span>
          <span>New Note</span>
        </button>
      </div>

      {/* ── Search & Filter Control Bar ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search jot notes by title, content, or tag..."
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium pr-8"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Controls Row: Tag Chips + View Mode + Archive Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
          {/* Tag Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 flex-1 min-w-[200px]">
            <button
              type="button"
              onClick={() => setSelectedTag('')}
              className={`px-3 py-1 rounded-full font-bold text-[11px] transition cursor-pointer shrink-0 ${
                selectedTag === ''
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({jotNotes.length})
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                className={`px-3 py-1 rounded-full font-bold text-[11px] transition cursor-pointer shrink-0 ${
                  selectedTag === tag
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Right View Mode & Archive Toggles */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Explicit 2-Tab Segment: Active Notes vs Archived Notes */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => showArchived && setShowArchived(false)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  !showArchived
                    ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                📝 Active Notes
              </button>
              <button
                type="button"
                onClick={() => !showArchived && setShowArchived(true)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  showArchived
                    ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                📦 Archived Notes
              </button>
            </div>

            {/* View Mode Grid/List */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-lg transition ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-lg transition ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
                title="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Note List ── */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs font-medium">
          Loading Jot Notes...
        </div>
      ) : (
        <JotList
          notes={filteredNotes}
          viewMode={viewMode}
          onEdit={(note) => setEditorState({ isOpen: true, note })}
          onDelete={deleteJotNote}
          onTogglePin={togglePinJotNote}
          onToggleArchive={toggleArchiveJotNote}
          isGhostMode={isGhostMode}
        />
      )}

      {/* ── Note Editor Modal ── */}
      {editorState.isOpen && (
        <JotEditor
          note={editorState.note}
          onSave={addOrUpdateJotNote}
          onClose={() => setEditorState({ isOpen: false, note: null })}
          onDelete={deleteJotNote}
        />
      )}
    </div>
  )
}
