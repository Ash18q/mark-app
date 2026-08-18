import React, { useState, useEffect } from 'react'
import { JOT_PASTEL_COLORS } from './JotCard'
import JotTipTapEditor from './JotTipTapEditor'

export default function JotEditor({ note, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState('')
  const [contentHtml, setContentHtml] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [color, setColor] = useState('#FFFFFF')
  const [isPinned, setIsPinned] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isChecked, setIsChecked] = useState(false)

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContentHtml(note.content || '')
      setColor(note.color || '#FFFFFF')
      setIsPinned(Boolean(note.is_pinned))
      setIsArchived(Boolean(note.is_archived))
      setIsChecked(Boolean(note.is_checked))
      
      const parsedTags = Array.isArray(note.tags)
        ? note.tags.join(', ')
        : typeof note.tags === 'string'
          ? note.tags
          : ''
      setTagsInput(parsedTags)
    } else {
      setTitle('')
      setContentHtml('')
      setColor('#FFFFFF')
      setIsPinned(false)
      setIsArchived(false)
      setIsChecked(false)
      setTagsInput('')
    }
  }, [note])

  const handleSave = () => {
    const formattedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const notePayload = {
      ...(note?.id ? { id: note.id } : {}),
      title: title.trim() || 'Untitled Note',
      content: contentHtml,
      tags: formattedTags,
      color,
      is_pinned: isPinned,
      is_archived: isArchived,
      is_checked: isChecked,
      updated_at: new Date().toISOString()
    }

    onSave(notePayload)
  }

  const selectedColorObj = JOT_PASTEL_COLORS.find(c => c.hex.toLowerCase() === color.toLowerCase()) || JOT_PASTEL_COLORS[0]
  const isDark = selectedColorObj.id === 'dark'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className={`relative w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[92vh] transition-colors duration-200 ${selectedColorObj.bg} ${selectedColorObj.border} ${selectedColorObj.text}`}>
        
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="font-extrabold text-base tracking-tight">
              {note ? 'Edit TipTap Jot Note' : 'Create Notion-Style Jot Note'}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Pin Button */}
            <button
              type="button"
              onClick={() => setIsPinned(!isPinned)}
              className={`p-2 rounded-xl transition cursor-pointer ${isPinned ? 'text-amber-500 font-bold bg-amber-50' : 'hover:bg-black/5'}`}
              title={isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              📌
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center font-bold text-sm transition cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Editor Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title..."
            className={`w-full bg-transparent font-black text-xl sm:text-2xl focus:outline-none placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
          />

          {/* Color Picker Palette */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Card Theme:</span>
            {JOT_PASTEL_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.hex)}
                className={`w-6 h-6 rounded-full border transition-all transform cursor-pointer shrink-0 ${c.bg} ${
                  color.toLowerCase() === c.hex.toLowerCase()
                    ? 'ring-2 ring-indigo-600 scale-110 shadow-xs'
                    : 'border-slate-300 hover:scale-105'
                }`}
                title={c.label}
              />
            ))}
          </div>

          {/* TipTap Notion-Style Editor */}
          <JotTipTapEditor
            content={contentHtml}
            onChange={(newHtml) => setContentHtml(newHtml)}
            isDark={isDark}
          />

          {/* Tags Input */}
          <div className="flex flex-col gap-1 pt-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏷️ Tags (comma separated):</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. work, project, checklist"
              className={`w-full text-xs border rounded-xl px-3.5 py-2.5 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium ${isDark ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-800'}`}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className={`p-4 px-6 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-black/5'}`}>
          {note?.id ? (
            <button
              type="button"
              onClick={() => onDelete(note.id)}
              className="px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition cursor-pointer"
            >
              Delete Note
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-black/5 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer active:scale-95"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
