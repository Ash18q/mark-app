import { useState, useMemo } from 'react'
import { useAuth } from '../context/AuthContext'
import NoteFilter from './NoteFilter'
import NoteCard from './NoteCard'
import NoteEditor from './NoteEditor'

export default function Notes({ isGhostMode = false }) {
  const { notes = [], addNote, updateNote, deleteNote, togglePinNote, toggleArchiveNote, tags: allTags = [] } = useAuth()

  const safeNotes = Array.isArray(notes) ? notes : []

  // State management
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date') // 'date' or 'title'
  const [sortOrder, setSortOrder] = useState('desc') // 'desc' or 'asc'
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [selectedTag, setSelectedTag] = useState('')
  const [showArchived, setShowArchived] = useState(false)

  // FAB Menu state
  const [isFabOpen, setIsFabOpen] = useState(false)

  // Editor Modal state
  const [editorState, setEditorState] = useState({
    isOpen: false,
    note: null,
    initialType: 'text'
  })

  // Delete confirmation modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // ─── Filter & Sort Logic ───
  const filteredNotes = useMemo(() => {
    return safeNotes.filter((n) => {
      if (!n) return false
      // Archived filter
      if (showArchived ? !n.is_archived : n.is_archived) return false

      // Tag filter
      if (selectedTag) {
        const noteTags = n.tags ? n.tags.split(',').map((t) => t.trim().toLowerCase()) : []
        if (!noteTags.includes(selectedTag.toLowerCase())) return false
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = n.title?.toLowerCase().includes(q)
        const contentMatch = n.content?.toLowerCase().includes(q)
        const tagMatch = n.tags?.toLowerCase().includes(q)
        const checklistMatch = Array.isArray(n.checklist_items) && n.checklist_items.some(i => i.text?.toLowerCase().includes(q))
        
        if (!titleMatch && !contentMatch && !tagMatch && !checklistMatch) return false
      }

      return true
    }).sort((a, b) => {
      // Always put pinned first if not strictly sorting
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1
      }

      if (sortBy === 'title') {
        const titleA = (a.title || '').toLowerCase()
        const titleB = (b.title || '').toLowerCase()
        const comp = titleA.localeCompare(titleB)
        return sortOrder === 'asc' ? comp : -comp
      } else {
        // Date sort
        const timeA = new Date(a.updated_at || a.created_at || 0).getTime()
        const timeB = new Date(b.updated_at || b.created_at || 0).getTime()
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
      }
    })
  }, [notes, showArchived, selectedTag, searchQuery, sortBy, sortOrder])

  // Pinned vs Unpinned split
  const pinnedNotes = useMemo(() => filteredNotes.filter((n) => n.is_pinned), [filteredNotes])
  const otherNotes = useMemo(() => filteredNotes.filter((n) => !n.is_pinned), [filteredNotes])

  // Handlers
  const handleSaveNote = async (noteData) => {
    if (noteData.id) {
      await updateNote(noteData.id, noteData)
    } else {
      await addNote(noteData)
    }
    setEditorState({ isOpen: false, note: null, initialType: 'text' })
  }

  const handleDeleteNote = async (id) => {
    await deleteNote(id)
    setDeleteConfirmId(null)
    setEditorState({ isOpen: false, note: null, initialType: 'text' })
  }

  return (
    <div className="space-y-5 pb-20">
      
      {/* ── Header Title & Search/Filter Controls ── */}
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-base shadow-sm">📝</span>
          <span>Notes & Checklists</span>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
            {filteredNotes.length}
          </span>
        </h1>
      </div>

      <NoteFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOrder={sortOrder}
        onToggleSortOrder={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedTag={selectedTag}
        onTagSelect={setSelectedTag}
        showArchived={showArchived}
        onToggleArchived={() => setShowArchived(!showArchived)}
        allTags={allTags}
      />

      {/* ── Empty State ── */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
            📝
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            {showArchived ? 'No archived notes' : searchQuery || selectedTag ? 'No matching notes found' : 'No notes yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
            {searchQuery || selectedTag
              ? 'Try adjusting your search terms or filters.'
              : 'Create your first note, checklist, or table to get started.'}
          </p>
          {!showArchived && (
            <div className="flex flex-wrap justify-center gap-2">
              <button
                onClick={() => setEditorState({ isOpen: true, note: null, initialType: 'text' })}
                className="btn-primary text-xs px-4 py-2"
              >
                + Note
              </button>
              <button
                onClick={() => setEditorState({ isOpen: true, note: null, initialType: 'checklist' })}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                + Checklist
              </button>
              <button
                onClick={() => setEditorState({ isOpen: true, note: null, initialType: 'table' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                + Table
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Pinned Notes Section ── */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-700 uppercase tracking-wider">
            <span>📌 Pinned Notes</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {pinnedNotes.length}
            </span>
          </div>

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-3'
                : 'space-y-3'
            }
          >
            {pinnedNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                isGhostMode={isGhostMode}
                onEdit={(n) => setEditorState({ isOpen: true, note: n, initialType: n.type || 'text' })}
                onDelete={(id) => setDeleteConfirmId(id)}
                onTogglePin={togglePinNote}
                onToggleArchive={toggleArchiveNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Other / Main Notes Section ── */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="text-xs font-extrabold text-gray-500 uppercase tracking-wider pt-2">
              <span>All Notes</span>
            </div>
          )}

          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 gap-3'
                : 'space-y-3'
            }
          >
            {otherNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                viewMode={viewMode}
                isGhostMode={isGhostMode}
                onEdit={(n) => setEditorState({ isOpen: true, note: n, initialType: n.type || 'text' })}
                onDelete={(id) => setDeleteConfirmId(id)}
                onTogglePin={togglePinNote}
                onToggleArchive={toggleArchiveNote}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Floating Action Button (FAB) ── */}
      <div className="fixed bottom-20 right-5 z-40 flex flex-col items-end gap-2">
        {/* Expanded FAB Menu Options */}
        {isFabOpen && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-slideUp">
            <button
              onClick={() => {
                setIsFabOpen(false)
                setEditorState({ isOpen: true, note: null, initialType: 'text' })
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-xl transition cursor-pointer"
            >
              <span>📝 Note</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false)
                setEditorState({ isOpen: true, note: null, initialType: 'checklist' })
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-2xl shadow-xl transition cursor-pointer"
            >
              <span>📋 Checklist</span>
            </button>

            <button
              onClick={() => {
                setIsFabOpen(false)
                setEditorState({ isOpen: true, note: null, initialType: 'table' })
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-xl transition cursor-pointer"
            >
              <span>📊 Table Grid</span>
            </button>
          </div>
        )}

        {/* Main Floating Circle Button */}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl font-black transition-all duration-200 cursor-pointer ${
            isFabOpen
              ? 'bg-slate-800 rotate-45 scale-105'
              : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 shadow-indigo-500/40'
          }`}
          title="Create Note, Checklist, or Table"
        >
          +
        </button>
      </div>

      {/* ── Note Editor Modal ── */}
      {editorState.isOpen && (
        <NoteEditor
          note={editorState.note}
          initialType={editorState.initialType}
          allTags={allTags}
          onSave={handleSaveNote}
          onDelete={handleDeleteNote}
          onClose={() => setEditorState({ isOpen: false, note: null, initialType: 'text' })}
        />
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 border border-slate-100 space-y-5 animate-scaleIn">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">
                🗑️
              </div>
              <h3 className="font-bold text-slate-800 text-base">Delete this note?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">This action cannot be undone and the note will be permanently removed.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(deleteConfirmId)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                Delete Note
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
