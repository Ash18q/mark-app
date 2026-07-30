import { useState, useEffect, useRef } from 'react'

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
  const [checklistItems, setChecklistItems] = useState(
    Array.isArray(note?.checklist_items) ? note.checklist_items : []
  )
  const [tags, setTags] = useState(
    note?.tags ? note.tags.split(',').map(t => t.trim()).filter(Boolean) : []
  )
  const [tagInput, setTagInput] = useState('')
  const [isPinned, setIsPinned] = useState(note?.is_pinned || false)
  const [showOptions, setShowOptions] = useState(false)
  const [newItemText, setNewItemText] = useState('')

  const titleInputRef = useRef(null)

  useEffect(() => {
    if (titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [])

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
      checklist_items: checklistItems,
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
      <div className="w-full max-w-lg bg-[#4a4d22] text-[#f4f6d8] rounded-3xl shadow-2xl overflow-hidden border border-amber-900/30 flex flex-col max-h-[90vh]">
        
        {/* ── Top Header Navigation Bar ── */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#3e401b]">
          {/* Back Button */}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-xl hover:bg-white/10 text-amber-200 transition cursor-pointer"
            title="Back / Cancel"
          >
            ‹
          </button>

          {/* Type Switcher / Actions */}
          <div className="flex items-center gap-1.5 bg-black/20 p-1 rounded-xl">
            <button
              onClick={() => setType('text')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                type === 'text'
                  ? 'bg-amber-400 text-gray-900 shadow-2xs'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              📝 Note
            </button>
            <button
              onClick={() => setType('checklist')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                type === 'checklist'
                  ? 'bg-amber-400 text-gray-900 shadow-2xs'
                  : 'text-amber-200/70 hover:text-white'
              }`}
            >
              📋 Checklist
            </button>
          </div>

          {/* Right Header Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Pin Toggle Button */}
            <button
              onClick={() => setIsPinned(!isPinned)}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isPinned ? 'bg-amber-400 text-gray-900 font-bold' : 'hover:bg-white/10 text-amber-200'
              }`}
              title={isPinned ? 'Unpin Note' : 'Pin Note'}
            >
              📌
            </button>

            {/* Options Menu Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition cursor-pointer"
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
                      Discard Change
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
            className="w-full bg-transparent text-xl font-extrabold text-[#f9fae2] placeholder-[#b5b88c] focus:outline-none border-b border-white/10 pb-2"
          />

          {/* ── Content View: Text vs Checklist ── */}
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your note content here..."
              rows={8}
              className="w-full bg-transparent text-sm text-[#e8eaa8] placeholder-[#a6a97b] focus:outline-none resize-none leading-relaxed"
            />
          ) : (
            <div className="space-y-2.5">
              {/* Existing Checklist Items */}
              {checklistItems.map((item, index) => (
                <div key={item.id || index} className="flex items-center gap-2 group">
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold transition shrink-0 ${
                      item.completed
                        ? 'bg-amber-400 border-amber-400 text-gray-900'
                        : 'border-amber-200/50 hover:border-amber-400 text-transparent'
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
                      item.completed ? 'line-through text-amber-200/50' : 'text-[#f5f7d0]'
                    }`}
                  />
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="text-amber-200/50 hover:text-red-300 text-xs p-1 opacity-60 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {/* Add New Checklist Item Input */}
              <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                <span className="w-5 h-5 rounded border border-dashed border-amber-200/40 flex items-center justify-center text-xs text-amber-200/50">
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
                  className="w-full bg-transparent text-sm text-[#f5f7d0] placeholder-[#9fa277] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* ── Tags Input Section ── */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-amber-200/70 font-semibold">Tags:</span>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-black/30 text-[#f5f7d2] text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5"
                >
                  <span>#{tag}</span>
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="text-amber-300/60 hover:text-red-300 text-xs font-bold"
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
                className="w-full bg-black/20 text-xs text-[#f5f7d0] placeholder-[#8f9266] px-3 py-2 rounded-xl focus:outline-none border border-white/10"
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
