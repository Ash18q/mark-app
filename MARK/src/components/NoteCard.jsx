import { useState } from 'react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  } catch {
    return dateStr
  }
}

export default function NoteCard({ note, onEdit, onDelete, onTogglePin, onToggleArchive, viewMode = 'grid' }) {
  const [showMenu, setShowMenu] = useState(false)

  const isChecklist = note.type === 'checklist' || (Array.isArray(note.checklist_items) && note.checklist_items.length > 0)
  const checklistItems = Array.isArray(note.checklist_items) ? note.checklist_items : []
  const tagsList = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  return (
    <div
      onClick={() => onEdit(note)}
      className={`group relative rounded-2xl p-4 shadow-sm border border-amber-900/20 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden text-[#eceebf] bg-[#434522] ${
        note.is_pinned ? 'ring-2 ring-amber-400/60' : ''
      } ${viewMode === 'list' ? 'min-h-[100px]' : 'min-h-[140px] max-h-[320px]'}`}
    >
      {/* ── Top Header: Title & Pin/Menu ── */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-base text-[#f5f7d2] leading-snug line-clamp-2 break-words">
            {note.title || (isChecklist ? 'Checklist' : 'Untitled Note')}
          </h3>
          
          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
            {note.is_pinned && (
              <span className="text-amber-400 text-sm font-bold" title="Pinned Note">
                📌
              </span>
            )}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg hover:bg-white/10 text-amber-200/70 hover:text-white transition opacity-80 sm:opacity-0 group-hover:opacity-100 cursor-pointer"
                title="Options"
              >
                ⋮
              </button>

              {/* Popup Action Menu */}
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-7 z-30 w-36 bg-white rounded-xl shadow-xl border border-gray-100 py-1 text-gray-800 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => { setShowMenu(false); onTogglePin(note.id); }}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-gray-700"
                    >
                      <span>{note.is_pinned ? '📌 Unpin' : '📌 Pin'}</span>
                    </button>
                    <button
                      onClick={() => { setShowMenu(false); onToggleArchive(note.id); }}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 flex items-center gap-2 text-gray-700"
                    >
                      <span>{note.is_archived ? '📥 Unarchive' : '📦 Archive'}</span>
                    </button>
                    <div className="border-t border-gray-100 my-0.5" />
                    <button
                      onClick={() => { setShowMenu(false); onDelete(note.id); }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2"
                    >
                      <span>🗑️ Delete</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Note Content Preview ── */}
        {isChecklist ? (
          <div className="space-y-1 mb-3 text-xs text-[#dce0ab] overflow-hidden line-clamp-5">
            {checklistItems.slice(0, 5).map((item, idx) => (
              <div key={item.id || idx} className="flex items-center gap-2 truncate">
                <span className={`text-xs ${item.completed ? 'text-amber-400' : 'text-amber-200/60'}`}>
                  {item.completed ? '☑' : '☐'}
                </span>
                <span className={`truncate ${item.completed ? 'line-through text-amber-200/50' : 'text-[#f0f2cc]'}`}>
                  {item.text || 'Item'}
                </span>
              </div>
            ))}
            {checklistItems.length > 5 && (
              <div className="text-[10px] text-amber-200/50 italic pt-0.5">
                +{checklistItems.length - 5} more items...
              </div>
            )}
          </div>
        ) : (
          <p className="text-xs text-[#e1e4b8] leading-relaxed whitespace-pre-line line-clamp-5 mb-3 break-words">
            {note.content || <span className="italic opacity-50">Empty note...</span>}
          </p>
        )}
      </div>

      {/* ── Bottom Footer: Tags & Date ── */}
      <div className="pt-2 border-t border-white/10 flex items-end justify-between gap-2 mt-auto text-[11px]">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 max-w-[70%]">
          {tagsList.map((tag) => (
            <span
              key={tag}
              className="bg-black/25 text-[#f7f8d6] font-semibold px-2 py-0.5 rounded-md text-[10px] truncate max-w-[100px]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Date */}
        <span className="text-[#c8cc96] font-medium text-[10px] whitespace-nowrap ml-auto">
          {formatDate(note.updated_at || note.created_at)}
        </span>
      </div>
    </div>
  )
}
