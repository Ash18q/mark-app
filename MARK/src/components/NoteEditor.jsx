import { useState, useEffect, useRef } from 'react'
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
  const [content, setContent] = useState(note?.content || '')
  const [type, setType] = useState(note?.type || initialType)
  const [color, setColor] = useState(note?.color || DEFAULT_COLOR)
  const [customHex, setCustomHex] = useState('')

  // Checklist state
  const [checklistItems, setChecklistItems] = useState(
    Array.isArray(note?.checklist_items) ? note.checklist_items : []
  )
  const [newItemText, setNewItemText] = useState('')

  // Table state (Excel Grid)
  const [tableData, setTableData] = useState(() => {
    if (note?.table_data && Array.isArray(note.table_data.headers) && Array.isArray(note.table_data.rows)) {
      return note.table_data
    }
    return {
      headers: ['Item', 'Quantity / Note', 'Status'],
      rows: [
        ['Example 1', '10', 'Done'],
        ['Example 2', '5', 'Pending']
      ]
    }
  })

  // Tags state
  const [tags, setTags] = useState(
    note?.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  )
  const [tagInput, setTagInput] = useState('')
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false)
  const [showOptions, setShowOptions] = useState(false)
  const [showColorPickerModal, setShowColorPickerModal] = useState(false)
  const [showTextColorPicker, setShowTextColorPicker] = useState(false)
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)

  // Refs
  const titleInputRef = useRef(null)
  const textareaRef = useRef(null)

  const theme = getTheme(color)

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  // ─── Formatting Helpers for Rich Text Editor ───
  const applyFormatting = (prefix, suffix = prefix) => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selectedText = content.substring(start, end)

    const replacement = `${prefix}${selectedText || 'text'}${suffix}`
    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 4))
    }, 50)
  }

  const applyTextColor = (hexColor) => {
    applyFormatting(`<font color="${hexColor}">`, `</font>`)
    setShowTextColorPicker(false)
  }

  const applyHighlightColor = (hexColor) => {
    applyFormatting(`<mark style="background-color: ${hexColor}; color: #000; padding: 0 4px; border-radius: 4px;">`, `</mark>`)
    setShowBgColorPicker(false)
  }

  const insertHeading = (level) => {
    applyFormatting(`<h${level} style="font-size: ${level === 1 ? '1.25rem' : '1.1rem'}; font-weight: bold; margin: 4px 0;">`, `</h${level}>`)
  }

  const insertList = (listType) => {
    if (listType === 'bullet') {
      applyFormatting('\n• ', '')
    } else {
      applyFormatting('\n1. ', '')
    }
  }

  const clearFormatting = () => {
    const stripped = content.replace(/<[^>]*>/g, '')
    setContent(stripped)
  }

  // ─── Checklist Helper Functions ───
  const toggleChecklistItem = (id) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item))
  }

  const updateChecklistItemText = (id, text) => {
    setChecklistItems(prev => prev.map(item => item.id === id ? { ...item, text } : item))
  }

  const removeChecklistItem = (id) => {
    setChecklistItems(prev => prev.filter(item => item.id !== id))
  }

  const addChecklistItem = (textToAdd) => {
    const trimmed = textToAdd.trim()
    if (!trimmed) return
    const newItem = {
      id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: trimmed,
      completed: false
    }
    setChecklistItems(prev => [...prev, newItem])
    setNewItemText('')
  }

  // ─── Table (Excel Grid) Helper Functions ───
  const updateTableHeader = (colIdx, val) => {
    setTableData(prev => {
      const newHeaders = [...prev.headers]
      newHeaders[colIdx] = val
      return { ...prev, headers: newHeaders }
    })
  }

  const updateTableCell = (rowIdx, colIdx, val) => {
    setTableData(prev => {
      const newRows = prev.rows.map((row, r) => {
        if (r !== rowIdx) return row
        const newRow = [...row]
        newRow[colIdx] = val
        return newRow
      })
      return { ...prev, rows: newRows }
    })
  }

  const addTableRow = () => {
    setTableData(prev => {
      const emptyRow = new Array(prev.headers.length).fill('')
      return { ...prev, rows: [...prev.rows, emptyRow] }
    })
  }

  const addTableColumn = () => {
    setTableData(prev => {
      const newHeaders = [...prev.headers, `Col ${prev.headers.length + 1}`]
      const newRows = prev.rows.map(row => [...row, ''])
      return { headers: newHeaders, rows: newRows }
    })
  }

  const deleteTableRow = (rowIdx) => {
    if (tableData.rows.length <= 1) return
    setTableData(prev => ({
      ...prev,
      rows: prev.rows.filter((_, r) => r !== rowIdx)
    }))
  }

  const deleteTableColumn = (colIdx) => {
    if (tableData.headers.length <= 1) return
    setTableData(prev => ({
      headers: prev.headers.filter((_, c) => c !== colIdx),
      rows: prev.rows.map(row => row.filter((_, c) => c !== colIdx))
    }))
  }

  // ─── Tag Helper Functions ───
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
    onSave({
      id: note?.id,
      title: title.trim(),
      content: content.trim(),
      type,
      color,
      checklist_items: checklistItems,
      table_data: tableData,
      tags: tags.join(', '),
      is_pinned: isPinned
    })
  }

  // Filtered tags for autocomplete
  const tagSuggestions = allTags.filter(
    t => !tags.includes(t) && t.toLowerCase().includes(tagInput.toLowerCase())
  )

  // Standard Excel style palette list
  const standardColors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#64748b']

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-xl ${theme.bg} ${theme.text} rounded-3xl shadow-2xl overflow-hidden border ${theme.border} flex flex-col max-h-[92vh] transition-colors duration-300 relative`}>
        
        {/* ── Top Header Navigation Bar ── */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/25">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-white/10 opacity-90 transition cursor-pointer"
            title="Back / Cancel"
          >
            ‹
          </button>

          {/* Type Switcher */}
          <div className="flex items-center gap-1 bg-black/30 p-1 rounded-xl">
            <button
              onClick={() => setType('text')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                type === 'text'
                  ? 'bg-amber-400 text-gray-950 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📝 Note
            </button>
            <button
              onClick={() => setType('checklist')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                type === 'checklist'
                  ? 'bg-amber-400 text-gray-950 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📋 Checklist
            </button>
            <button
              onClick={() => setType('table')}
              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition ${
                type === 'table'
                  ? 'bg-amber-400 text-gray-950 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📊 Table
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5">
            {/* Color Palette Button */}
            <button
              onClick={() => setShowColorPickerModal(true)}
              className="w-8 h-8 rounded-full border-2 border-white/50 shadow-md transition transform hover:scale-110 cursor-pointer flex items-center justify-center text-sm"
              style={{ backgroundColor: theme.hex }}
              title="Note Page Background Color"
            >
              🎨
            </button>

            {/* Pin Toggle Button */}
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
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-gray-950 font-extrabold text-xs rounded-xl shadow-md transition cursor-pointer ml-1"
            >
              Done
            </button>
          </div>
        </div>

        {/* ── Editor Body ── */}
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

          {/* ── EXCEL / WORD STYLE RICH EDITING TOOLBAR (For Text Notes) ── */}
          {type === 'text' && (
            <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-black/30 border border-white/10 text-xs shadow-inner">
              {/* Font Format Group */}
              <div className="flex items-center gap-0.5 bg-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => applyFormatting('<b>', '</b>')}
                  className="px-2.5 py-1 font-black rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Bold (B)"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<i>', '</i>')}
                  className="px-2.5 py-1 italic rounded-lg hover:bg-white/20 transition cursor-pointer font-serif"
                  title="Italic (I)"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<u>', '</u>')}
                  className="px-2.5 py-1 underline rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Underline (U)"
                >
                  U
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting('<s>', '</s>')}
                  className="px-2 py-1 line-through rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Strikethrough (S)"
                >
                  S
                </button>
              </div>

              <div className="h-4 w-px bg-white/20 mx-0.5" />

              {/* Headings */}
              <div className="flex items-center gap-0.5 bg-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => insertHeading(1)}
                  className="px-2 py-1 font-bold text-xs rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Heading 1"
                >
                  H1
                </button>
                <button
                  type="button"
                  onClick={() => insertHeading(2)}
                  className="px-2 py-1 font-bold text-xs rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Heading 2"
                >
                  H2
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center gap-0.5 bg-white/10 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => insertList('bullet')}
                  className="px-2 py-1 font-bold rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Bullet List"
                >
                  • List
                </button>
                <button
                  type="button"
                  onClick={() => insertList('number')}
                  className="px-2 py-1 font-bold rounded-lg hover:bg-white/20 transition cursor-pointer"
                  title="Numbered List"
                >
                  1. List
                </button>
              </div>

              <div className="h-4 w-px bg-white/20 mx-0.5" />

              {/* Text Color Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowTextColorPicker(!showTextColorPicker); setShowBgColorPicker(false); }}
                  className="px-2.5 py-1 font-bold rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-1 cursor-pointer"
                  title="Text Font Color"
                >
                  <span className="font-extrabold text-amber-300">A</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {showTextColorPicker && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowTextColorPicker(false)} />
                    <div className="absolute left-0 top-8 z-30 bg-slate-900 text-white border border-slate-700 p-2.5 rounded-2xl shadow-2xl w-48 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Font Colors</div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {standardColors.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => applyTextColor(c)}
                            className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Text Highlight / Fill Color Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setShowBgColorPicker(!showBgColorPicker); setShowTextColorPicker(false); }}
                  className="px-2.5 py-1 font-bold rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center gap-1 cursor-pointer"
                  title="Highlight Background Fill Color"
                >
                  <span>🖍️</span>
                  <span className="text-[10px]">▼</span>
                </button>

                {showBgColorPicker && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowBgColorPicker(false)} />
                    <div className="absolute left-0 top-8 z-30 bg-slate-900 text-white border border-slate-700 p-2.5 rounded-2xl shadow-2xl w-48 space-y-2 animate-in fade-in zoom-in-95 duration-100">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highlight Fill</div>
                      <div className="grid grid-cols-5 gap-1.5">
                        {['#fef08a', '#bbf7d0', '#a5f3fc', '#fbcfe8', '#fed7aa', '#e9d5ff', '#cbd5e1'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => applyHighlightColor(c)}
                            className="w-6 h-6 rounded-full border border-white/20 hover:scale-110 transition"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Clear Formatting */}
              <button
                type="button"
                onClick={clearFormatting}
                className="px-2 py-1 text-[11px] opacity-75 hover:opacity-100 rounded-lg hover:bg-white/15 transition cursor-pointer ml-auto"
                title="Clear Formatting"
              >
                🧹 Clear
              </button>
            </div>
          )}

          {/* ── Content View: Text / Checklist / Table ── */}
          {type === 'text' ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note content here... (Use rich toolbar above for Bold, Italic, Colors, Headings)"
              rows={9}
              className="w-full bg-transparent text-sm leading-relaxed placeholder-white/40 focus:outline-none resize-none"
            />
          ) : type === 'checklist' ? (
            <div className="space-y-2.5">
              {/* Existing Checklist Items */}
              {checklistItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold transition shrink-0 ${
                      item.completed
                        ? 'bg-amber-400 border-amber-400 text-gray-900'
                        : 'border-white/40 hover:border-amber-400 text-transparent'
                    }`}
                  >
                    ✓
                  </button>
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addChecklistItem('')
                      }
                    }}
                    placeholder="List item..."
                    className={`w-full bg-transparent text-sm focus:outline-none ${
                      item.completed ? 'line-through opacity-50' : ''
                    }`}
                  />
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="opacity-50 hover:opacity-100 hover:text-red-300 text-xs p-1 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add New Checklist Item Input */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <span className="w-5 h-5 rounded border border-dashed border-white/30 flex items-center justify-center text-xs opacity-60">
                  +
                </span>
                <input
                  type="text"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addChecklistItem(newItemText)
                    }
                  }}
                  onBlur={() => {
                    if (newItemText.trim()) addChecklistItem(newItemText)
                  }}
                  placeholder="Add item..."
                  className="w-full bg-transparent text-sm placeholder-white/40 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            /* ── TABLE / EXCEL GRID EDITOR ── */
            <div className="space-y-3">
              <div className="overflow-x-auto no-scrollbar border border-white/15 rounded-2xl bg-black/30 p-2">
                <table className="w-full text-left border-collapse min-w-[320px]">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-white/20 bg-white/5">
                      {tableData.headers.map((header, cIdx) => (
                        <th key={cIdx} className="p-2 group relative">
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => updateTableHeader(cIdx, e.target.value)}
                              placeholder={`Col ${cIdx + 1}`}
                              className="w-full bg-transparent font-black text-xs text-amber-300 focus:outline-none"
                            />
                            {tableData.headers.length > 1 && (
                              <button
                                type="button"
                                onClick={() => deleteTableColumn(cIdx)}
                                className="text-red-300/60 hover:text-red-300 text-[10px] opacity-0 group-hover:opacity-100 transition px-1"
                                title="Delete Column"
                              >
                                ✕
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="w-8"></th>
                    </tr>
                  </thead>

                  {/* Table Rows */}
                  <tbody>
                    {tableData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-white/10 group last:border-0 hover:bg-white/5">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-1.5">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent text-xs focus:outline-none focus:bg-white/10 rounded px-1.5 py-1"
                            />
                          </td>
                        ))}
                        <td className="p-1 text-center">
                          {tableData.rows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => deleteTableRow(rIdx)}
                              className="text-red-300/60 hover:text-red-300 text-xs opacity-0 group-hover:opacity-100 transition"
                              title="Delete Row"
                            >
                              🗑️
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Action Controls: Add Row & Add Column */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={addTableRow}
                  className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-xs font-bold rounded-xl border border-white/15 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕ Add Row</span>
                </button>
                <button
                  type="button"
                  onClick={addTableColumn}
                  className="px-3.5 py-1.5 bg-black/40 hover:bg-black/60 text-xs font-bold rounded-xl border border-white/15 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕ Add Column</span>
                </button>
              </div>
            </div>
          )}

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

      {/* ── EXCEL-STYLE FULL NOTE PAGE COLOR PALETTE MODAL ── */}
      {showColorPickerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎨</span>
                <h3 className="font-extrabold text-sm text-slate-100">Note Page Theme Colors</h3>
              </div>
              <button
                onClick={() => setShowColorPickerModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Dark Color Palettes */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Dark Themes</div>
              <div className="grid grid-cols-4 gap-2.5">
                {Object.values(NOTE_COLORS).filter(c => !c.isLight).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setColor(c.id); setShowColorPickerModal(false); }}
                    className={`h-10 rounded-2xl border-2 transition transform hover:scale-105 flex flex-col items-center justify-center gap-0.5 text-white ${
                      color === c.id ? 'border-amber-400 scale-105 ring-2 ring-amber-400/50' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[10px] font-extrabold">{c.name.split(' ')[0]}</span>
                    {color === c.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Light Color Palettes */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Light Themes</div>
              <div className="grid grid-cols-3 gap-2.5">
                {Object.values(NOTE_COLORS).filter(c => c.isLight).map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setColor(c.id); setShowColorPickerModal(false); }}
                    className={`h-10 rounded-2xl border-2 transition transform hover:scale-105 flex flex-col items-center justify-center gap-0.5 text-slate-900 ${
                      color === c.id ? 'border-amber-500 scale-105 ring-2 ring-amber-500/50' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    <span className="text-[10px] font-extrabold">{c.name.split(' ')[0]}</span>
                    {color === c.id && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Hex Color Input */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="text-[11px] font-bold text-slate-400">Custom Color Hex:</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customHex}
                  onChange={(e) => setCustomHex(e.target.value)}
                  placeholder="#1e293b"
                  className="flex-1 bg-slate-800 text-white text-xs px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customHex.trim()) {
                      setColor(customHex.trim())
                      setShowColorPickerModal(false)
                    }
                  }}
                  className="px-4 py-2 bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
