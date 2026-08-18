import React from 'react'

export const PASTEL_COLORS = [
  { id: 'white', bg: 'bg-white', border: 'border-slate-200/90', text: 'text-slate-800', label: 'White', hex: '#FFFFFF' },
  { id: 'lavender', bg: 'bg-purple-50/80', border: 'border-purple-200/80', text: 'text-purple-950', label: 'Lavender', hex: '#F5F3FF' },
  { id: 'mint', bg: 'bg-emerald-50/80', border: 'border-emerald-200/80', text: 'text-emerald-950', label: 'Mint', hex: '#F0FDF4' },
  { id: 'sky', bg: 'bg-sky-50/80', border: 'border-sky-200/80', text: 'text-sky-950', label: 'Sky Blue', hex: '#F0F9FF' },
  { id: 'sunset', bg: 'bg-amber-50/80', border: 'border-amber-200/80', text: 'text-amber-950', label: 'Sunset', hex: '#FFF7ED' },
  { id: 'rose', bg: 'bg-pink-50/80', border: 'border-pink-200/80', text: 'text-pink-950', label: 'Rose', hex: '#FDF2F8' },
  { id: 'yellow', bg: 'bg-yellow-50/80', border: 'border-yellow-200/80', text: 'text-yellow-950', label: 'Pastel Yellow', hex: '#FEFCE8' },
  { id: 'dark', bg: 'bg-slate-900', border: 'border-slate-800', text: 'text-slate-100', label: 'Obsidian', hex: '#1E293B' },
]

export default function NoteCard2({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  onOpenMindMap,
  isGhostMode = false
}) {
  if (!note) return null

  // Find color style object
  const colorObj = PASTEL_COLORS.find(c => c.hex.toLowerCase() === (note.color || '#ffffff').toLowerCase()) || PASTEL_COLORS[0]
  const isDark = colorObj.id === 'dark'

  // Format tags string array
  const tagsList = Array.isArray(note.tags)
    ? note.tags
    : typeof note.tags === 'string'
      ? note.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

  // Checklists parsing
  const checklistItems = Array.isArray(note.checklist_items) ? note.checklist_items : []
  const completedCount = checklistItems.filter(i => i.completed).length

  // Date formatting
  const formattedDate = note.updated_at || note.created_at
    ? new Date(note.updated_at || note.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : ''

  return (
    <div
      className={`group relative rounded-3xl p-5 border shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden ${colorObj.bg} ${colorObj.border} ${colorObj.text}`}
    >
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Title */}
          <h3 className={`font-black text-base leading-tight tracking-tight line-clamp-2 ${isGhostMode ? 'blur-xs select-none' : ''}`}>
            {isGhostMode ? '🔒 Private Note' : (note.title || 'Untitled Note')}
          </h3>

          {/* Action Icons */}
          <div className="flex items-center gap-1 shrink-0 opacity-90 group-hover:opacity-100 transition">
            {/* Mind Map Icon */}
            {onOpenMindMap && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onOpenMindMap(note); }}
                className={`p-1.5 rounded-xl transition cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-black/5 text-slate-600'}`}
                title="View Mind Map / Outline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}

            {/* Pin Toggle */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePin(note.id); }}
              className={`p-1.5 rounded-xl transition cursor-pointer ${note.is_pinned ? 'text-amber-500 font-bold' : isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-black/5 text-slate-400'}`}
              title={note.is_pinned ? 'Unpin note' : 'Pin note to top'}
            >
              <svg className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Note Preview Body */}
        <div className={`text-xs leading-relaxed mb-4 line-clamp-4 whitespace-pre-line ${isDark ? 'text-slate-300' : 'text-slate-600'} ${isGhostMode ? 'blur-xs select-none' : ''}`}>
          {isGhostMode ? '••••••••••••••••••••••••••••••••••••' : (note.content || 'No text content')}
        </div>

        {/* Checklist Progress Indicator */}
        {checklistItems.length > 0 && (
          <div className="mb-3 flex items-center gap-2">
            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-200/80'}`}>
              <div
                className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
                style={{ width: `${(completedCount / checklistItems.length) * 100}%` }}
              />
            </div>
            <span className={`text-[10px] font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {completedCount}/{checklistItems.length}
            </span>
          </div>
        )}

        {/* Tags List */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {tagsList.map((tag, idx) => (
              <span
                key={idx}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isDark
                    ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                    : 'bg-white/90 text-indigo-700 border border-indigo-100 shadow-2xs'
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className={`pt-3 border-t flex items-center justify-between text-[10px] ${isDark ? 'border-slate-800 text-slate-400' : 'border-black/5 text-slate-400'}`}>
        <span>{formattedDate}</span>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {/* Archive Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleArchive(note.id); }}
            className={`p-1 rounded-lg transition cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-black/5 text-slate-500'}`}
            title={note.is_archived ? 'Unarchive' : 'Archive'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm3 4h6" />
            </svg>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(note); }}
            className={`p-1 rounded-lg transition cursor-pointer ${isDark ? 'hover:bg-slate-800 text-indigo-400 font-bold' : 'hover:bg-black/5 text-indigo-600 font-bold'}`}
            title="Edit Note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 210.3H3v-3.572L16.732 3.732z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            className="p-1 rounded-lg hover:bg-red-50 text-red-500 transition cursor-pointer"
            title="Delete Note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
