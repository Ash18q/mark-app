import { useState, useEffect, useRef } from 'react'
import { NOTE_COLORS, DEFAULT_COLOR } from '../utils/noteColors'

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
  const [showColorPicker, setShowColorPicker] = useState(false)

  // Ref for title focus & text area selection formatting
  const titleInputRef = useRef(null)
  const textareaRef = useRef(null)

  const theme = NOTE_COLORS[color] || NOTE_COLORS.olive

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

  // ─── Formatting Helpers for Rich Text ───
  const applyFormatting = (prefix, suffix = prefix) => {
    const el = textareaRef.current
    if (!el) return

    const start = el.selectionStart
    const end = el.selectionEnd
    const selectedText = content.substring(start, end)

    let replacement = ''
    if (prefix.startsWith('<') && prefix.endsWith('>')) {
      // HTML tag format
      replacement = `${prefix}${selectedText || 'text'}${suffix}`
    } else {
      // Markdown format
      replacement = `${prefix}${selectedText || 'text'}${suffix}`
    }

    const newContent = content.substring(0, start) + replacement + content.substring(end)
    setContent(newContent)

    // Re-focus and set selection
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selectedText ? selectedText.length : 4))
    }, 50)
  }

  const applyColorFormat = (hexColor) => {
    applyFormatting(`<font color="${hexColor}">`, `</font>`)
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

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className={`w-full max-w-xl ${theme.bg} ${theme.text} rounded-3xl shadow-2xl overflow-hidden border ${theme.border} flex flex-col max-h-[92vh] transition-colors duration-300`}>
        
        {/* ── Top Header Navigation Bar ── */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/20">
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
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                type === 'text'
                  ? 'bg-amber-400 text-gray-950 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📝 Note
            </button>
            <button
              onClick={() => setType('checklist')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                type === 'checklist'
                  ? 'bg-amber-400 text-gray-950 shadow-2xs'
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              📋 Checklist
            </button>
            <button
              onClick={() => setType('table')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
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
            <div className="relative">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-7 h-7 rounded-full border-2 border-white/40 shadow-inner transition transform hover:scale-105 cursor-pointer flex items-center justify-center text-xs"
                style={{ backgroundColor: theme.hex }}
                title="Change Note Color"
              >
                🎨
              </button>

              {/* Color Picker Dropdown */}
              {showColorPicker && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowColorPicker(false)} />
                  <div className="absolute right-0 top-9 z-30 bg-gray-900/95 backdrop-blur border border-gray-700 p-2.5 rounded-2xl shadow-2xl grid grid-cols-4 gap-2 animate-in fade-in zoom-in-95 duration-100">
                    {Object.values(NOTE_COLORS).map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setColor(c.id); setShowColorPicker(false); }}
                        className={`w-7 h-7 rounded-full border-2 transition transform hover:scale-110 flex items-center justify-center text-[10px] ${
                          color === c.id ? 'border-amber-400 scale-110 ring-2 ring-amber-400/50' : 'border-white/20'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {color === c.id ? '✓' : ''}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

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

            {/* Options Menu Dropdown */}
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

          {/* ── RICH TEXT FORMATTING TOOLBAR (For Text Notes) ── */}
          {type === 'text' && (
            <div className="flex flex-wrap items-center gap-1 p-1.5 rounded-xl bg-black/25 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => applyFormatting('<b>', '</b>')}
                className="px-2 py-1 font-extrabold rounded hover:bg-white/15 cursor-pointer"
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('<i>', '</i>')}
                className="px-2 py-1 italic rounded hover:bg-white/15 cursor-pointer"
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                onClick={() => applyFormatting('<u>', '</u>')}
                className="px-2 py-1 underline rounded hover:bg-white/15 cursor-pointer"
                title="Underline"
              >
                U
              </button>
              
              <div className="h-4 w-px bg-white/20 mx-1" />

              {/* Text Color Presets */}
              <span className="text-[10px] opacity-70 px-1">Color:</span>
              <button type="button" onClick={() => applyColorFormat('#f5f7d2')} className="w-4 h-4 rounded-full bg-[#f5f7d2] border border-white/30 hover:scale-110 transition" title="Yellow" />
              <button type="button" onClick={() => applyColorFormat('#ffffff')} className="w-4 h-4 rounded-full bg-white border border-white/30 hover:scale-110 transition" title="White" />
              <button type="button" onClick={() => applyColorFormat('#fca5a5')} className="w-4 h-4 rounded-full bg-red-300 border border-white/30 hover:scale-110 transition" title="Red" />
              <button type="button" onClick={() => applyColorFormat('#86efac')} className="w-4 h-4 rounded-full bg-green-300 border border-white/30 hover:scale-110 transition" title="Green" />
              <button type="button" onClick={() => applyColorFormat('#93c5fd')} className="w-4 h-4 rounded-full bg-blue-300 border border-white/30 hover:scale-110 transition" title="Blue" />
              <button type="button" onClick={() => applyColorFormat('#fdba74')} className="w-4 h-4 rounded-full bg-orange-300 border border-white/30 hover:scale-110 transition" title="Orange" />
            </div>
          )}

          {/* ── Content View: Text / Checklist / Table ── */}
          {type === 'text' ? (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note content here... (Supports Bold, Italic, Colors)"
              rows={8}
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
              <div className="overflow-x-auto no-scrollbar border border-white/15 rounded-2xl bg-black/25 p-2">
                <table className="w-full text-left border-collapse min-w-[300px]">
                  {/* Table Header */}
                  <thead>
                    <tr className="border-b border-white/20">
                      {tableData.headers.map((header, cIdx) => (
                        <th key={cIdx} className="p-1.5 group relative">
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
                      <tr key={rIdx} className="border-b border-white/10 group last:border-0">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-1.5">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) => updateTableCell(rIdx, cIdx, e.target.value)}
                              placeholder="..."
                              className="w-full bg-transparent text-xs text-white/90 focus:outline-none focus:bg-white/10 rounded px-1 py-0.5"
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
                  className="px-3 py-1.5 bg-black/30 hover:bg-black/40 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer flex items-center gap-1"
                >
                  <span>➕ Add Row</span>
                </button>
                <button
                  type="button"
                  onClick={addTableColumn}
                  className="px-3 py-1.5 bg-black/30 hover:bg-black/40 text-xs font-bold rounded-xl border border-white/10 transition cursor-pointer flex items-center gap-1"
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
                  className="bg-black/30 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
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
                className="w-full bg-black/20 text-xs text-white placeholder-white/40 px-3 py-2 rounded-xl focus:outline-none border border-white/10"
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
