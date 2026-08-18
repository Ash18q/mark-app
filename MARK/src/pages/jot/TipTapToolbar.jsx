import React, { useState } from 'react'

export default function TipTapToolbar({ editor }) {
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [showTableMenu, setShowTableMenu] = useState(false)

  if (!editor) return null

  const PRESET_COLORS = [
    '#000000', '#4F46E5', '#7C3AED', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#06B6D4', '#64748B'
  ]

  const PRESET_HIGHLIGHTS = [
    '#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8', '#FED7AA', '#E9D5FF'
  ]

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-slate-50/90 backdrop-blur-xs border-b border-slate-200/90 rounded-t-2xl sticky top-0 z-20 text-xs select-none">
      
      {/* 1. Text Formatting (Bold, Italic, Underline, Strike) */}
      <div className="flex items-center gap-0.5 border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black transition cursor-pointer ${
            editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Bold (Ctrl+B)"
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-serif italic transition cursor-pointer ${
            editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Italic (Ctrl+I)"
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center underline transition cursor-pointer ${
            editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Underline (Ctrl+U)"
        >
          U
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center line-through transition cursor-pointer ${
            editor.isActive('strike') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Strikethrough"
        >
          S
        </button>
      </div>

      {/* 2. Headings (H1, H2, H3) */}
      <div className="flex items-center gap-0.5 border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`px-2 h-7 rounded-lg font-black text-xs transition cursor-pointer ${
            editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 text-indigo-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-2 h-7 rounded-lg font-extrabold text-xs transition cursor-pointer ${
            editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-2 h-7 rounded-lg font-bold text-xs transition cursor-pointer ${
            editor.isActive('heading', { level: 3 }) ? 'bg-indigo-100 text-indigo-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Heading 3"
        >
          H3
        </button>
      </div>

      {/* 3. Lists (Bullet, Numbered, Task List) */}
      <div className="flex items-center gap-0.5 border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
            editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-[11px] transition cursor-pointer ${
            editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition cursor-pointer ${
            editor.isActive('taskList') ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Checklist / Task List"
        >
          ☑
        </button>
      </div>

      {/* 4. Alignment */}
      <div className="flex items-center gap-0.5 border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
            editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Align Left"
        >
          ←
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
            editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Align Center"
        >
          ↔
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center transition cursor-pointer ${
            editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700 font-extrabold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Align Right"
        >
          →
        </button>
      </div>

      {/* 5. Text Color & Highlight Dropdown */}
      <div className="relative border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="px-2 h-7 rounded-lg flex items-center gap-1 font-bold text-slate-700 hover:bg-slate-200/70 transition cursor-pointer"
          title="Text Color & Highlight"
        >
          <span className="text-sm">🎨</span>
          <span className="text-[10px]">Color</span>
        </button>

        {showColorPicker && (
          <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-2xl p-3 shadow-xl z-30 w-56 space-y-2 animate-fadeIn">
            {/* Text Color Swatches */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Text Color</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                    className="w-5 h-5 rounded-full border border-slate-300 transition transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: c }}
                  />
                ))}
                <input
                  type="color"
                  onChange={(e) => { editor.chain().focus().setColor(e.target.value).run(); }}
                  className="w-5 h-5 rounded-full border-0 p-0 cursor-pointer"
                  title="Custom Text Color"
                />
              </div>
            </div>

            {/* Highlight Swatches */}
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Highlight</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_HIGHLIGHTS.map(h => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => { editor.chain().focus().setHighlight({ color: h }).run(); setShowColorPicker(false); }}
                    className="w-5 h-5 rounded-full border border-slate-300 transition transform hover:scale-110 cursor-pointer"
                    style={{ backgroundColor: h }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowColorPicker(false); }}
                  className="text-[10px] text-slate-500 hover:text-red-500 font-bold ml-1"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 6. Tables Dropdown */}
      <div className="relative border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => setShowTableMenu(!showTableMenu)}
          className={`px-2 h-7 rounded-lg flex items-center gap-1 font-bold transition cursor-pointer ${
            editor.isActive('table') ? 'bg-indigo-100 text-indigo-700 shadow-2xs' : 'text-slate-700 hover:bg-slate-200/70'
          }`}
          title="Table Controls"
        >
          <span className="text-sm">📊</span>
          <span className="text-[10px]">Table</span>
        </button>

        {showTableMenu && (
          <div className="absolute left-0 top-9 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl z-30 w-48 space-y-1 text-slate-700 text-xs animate-fadeIn">
            <button
              type="button"
              onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-bold transition flex items-center gap-1.5"
            >
              ➕ Insert 3x3 Table
            </button>
            <button
              type="button"
              onClick={() => { editor.chain().focus().addRowAfter().run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              ⬇ Add Row Below
            </button>
            <button
              type="button"
              onClick={() => { editor.chain().focus().addColumnAfter().run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded-xl font-medium transition"
            >
              ➔ Add Column Right
            </button>
            <button
              type="button"
              onClick={() => { editor.chain().focus().deleteRow().run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-xl font-medium transition"
            >
              🗑 Delete Row
            </button>
            <button
              type="button"
              onClick={() => { editor.chain().focus().deleteColumn().run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-red-50 text-red-600 rounded-xl font-medium transition"
            >
              🗑 Delete Column
            </button>
            <button
              type="button"
              onClick={() => { editor.chain().focus().deleteTable().run(); setShowTableMenu(false); }}
              className="w-full text-left px-2.5 py-1.5 hover:bg-red-100 text-red-700 rounded-xl font-bold transition border-t border-slate-100"
            >
              ❌ Delete Table
            </button>
          </div>
        )}
      </div>

      {/* 7. Blocks (Quote, Code, Divider) */}
      <div className="flex items-center gap-0.5 border-r pr-1.5 border-slate-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs transition cursor-pointer ${
            editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700 shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Blockquote"
        >
          ”
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs transition cursor-pointer ${
            editor.isActive('codeBlock') ? 'bg-indigo-100 text-indigo-700 font-bold shadow-2xs' : 'text-slate-600 hover:bg-slate-200/70'
          }`}
          title="Code Block"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/70 transition cursor-pointer font-bold"
          title="Horizontal Rule"
        >
          ―
        </button>
      </div>

      {/* 8. History (Undo, Redo) */}
      <div className="flex items-center gap-0.5 ml-auto">
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer font-bold"
          title="Undo"
        >
          ↩
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-200/70 disabled:opacity-30 disabled:hover:bg-transparent transition cursor-pointer font-bold"
          title="Redo"
        >
          ↪
        </button>
      </div>
    </div>
  )
}
