import React from 'react'
import { getTheme } from '../utils/noteColors'

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

// Simple HTML/Markdown renderer for text notes
function FormattedText({ text }) {
  if (!text) return <span className="italic opacity-50">Empty note...</span>

  if (/<[a-z][\s\S]*>/i.test(text)) {
    return <div className="rich-note-content" dangerouslySetInnerHTML={{ __html: text }} />
  }

  return <span>{text}</span>
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  viewMode = 'grid',
  isGhostMode = false
}) {
  const theme = getTheme(note.color)

  const isChecklist = note.type === 'checklist' || (Array.isArray(note.checklist_items) && note.checklist_items.length > 0)
  const isTable = note.type === 'table' || (note.table_data && Array.isArray(note.table_data.rows))

  const checklistItems = Array.isArray(note.checklist_items) ? note.checklist_items : []
  const tableData = note.table_data || { headers: [], rows: [] }
  const tagsList = note.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []

  const displayTitle = isGhostMode ? '🔒 Private Note' : (note.title || (isTable ? 'Table Grid' : isChecklist ? 'Checklist' : 'Untitled Note'))

  const handleCopyContent = (e) => {
    e.stopPropagation()
    const plainText = (note.content || '').replace(/<[^>]+>/g, '')
    const textToCopy = `${note.title || ''}\n\n${plainText}`
    navigator.clipboard.writeText(textToCopy)
  }

  return (
    <div
      onClick={() => onEdit(note)}
      style={{ backgroundColor: theme.hex }}
      className={`group relative rounded-3xl p-4 sm:p-5 border ${theme.border} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden ${theme.text} ${theme.bg} ${
        note.is_pinned ? 'ring-2 ring-amber-400/80 shadow-amber-400/10' : 'shadow-md'
      } ${viewMode === 'list' ? 'min-h-[110px]' : 'min-h-[160px] max-h-[340px]'}`}
    >
      {/* ── Top Header: Title & Bookmark / Pin Icon ── */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={`font-black text-base sm:text-lg ${theme.title} leading-tight tracking-tight line-clamp-2 break-words ${isGhostMode ? 'blur-xs select-none' : ''}`}>
            {displayTitle}
          </h3>
          
          {/* Top Right Bookmark / Pin Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onTogglePin(note.id)
            }}
            className={`p-1.5 rounded-xl transition cursor-pointer shrink-0 ${
              note.is_pinned
                ? 'bg-amber-100/80 text-amber-600 shadow-2xs font-bold'
                : 'hover:bg-black/5 text-slate-400 border border-slate-200/60 bg-white/70'
            }`}
            title={note.is_pinned ? 'Unpin note' : 'Bookmark / Pin note'}
          >
            <svg className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>

        {/* ── Content View ── */}
        {isGhostMode ? (
          <div className="text-xs italic opacity-75 mb-3 py-2 font-medium">
            🔒 Locked in Ghost Mode
          </div>
        ) : isTable ? (
          /* Table Grid Preview */
          <div className="mb-3 overflow-x-auto no-scrollbar max-h-36 border border-white/10 rounded-xl bg-black/20 p-1.5 text-[11px]">
            <table className="w-full text-left border-collapse">
              {tableData.headers && tableData.headers.length > 0 && (
                <thead>
                  <tr className="border-b border-white/15">
                    {tableData.headers.slice(0, 4).map((h, i) => (
                      <th key={i} className="p-1 font-extrabold truncate max-w-[80px]">
                        {h || `Col ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {(tableData.rows || []).slice(0, 3).map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-white/5 last:border-0">
                    {(row || []).slice(0, 4).map((cell, cIdx) => (
                      <td key={cIdx} className="p-1 truncate max-w-[80px] opacity-90">
                        {cell || '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : isChecklist ? (
          /* Checklist Preview */
          <div className="space-y-1 mb-3 text-xs opacity-90 overflow-hidden line-clamp-5">
            {checklistItems.slice(0, 5).map((item, idx) => (
              <div key={item.id || idx} className="flex items-center gap-2 truncate">
                <span className="text-xs shrink-0">
                  {item.completed ? '☑' : '☐'}
                </span>
                <span className={`truncate ${item.completed ? 'line-through opacity-60' : ''}`}>
                  {item.text || 'Item'}
                </span>
              </div>
            ))}
            {checklistItems.length > 5 && (
              <div className="text-[10px] opacity-60 italic pt-0.5">
                +{checklistItems.length - 5} more items...
              </div>
            )}
          </div>
        ) : (
          /* Text Preview */
          <div className="text-xs leading-relaxed line-clamp-5 mb-3 break-words opacity-90">
            <FormattedText text={note.content} />
          </div>
        )}

      </div>

      {/* ── Bottom Footer: Date Left + Action Icons Right ── */}
      <div className="pt-2.5 border-t border-black/5 flex items-center justify-between text-[11px]">
        {/* Date */}
        <span className="opacity-75 font-semibold text-[10px]">
          {formatDate(note.updated_at || note.created_at)}
        </span>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition">
          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopyContent}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition cursor-pointer"
            title="Copy Note Text"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Archive Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onToggleArchive(note.id)
            }}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 transition cursor-pointer"
            title={note.is_archived ? 'Unarchive Note' : 'Archive Note'}
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm3 4h6" />
            </svg>
          </button>

          {/* Edit Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onEdit(note)
            }}
            className="p-1 rounded-lg hover:bg-black/5 opacity-75 hover:opacity-100 transition cursor-pointer"
            title="Edit Note"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(note.id)
            }}
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
