import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { Highlight } from '@tiptap/extension-highlight'
import { Underline } from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'

import { FontFamily } from '@tiptap/extension-font-family'

import Toolbar from './Toolbar'
import ColorPicker from './ColorPicker'
import { NOTE_COLORS, DEFAULT_COLOR, getTheme } from '../utils/noteColors'

export default function NoteEditor({
  note = null,
  initialType = 'text',
  onSave,
  onDelete,
  onClose,
  allTags = []
}) {
  const [title, setTitle] = useState(note?.title || '')
  const [color, setColor] = useState(note?.color || DEFAULT_COLOR)
  const [tags, setTags] = useState(
    note?.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  )
  const [tagInput, setTagInput] = useState('')
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false)
  const [showOptions, setShowOptions] = useState(false)
  const [showNoteBgPicker, setShowNoteBgPicker] = useState(false)

  const titleInputRef = useRef(null)
  const theme = getTheme(color)

  // Initialize TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true }
      }),
      TextStyle,
      FontFamily,
      Color,
      Highlight.configure({ multicolors: true }),
      Underline,
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'mark-tiptap-table'
        }
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: 'Type rich content or insert an Excel table...'
      })
    ],
    content: note?.content || (initialType === 'table' ? '<table><tr><th>Item</th><th>Quantity</th><th>Status</th></tr><tr><td>Task 1</td><td>10</td><td>Done</td></tr></table>' : ''),
    editorProps: {
      attributes: {
        class: 'focus:outline-none min-h-[220px] prose dark:prose-invert max-w-none text-sm leading-relaxed p-2'
      }
    }
  })

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  // ─── Tag Helpers ───
  const handleAddTag = (tagToAdd) => {
    const trimmed = tagToAdd.trim().replace(/^#/, '')
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed])
    }
    setTagInput('')
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  // ─── Save Handler ───
  const handleSave = () => {
    const htmlContent = editor ? editor.getHTML() : ''
    onSave({
      id: note?.id,
      title: title.trim(),
      content: htmlContent,
      type: editor?.isActive('table') ? 'table' : (note?.type || initialType),
      color,
      tags: tags.join(', '),
      is_pinned: isPinned
    })
  }

  const tagSuggestions = allTags.filter(
    t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div style={{ backgroundColor: theme.hex }} className={`w-full max-w-2xl ${theme.bg} ${theme.text} rounded-3xl shadow-2xl overflow-hidden border ${theme.border} flex flex-col max-h-[94vh] transition-colors duration-300 relative`}>
        
        {/* ── Top Header Navigation Bar ── */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/25 shrink-0">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-white/10 opacity-90 transition cursor-pointer"
            title="Back / Cancel"
          >
            ‹
          </button>

          {/* Title Header Tag */}
          <div className="text-xs font-black tracking-wide uppercase opacity-80 flex items-center gap-1.5">
            <span>📝</span>
            <span>Rich Note & Table Editor</span>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-1.5">
            {/* Note Card Background Color Picker Button */}
            <div className="relative">
              <button
                onClick={() => setShowNoteBgPicker(!showNoteBgPicker)}
                className="w-8 h-8 rounded-full border-2 border-white/50 shadow-md transition transform hover:scale-110 cursor-pointer flex items-center justify-center text-sm"
                style={{ backgroundColor: theme.hex }}
                title="Note Card Background Color"
              >
                🎨
              </button>

              {showNoteBgPicker && (
                <div className="absolute right-0 top-9 z-50">
                  <ColorPicker
                    title="Card Theme Color"
                    selectedColor={color}
                    showNoFill={false}
                    onChange={(selected) => {
                      setColor(selected)
                      setShowNoteBgPicker(false)
                    }}
                    onClose={() => setShowNoteBgPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Pin Button */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isPinned ? 'bg-amber-400 text-gray-900 font-bold' : 'hover:bg-white/10 opacity-80'
              }`}
              title={isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              📌
            </button>

            {/* Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 rounded-full hover:bg-white/10 opacity-80 transition cursor-pointer"
                title="Options"
              >
                ⋮
              </button>

              {showOptions && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowOptions(false)} />
                  <div className="absolute right-0 top-9 z-20 w-44 bg-white text-gray-800 rounded-2xl shadow-xl border border-gray-100 py-1.5 text-xs font-semibold animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => { setIsPinned(!isPinned); setShowOptions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-amber-50 flex items-center justify-between text-gray-700"
                    >
                      <span>Pin Note</span>
                      <span>{isPinned ? '✓' : ''}</span>
                    </button>
                    <button
                      onClick={() => { onClose(); setShowOptions(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-amber-50 text-gray-700"
                    >
                      Discard Changes
                    </button>
                    {note?.id && (
                      <>
                        <div className="border-t border-gray-100 my-1" />
                        <button
                          onClick={() => { setShowOptions(false); onDelete(note.id); }}
                          className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-bold flex items-center gap-2"
                        >
                          <span>🗑️ Delete Note</span>
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Done / Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer ml-1"
            >
              Done
            </button>
          </div>
        </div>

        {/* ── MS EXCEL-STYLE RIBBON TOOLBAR ── */}
        <div className="p-2 border-b border-white/10 bg-black/15 shrink-0">
          <Toolbar editor={editor} />
        </div>

        {/* ── Editor Body Area ── */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
          
          {/* Note Title Input */}
          <input
            ref={titleInputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
            className={`w-full bg-transparent text-xl font-extrabold ${theme.title} placeholder-white/40 focus:outline-none border-b border-white/10 pb-2`}
          />

          {/* TipTap Rich Editor Canvas */}
          <div className="bg-black/20 rounded-2xl border border-white/15 p-3 min-h-[220px] shadow-inner overflow-x-auto">
            <EditorContent editor={editor} />
          </div>

          {/* ── Tags Input Section ── */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold opacity-75">Tags:</span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 border border-white/10"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="opacity-70 hover:opacity-100 text-xs font-bold"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>

            <div className="relative">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    handleAddTag(tagInput)
                  }
                }}
                placeholder="Add tag (e.g. Portfolio, Best AI)..."
                className="w-full bg-black/25 text-xs text-white placeholder-white/40 px-3.5 py-2.5 rounded-xl focus:outline-none border border-white/15"
              />

              {/* Tag Suggestions Dropdown */}
              {tagInput && tagSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 bottom-full mb-1 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 py-1 max-h-32 overflow-y-auto z-20">
                  {tagSuggestions.map((t) => (
                    <button
                      key={t}
                      onClick={() => handleAddTag(t)}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-amber-50 flex items-center gap-1.5 font-medium"
                    >
                      <span>🏷️</span>
                      <span>{t}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
