import { useState } from 'react'
import ColorPicker from './ColorPicker'

export default function Toolbar({ editor, onTableFormat }) {
  const [showTextColorModal, setShowTextColorModal] = useState(false)
  const [showHighlightModal, setShowHighlightModal] = useState(false)
  const [showTableFormatModal, setShowTableFormatModal] = useState(false)

  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl relative">
      
      {/* ── Font Family Dropdown ── */}
      <select
        onChange={(e) => {
          const val = e.target.value
          if (val) {
            editor.chain().focus().setFontFamily(val).run()
          } else {
            editor.chain().focus().unsetFontFamily().run()
          }
        }}
        className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer font-medium"
      >
        <option value="">Font Family</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Inter">Inter</option>
      </select>

      {/* ── Font Formatting Group ── */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-2.5 py-1.5 font-extrabold rounded-lg transition cursor-pointer ${
            editor.isActive('bold') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Bold (B)"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1.5 italic rounded-lg transition cursor-pointer font-serif ${
            editor.isActive('italic') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Italic (I)"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2.5 py-1.5 underline rounded-lg transition cursor-pointer ${
            editor.isActive('underline') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Underline (U)"
        >
          U
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1.5 line-through rounded-lg transition cursor-pointer ${
            editor.isActive('strike') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Strikethrough"
        >
          S
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* ── Text Font Color Button (A ▼) ── */}
      <button
        type="button"
        onClick={() => { setShowTextColorModal(true); setShowHighlightModal(false); }}
        className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
        title="Text Font Color"
      >
        <span className="font-extrabold text-amber-300 text-sm">A</span>
        <span className="text-[9px]">▼</span>
      </button>

      {/* ── Highlight Fill Color Button (✏️ Pencil / Fill ▼) ── */}
      <button
        type="button"
        onClick={() => { setShowHighlightModal(true); setShowTextColorModal(false); }}
        className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
        title="Text Background Highlight Color"
      >
        <span className="text-sm">✏️</span>
        <span className="text-[9px]">▼</span>
      </button>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* ── Heading / Paragraph Styles ── */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 py-1 font-bold text-xs rounded-lg transition cursor-pointer ${
            editor.isActive('heading', { level: 1 }) ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-slate-700 text-white'
          }`}
          title="Heading 1"
        >
          H1
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 py-1 font-bold text-xs rounded-lg transition cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-amber-400 text-slate-950 font-black' : 'hover:bg-slate-700 text-white'
          }`}
          title="Heading 2"
        >
          H2
        </button>
      </div>

      {/* ── List Group ── */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 font-bold rounded-lg transition cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-white'
          }`}
          title="Bullet List"
        >
          • List
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 font-bold rounded-lg transition cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-white'
          }`}
          title="Numbered List"
        >
          1. List
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* ── Table Commands Group ── */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        <button
          type="button"
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          className="px-2 py-1 font-bold rounded-lg hover:bg-emerald-600 transition cursor-pointer bg-emerald-700 text-white flex items-center gap-1"
          title="Insert Table"
        >
          <span>📊 Table</span>
        </button>

        {/* Format As Table Button (Excel Style) */}
        <button
          type="button"
          onClick={() => setShowTableFormatModal(!showTableFormatModal)}
          className="px-2 py-1 font-bold rounded-lg hover:bg-indigo-600 transition cursor-pointer bg-indigo-700 text-white flex items-center gap-1 text-[11px]"
          title="Format as Table Styles"
        >
          <span>Format Table ▼</span>
        </button>

        {editor.isActive('table') && (
          <>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-slate-700"
              title="Add Row"
            >
              +Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-slate-700"
              title="Add Column"
            >
              +Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-red-900/50 text-red-300"
              title="Delete Row"
            >
              -Row
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-red-900/50 text-red-300"
              title="Delete Column"
            >
              -Col
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-red-800 text-red-200"
              title="Delete Table"
            >
              🗑️
            </button>
          </>
        )}
      </div>

      {/* ── Clear Formatting ── */}
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="px-2 py-1 text-[11px] opacity-75 hover:opacity-100 rounded-lg hover:bg-slate-800 transition cursor-pointer ml-auto"
        title="Clear Formatting"
      >
        🧹 Clear
      </button>

      {/* ── Text Color Modal Popup (Positioned Centrally so never cut off) ── */}
      {showTextColorModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <ColorPicker
            title="Text Font Color"
            onChange={(hex) => {
              if (hex) {
                editor.chain().focus().setColor(hex).run()
              } else {
                editor.chain().focus().unsetColor().run()
              }
              setShowTextColorModal(false)
            }}
            onClose={() => setShowTextColorModal(false)}
          />
        </div>
      )}

      {/* ── Text Highlight Background Modal Popup ── */}
      {showHighlightModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <ColorPicker
            title="Text Highlight Background Fill"
            onChange={(hex) => {
              if (hex) {
                editor.chain().focus().unsetHighlight().setHighlight({ color: hex }).run()
              } else {
                editor.chain().focus().unsetHighlight().run()
              }
              setShowHighlightModal(false)
            }}
            onClose={() => setShowHighlightModal(false)}
          />
        </div>
      )}

      {/* ── Format as Table Excel Styles Modal ── */}
      {showTableFormatModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 text-white rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📊</span>
                <h3 className="font-extrabold text-sm text-slate-100">Format as Table Styles</h3>
              </div>
              <button
                onClick={() => setShowTableFormatModal(false)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Classic Blue */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-classic-blue')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-blue-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-blue-700 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-blue-900/30 rounded" />
                <div className="h-2 bg-blue-900/10 rounded" />
                <span className="text-[10px] font-bold text-blue-300 block pt-1">Classic Blue</span>
              </button>

              {/* Emerald Green */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-emerald-green')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-emerald-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-emerald-700 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-emerald-900/30 rounded" />
                <div className="h-2 bg-emerald-900/10 rounded" />
                <span className="text-[10px] font-bold text-emerald-300 block pt-1">Emerald Green</span>
              </button>

              {/* Warm Amber */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-warm-amber')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-amber-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-amber-700 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-amber-900/30 rounded" />
                <div className="h-2 bg-amber-900/10 rounded" />
                <span className="text-[10px] font-bold text-amber-300 block pt-1">Warm Amber</span>
              </button>

              {/* Crimson Header */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-crimson-red')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-red-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-red-700 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-red-900/30 rounded" />
                <div className="h-2 bg-red-900/10 rounded" />
                <span className="text-[10px] font-bold text-red-300 block pt-1">Crimson Red</span>
              </button>

              {/* Royal Purple */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-royal-purple')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-purple-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-purple-700 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-purple-900/30 rounded" />
                <div className="h-2 bg-purple-900/10 rounded" />
                <span className="text-[10px] font-bold text-purple-300 block pt-1">Royal Purple</span>
              </button>

              {/* Dark Charcoal */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                  }
                  onTableFormat && onTableFormat('table-dark-charcoal')
                  setShowTableFormatModal(false)
                }}
                className="p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-zinc-500/50 text-left space-y-1 transition transform hover:scale-105"
              >
                <div className="h-3 bg-zinc-800 rounded font-bold text-[9px] text-white px-1 flex items-center">Header</div>
                <div className="h-2 bg-white/10 rounded" />
                <div className="h-2 bg-white/5 rounded" />
                <span className="text-[10px] font-bold text-zinc-300 block pt-1">Dark Charcoal</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
