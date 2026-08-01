import { useState } from 'react'
import ColorPicker from './ColorPicker'

export default function Toolbar({ editor }) {
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlightColor, setShowHighlightColor] = useState(false)

  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl">
      
      {/* ── Font Family Dropdown ── */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            editor.chain().focus().setFontFamily(e.target.value).run()
          } else {
            editor.chain().focus().unsetFontFamily().run()
          }
        }}
        className="bg-slate-800 text-white text-xs px-2 py-1 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
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
          className={`px-2.5 py-1 font-extrabold rounded-lg transition cursor-pointer ${
            editor.isActive('bold') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-2.5 py-1 italic rounded-lg transition cursor-pointer font-serif ${
            editor.isActive('italic') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`px-2.5 py-1 underline rounded-lg transition cursor-pointer ${
            editor.isActive('underline') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Underline (Ctrl+U)"
        >
          U
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`px-2 py-1 line-through rounded-lg transition cursor-pointer ${
            editor.isActive('strike') ? 'bg-amber-400 text-slate-950 shadow-2xs' : 'hover:bg-slate-700 text-white'
          }`}
          title="Strikethrough"
        >
          S
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700 mx-0.5" />

      {/* ── Text Color Picker Dropdown ── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setShowTextColor(!showTextColor); setShowHighlightColor(false); }}
          className="px-2.5 py-1 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          title="Text Font Color"
        >
          <span className="font-extrabold text-amber-300">A</span>
          <span className="text-[9px]">▼</span>
        </button>

        {showTextColor && (
          <div className="absolute left-0 top-8 z-50">
            <ColorPicker
              title="Text Color"
              onChange={(hex) => {
                if (hex) {
                  editor.chain().focus().setColor(hex).run()
                } else {
                  editor.chain().focus().unsetColor().run()
                }
                setShowTextColor(false)
              }}
              onClose={() => setShowTextColor(false)}
            />
          </div>
        )}
      </div>

      {/* ── Highlight / Cell Fill Color Dropdown ── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => { setShowHighlightColor(!showHighlightColor); setShowTextColor(false); }}
          className="px-2.5 py-1 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          title="Highlight Fill Color"
        >
          <span>🖍️</span>
          <span className="text-[9px]">▼</span>
        </button>

        {showHighlightColor && (
          <div className="absolute left-0 top-8 z-50">
            <ColorPicker
              title="Highlight Fill Color"
              onChange={(hex) => {
                if (hex) {
                  editor.chain().focus().toggleHighlight({ color: hex }).run()
                } else {
                  editor.chain().focus().unsetHighlight().run()
                }
                setShowHighlightColor(false)
              }}
              onClose={() => setShowHighlightColor(false)}
            />
          </div>
        )}
      </div>

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
          className="px-2 py-1 font-bold rounded-lg hover:bg-emerald-600 transition cursor-pointer bg-emerald-700 text-white"
          title="Insert Table"
        >
          📊 Table
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
    </div>
  )
}
