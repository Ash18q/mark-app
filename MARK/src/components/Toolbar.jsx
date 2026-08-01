import { useState, useRef } from 'react'

export default function Toolbar({ editor, onTableFormat }) {
  const [showTableFormatModal, setShowTableFormatModal] = useState(false)
  const textColorRef = useRef(null)
  const highlightColorRef = useRef(null)

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

      {/* ── Text Font Color (A ▼) — Native OS color picker, never loses selection ── */}
      <label
        className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
        title="Text Font Color"
      >
        <span className="font-extrabold text-amber-300 text-sm">A</span>
        <span className="text-[9px]">▼</span>
        <input
          ref={textColorRef}
          type="color"
          defaultValue="#ffffff"
          className="sr-only"
          onChange={(e) => {
            editor.chain().focus().setColor(e.target.value).run()
          }}
        />
      </label>

      {/* ── Text Highlight Background (✏️ ▼) — Native OS color picker, never loses selection ── */}
      <label
        className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
        title="Text Highlight Background Fill"
      >
        <span className="text-sm">✏️</span>
        <span className="text-[9px]">▼</span>
        <input
          ref={highlightColorRef}
          type="color"
          defaultValue="#ffff00"
          className="sr-only"
          onChange={(e) => {
            editor.chain().focus().setHighlight({ color: e.target.value }).run()
          }}
        />
      </label>

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
              {[
                { label: 'Classic Blue',   cls: 'table-classic-blue',   hdr: 'bg-blue-700',    border: 'border-blue-500/50',   text: 'text-blue-300',    r1: 'bg-blue-900/30',    r2: 'bg-blue-900/10' },
                { label: 'Emerald Green',  cls: 'table-emerald-green',  hdr: 'bg-emerald-700', border: 'border-emerald-500/50',text: 'text-emerald-300', r1: 'bg-emerald-900/30', r2: 'bg-emerald-900/10' },
                { label: 'Warm Amber',     cls: 'table-warm-amber',     hdr: 'bg-amber-700',   border: 'border-amber-500/50',  text: 'text-amber-300',   r1: 'bg-amber-900/30',   r2: 'bg-amber-900/10' },
                { label: 'Crimson Red',    cls: 'table-crimson-red',    hdr: 'bg-red-700',     border: 'border-red-500/50',    text: 'text-red-300',     r1: 'bg-red-900/30',     r2: 'bg-red-900/10' },
                { label: 'Royal Purple',   cls: 'table-royal-purple',   hdr: 'bg-purple-700',  border: 'border-purple-500/50', text: 'text-purple-300',  r1: 'bg-purple-900/30',  r2: 'bg-purple-900/10' },
                { label: 'Dark Charcoal',  cls: 'table-dark-charcoal',  hdr: 'bg-zinc-800',    border: 'border-zinc-500/50',   text: 'text-zinc-300',    r1: 'bg-white/10',       r2: 'bg-white/5' },
              ].map(({ label, cls, hdr, border, text, r1, r2 }) => (
                <button
                  key={cls}
                  type="button"
                  onClick={() => {
                    if (!editor.isActive('table')) {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                    onTableFormat && onTableFormat(cls)
                    setShowTableFormatModal(false)
                  }}
                  className={`p-3 bg-slate-800 hover:bg-slate-700 rounded-2xl border ${border} text-left space-y-1 transition transform hover:scale-105`}
                >
                  <div className={`h-3 ${hdr} rounded font-bold text-[9px] text-white px-1 flex items-center`}>Header</div>
                  <div className={`h-2 ${r1} rounded`} />
                  <div className={`h-2 ${r2} rounded`} />
                  <span className={`text-[10px] font-bold ${text} block pt-1`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
