import React from 'react'
import JotCard from './JotCard'

export default function JotList({
  notes,
  viewMode,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
  isGhostMode = false
}) {
  const safeNotes = Array.isArray(notes) ? notes : []
  const pinnedNotes = safeNotes.filter(n => n.is_pinned)
  const otherNotes = safeNotes.filter(n => !n.is_pinned)

  if (safeNotes.length === 0) {
    return (
      <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 via-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-inner">
          📝
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">No Jot Notes found</h3>
        <p className="text-xs text-slate-500 max-w-xs mx-auto mb-4 leading-relaxed">
          Create your first note or checklist item to get started.
        </p>
      </div>
    )
  }

  const containerClass = viewMode === 'grid'
    ? 'grid grid-cols-1 sm:grid-cols-2 gap-4'
    : 'flex flex-col gap-3'

  return (
    <div className="space-y-6">
      {/* Pinned Section */}
      {pinnedNotes.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>📌 Pinned Notes ({pinnedNotes.length})</span>
          </div>
          <div className={containerClass}>
            {pinnedNotes.map(note => (
              <JotCard
                key={note.id}
                note={note}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                isGhostMode={isGhostMode}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Notes Section */}
      {otherNotes.length > 0 && (
        <div className="space-y-3">
          {pinnedNotes.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider pt-2 border-t border-slate-200/60">
              <span>📝 Other Notes ({otherNotes.length})</span>
            </div>
          )}
          <div className={containerClass}>
            {otherNotes.map(note => (
              <JotCard
                key={note.id}
                note={note}
                onEdit={onEdit}
                onDelete={onDelete}
                onTogglePin={onTogglePin}
                onToggleArchive={onToggleArchive}
                isGhostMode={isGhostMode}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
