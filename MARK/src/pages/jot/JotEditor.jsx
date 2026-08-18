import React, { useState, useEffect } from 'react'
import { JOT_PASTEL_COLORS } from './JotCard'

export default function JotEditor({ note, onSave, onClose, onDelete }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [color, setColor] = useState('#FFFFFF')
  const [isPinned, setIsPinned] = useState(false)
  const [isArchived, setIsArchived] = useState(false)
  const [isChecked, setIsChecked] = useState(false)
  const [checklistItems, setChecklistItems] = useState([])
  const [newChecklistText, setNewChecklistText] = useState('')
  const [editorTab, setEditorTab] = useState('write') // 'write' | 'preview'

  useEffect(() => {
    if (note) {
      setTitle(note.title || '')
      setContent(note.content || '')
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

      if (Array.isArray(note.checklist_items)) {
        setChecklistItems(note.checklist_items)
      } else {
        setChecklistItems([])
      }
    } else {
      setTitle('')
      setContent('')
      setColor('#FFFFFF')
      setIsPinned(false)
      setIsArchived(false)
      setIsChecked(false)
      setTagsInput('')
      setChecklistItems([])
    }
  }, [note])

  // Markdown Insert Helper
  const insertMarkdown = (prefix, suffix = '') => {
    const textarea = document.getElementById('jot-editor-content')
    if (!textarea) return
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = content.substring(start, end)
    const replacement = prefix + selectedText + suffix
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

  // Checklist Item Handlers
  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return
    setChecklistItems(prev => [...prev, { id: 'chk_' + Date.now(), text: newChecklistText.trim(), completed: false }])
    setNewChecklistText('')
  }

  const handleToggleChecklist = (id) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const handleRemoveChecklist = (id) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const handleSave = () => {
    const formattedTags = tagsInput
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)

    const notePayload = {
      ...(note?.id ? { id: note.id } : {}),
      title: title.trim() || 'Untitled Note',
      content,
      tags: formattedTags,
      color,
      is_pinned: isPinned,
      is_archived: isArchived,
      is_checked: isChecked,
      checklist_items: checklistItems,
      updated_at: new Date().toISOString()
    }

    onSave(notePayload)
  }

  const selectedColorObj = JOT_PASTEL_COLORS.find(c => c.hex.toLowerCase() === color.toLowerCase()) || JOT_PASTEL_COLORS[0]
  const isDark = selectedColorObj.id === 'dark'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className={`relative w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border flex flex-col max-h-[90vh] transition-colors duration-200 ${selectedColorObj.bg} ${selectedColorObj.border} ${selectedColorObj.text}`}>
        
        {/* Top Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-black/5'}`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <h3 className="font-extrabold text-base tracking-tight">
              {note ? 'Edit Jot Note' : 'Create New Jot Note'}
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
            className={`w-full bg-transparent font-black text-lg sm:text-xl focus:outline-none placeholder:text-slate-400 ${isDark ? 'text-white' : 'text-slate-900'}`}
          />

          {/* Color Picker Palette */}
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">Color:</span>
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

          {/* Markdown Formatting Toolbar */}
          <div className={`p-2 rounded-2xl border flex flex-wrap items-center gap-1 text-xs ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/80 border-slate-200/80'}`}>
            <button type="button" onClick={() => insertMarkdown('# ')} className="px-2 py-1 hover:bg-black/5 rounded-lg font-bold">H1</button>
            <button type="button" onClick={() => insertMarkdown('## ')} className="px-2 py-1 hover:bg-black/5 rounded-lg font-bold">H2</button>
            <button type="button" onClick={() => insertMarkdown('**', '**')} className="px-2 py-1 hover:bg-black/5 rounded-lg font-bold">B</button>
            <button type="button" onClick={() => insertMarkdown('*', '*')} className="px-2 py-1 hover:bg-black/5 rounded-lg italic">I</button>
            <button type="button" onClick={() => insertMarkdown('~~', '~~')} className="px-2 py-1 hover:bg-black/5 rounded-lg line-through">S</button>
            <button type="button" onClick={() => insertMarkdown('- ')} className="px-2 py-1 hover:bg-black/5 rounded-lg">List</button>
            <button type="button" onClick={() => insertMarkdown('- [ ] ')} className="px-2 py-1 hover:bg-black/5 rounded-lg">Checklist</button>
            <button type="button" onClick={() => insertMarkdown('```\n', '\n```')} className="px-2 py-1 hover:bg-black/5 rounded-lg font-mono">Code</button>

            {/* Write vs Preview Mode Switch */}
            <div className="ml-auto flex items-center bg-black/5 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setEditorTab('write')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${editorTab === 'write' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={`px-3 py-1 text-[11px] font-bold rounded-lg transition ${editorTab === 'preview' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'}`}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Text Area / Live Preview */}
          {editorTab === 'write' ? (
            <textarea
              id="jot-editor-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note content..."
              rows={8}
              className={`w-full bg-transparent text-sm focus:outline-none resize-none font-medium leading-relaxed ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
            />
          ) : (
            <div className={`w-full min-h-[160px] p-3.5 rounded-2xl border text-sm leading-relaxed whitespace-pre-wrap font-medium ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-200' : 'bg-white/50 border-slate-200 text-slate-800'}`}>
              {content ? content : <span className="text-slate-400 italic">Nothing to preview...</span>}
            </div>
          )}

          {/* Interactive Checklist Section */}
          <div className={`p-4 rounded-2xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-white/60 border-slate-200/80'}`}>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>☑️ Checklist Items ({checklistItems.length})</span>
            </h4>

            {checklistItems.length > 0 && (
              <div className="space-y-2 mb-3">
                {checklistItems.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={`flex-1 font-medium ${item.completed ? 'line-through opacity-60' : ''}`}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(item.id)}
                      className="text-slate-400 hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddChecklistItem(); } }}
                placeholder="Add checklist item..."
                className={`flex-1 text-xs border rounded-xl px-3 py-2 bg-transparent focus:outline-none focus:ring-2 focus:ring-indigo-100 ${isDark ? 'border-slate-700 text-white' : 'border-slate-200 text-slate-800'}`}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-3.5 py-2 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-bold text-xs rounded-xl shadow-2xs hover:from-indigo-700 hover:to-purple-700 transition cursor-pointer"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Tags Input */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">🏷️ Tags (comma separated):</label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. work, personal, ideas"
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
              className="px-6 py-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
