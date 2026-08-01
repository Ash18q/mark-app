import { useState } from 'react'

// Apply table style directly into TipTap document via ProseMirror transaction.
// Styles are stored in cell 'style' attributes → saved with HTML → persist on reopen.
function applyTableStyleToDoc(editor, headerBg, rowBg, footerBg) {
  if (!editor) return
  const { state } = editor
  const tr = state.tr
  const ops = []
  let tableRowCount = 0
  let currentRow = 0

  state.doc.descendants((node, pos) => {
    if (node.type.name === 'table') {
      let cnt = 0
      node.forEach(c => { if (c.type.name === 'tableRow') cnt++ })
      tableRowCount = cnt
      currentRow = 0
    }
    if (node.type.name === 'tableRow') currentRow++
    if (node.type.name === 'tableHeader') {
      ops.push({
        pos,
        attrs: {
          ...node.attrs,
          style: `background-color: ${headerBg}; color: #ffffff; font-weight: bold; border: 1px solid rgba(255,255,255,0.2);`
        }
      })
    }
    if (node.type.name === 'tableCell') {
      const isLast = footerBg && currentRow === tableRowCount
      const bg = isLast ? footerBg : (rowBg || '')
      const textColor = isLast ? '#ffffff' : (rowBg ? '#ffffff' : 'inherit')
      const fontWt = isLast ? 'bold' : 'normal'
      ops.push({
        pos,
        attrs: {
          ...node.attrs,
          style: bg
            ? `background-color: ${bg}; color: ${textColor}; font-weight: ${fontWt}; border: 1px solid rgba(255,255,255,0.15);`
            : 'border: 1px solid rgba(255,255,255,0.15);'
        }
      })
    }
  })

  ops.forEach(({ pos, attrs }) => tr.setNodeMarkup(pos, null, attrs))
  if (ops.length) editor.view.dispatch(tr)
}

// ── Excel-Style 10×6 Theme Color Grid ──
const THEME_COLOR_GRID = [
  ['#000000','#ffffff','#1e293b','#1e3a8a','#0284c7','#15803d','#eab308','#c2410c','#b91c1c','#6b21a8'],
  ['#4b5563','#f8fafc','#f1f5f9','#dbeafe','#e0f2fe','#dcfce7','#fef9c3','#ffedd5','#fee2e2','#f3e8ff'],
  ['#374151','#f1f5f9','#cbd5e1','#bfdbfe','#bae6fd','#bbf7d0','#fef08a','#fed7aa','#fecaca','#e9d5ff'],
  ['#1f2937','#e2e8f0','#94a3b8','#93c5fd','#7dd3fc','#86efac','#fde047','#fdba74','#fca5a5','#d8b4fe'],
  ['#111827','#cbd5e1','#475569','#1d4ed8','#0369a1','#166534','#ca8a04','#ea580c','#dc2626','#7e22ce'],
  ['#030712','#94a3b8','#0f172a','#1e40af','#075985','#14532d','#854d0e','#9a3412','#991b1b','#581c87'],
]
const STANDARD_COLORS = [
  '#c00000','#ff0000','#ffc000','#ffff00','#92d050',
  '#00b0f0','#0070c0','#002060','#7030a0','#4a0404',
]

// Swatch palette for custom table color picking
const SWATCH_COLORS = [
  '#1e3a8a','#15803d','#b45309','#b91c1c','#6b21a8','#0f766e','#be185d','#374151',
  '#3b82f6','#22c55e','#f59e0b','#ef4444','#a855f7','#14b8a6','#f43f5e','#6b7280',
  '#dbeafe','#dcfce7','#fef9c3','#fee2e2','#f3e8ff','#ccfbf1','#ffe4e6','#f1f5f9',
  '#000000','#1e293b','#18181b','#ffffff','#fef3c7','#e0f2fe','#f0fdf4','#fdf4ff',
]

// Floating Excel-Style Color Picker — centered under button, never overflows screen
function FloatingColorPicker({ label, onSelect, onClose, showNoFill = true }) {
  const [customHex, setCustomHex] = useState('')

  return (
    <>
      {/* Transparent backdrop – closes picker but preserves editor selection */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={(e) => e.preventDefault()}
        onClick={onClose}
      />
      {/* Picker panel – centered absolute popover */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden w-[270px] max-w-[calc(100vw-24px)]"
        onMouseDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800 bg-slate-900/60">
          <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">{label}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-sm font-bold leading-none w-5 h-5 flex items-center justify-center rounded-lg hover:bg-slate-800 transition">✕</button>
        </div>

        <div className="p-3 space-y-2.5">
          {/* Theme Colors – 10×6 grid */}
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Theme Colors</p>
            <div className="space-y-[3px]">
              {THEME_COLOR_GRID.map((row, rIdx) => (
                <div key={rIdx} className="flex gap-[3px]">
                  {row.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => onSelect(hex)}
                      className="w-[23px] h-[23px] rounded-[4px] border border-white/10 hover:scale-125 hover:z-10 transition-transform cursor-pointer flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: hex }}
                      title={hex}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Standard Colors */}
          <div>
            <p className="text-[10px] text-slate-500 font-semibold mb-1.5 uppercase tracking-wider">Standard Colors</p>
            <div className="flex gap-[3px]">
              {STANDARD_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => onSelect(hex)}
                  className="w-[23px] h-[23px] rounded-[4px] border border-white/10 hover:scale-125 transition-transform cursor-pointer flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          </div>

          {/* No Fill */}
          {showNoFill && (
            <button
              type="button"
              onClick={() => onSelect(null)}
              className="w-full flex items-center gap-2 py-1.5 px-2.5 text-[11px] font-semibold text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl border border-slate-700 transition cursor-pointer"
            >
              <span>🚫</span> No Fill / Reset
            </button>
          )}

          {/* Custom Hex Input */}
          <div className="flex gap-1.5 pt-2 border-t border-slate-800">
            <input
              type="text"
              value={customHex}
              onChange={(e) => setCustomHex(e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="#1e293b"
              className="flex-1 bg-slate-800 text-white text-[11px] px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none focus:border-amber-400 placeholder-slate-600 font-mono min-w-0"
            />
            <button
              type="button"
              onClick={() => customHex.trim() && onSelect(customHex.trim())}
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-[11px] rounded-xl shrink-0 cursor-pointer transition"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Table Preset Definitions ──
const TABLE_PRESETS = [
  { label: 'Classic Blue',   cls: 'table-classic-blue',   headerBg: '#1e3a8a', altBg: 'rgba(30,58,138,0.13)',   border: '#3b82f6' },
  { label: 'Emerald Green',  cls: 'table-emerald-green',  headerBg: '#15803d', altBg: 'rgba(21,128,61,0.13)',   border: '#22c55e' },
  { label: 'Warm Amber',     cls: 'table-warm-amber',     headerBg: '#b45309', altBg: 'rgba(180,83,9,0.13)',    border: '#f59e0b' },
  { label: 'Crimson Red',    cls: 'table-crimson-red',    headerBg: '#b91c1c', altBg: 'rgba(185,28,28,0.13)',   border: '#ef4444' },
  { label: 'Royal Purple',   cls: 'table-royal-purple',   headerBg: '#6b21a8', altBg: 'rgba(107,33,168,0.13)', border: '#a855f7' },
  { label: 'Ocean Teal',     cls: 'table-ocean-teal',     headerBg: '#0f766e', altBg: 'rgba(15,118,110,0.13)', border: '#14b8a6' },
  { label: 'Rose Pink',      cls: 'table-rose-pink',      headerBg: '#be185d', altBg: 'rgba(190,24,93,0.13)',  border: '#f43f5e' },
  { label: 'Dark Charcoal',  cls: 'table-dark-charcoal',  headerBg: '#27272a', altBg: 'rgba(255,255,255,0.04)',border: '#71717a' },
]

// ── Mini Swatch Row for custom table colors ──
function SwatchRow({ colors, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-1">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          className={`w-6 h-6 rounded-lg border-2 cursor-pointer hover:scale-110 transition-transform ${selected === c ? 'border-amber-400 scale-110' : 'border-white/15'}`}
          style={{ backgroundColor: c }}
          title={c}
        />
      ))}
    </div>
  )
}

export default function Toolbar({ editor }) {
  const [showTextColorPicker,  setShowTextColorPicker]  = useState(false)
  const [showHighlightPicker,  setShowHighlightPicker]  = useState(false)
  const [showTableFormatModal, setShowTableFormatModal] = useState(false)
  const [showCustomTable,      setShowCustomTable]      = useState(false)
  const [customTable, setCustomTable] = useState({
    headerBg: '#1e3a8a',
    rowBg:    '#1e293b',
    footerBg: '#172554',
  })

  if (!editor) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs shadow-xl">

      {/* Font Family */}
      <select
        onChange={(e) => {
          const v = e.target.value
          v ? editor.chain().focus().setFontFamily(v).run()
            : editor.chain().focus().unsetFontFamily().run()
        }}
        className="bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none cursor-pointer"
      >
        <option value="">Font Family</option>
        <option value="Arial">Arial</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Georgia">Georgia</option>
        <option value="Courier New">Courier New</option>
        <option value="Verdana">Verdana</option>
        <option value="Inter">Inter</option>
      </select>

      {/* Bold Italic Underline Strike */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        {[
          { l:'B', a:()=>editor.chain().focus().toggleBold().run(),      act:editor.isActive('bold'),      c:'font-extrabold' },
          { l:'I', a:()=>editor.chain().focus().toggleItalic().run(),    act:editor.isActive('italic'),    c:'italic font-serif' },
          { l:'U', a:()=>editor.chain().focus().toggleUnderline().run(), act:editor.isActive('underline'), c:'underline' },
          { l:'S', a:()=>editor.chain().focus().toggleStrike().run(),    act:editor.isActive('strike'),    c:'line-through' },
        ].map(({ l, a, act, c }) => (
          <button key={l} type="button" onClick={a}
            className={`px-2.5 py-1.5 rounded-lg transition cursor-pointer ${c} ${act ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* ── Text Color (A▼) — Excel Picker, preserves selection ── */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowTextColorPicker(v => !v)
            setShowHighlightPicker(false)
          }}
          className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          title="Text Color"
        >
          <span className="font-extrabold text-amber-300 text-sm">A</span>
          <span className="text-[9px]">▼</span>
        </button>
        {showTextColorPicker && (
          <FloatingColorPicker
            label="Text Color"
            showNoFill
            onSelect={(hex) => {
              hex ? editor.chain().focus().setColor(hex).run()
                  : editor.chain().focus().unsetColor().run()
              setShowTextColorPicker(false)
            }}
            onClose={() => setShowTextColorPicker(false)}
          />
        )}
      </div>

      {/* ── Highlight (✏️▼) — Excel Picker, preserves selection ── */}
      <div className="relative">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            setShowHighlightPicker(v => !v)
            setShowTextColorPicker(false)
          }}
          className="px-2.5 py-1.5 font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1 cursor-pointer"
          title="Highlight Fill"
        >
          <span className="text-sm">✏️</span>
          <span className="text-[9px]">▼</span>
        </button>
        {showHighlightPicker && (
          <FloatingColorPicker
            label="Highlight Fill"
            showNoFill
            onSelect={(hex) => {
              hex ? editor.chain().focus().setHighlight({ color: hex }).run()
                  : editor.chain().focus().unsetHighlight().run()
              setShowHighlightPicker(false)
            }}
            onClose={() => setShowHighlightPicker(false)}
          />
        )}
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* H1 H2 */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        {[1,2].map(lv => (
          <button key={lv} type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: lv }).run()}
            className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${editor.isActive('heading', { level: lv }) ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-slate-200'}`}>
            H{lv}
          </button>
        ))}
      </div>

      {/* Lists */}
      <div className="flex items-center gap-0.5 bg-slate-800 rounded-xl p-0.5 border border-slate-700">
        <button type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${editor.isActive('bulletList') ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-slate-200'}`}>
          • List
        </button>
        <button type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`px-2 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${editor.isActive('orderedList') ? 'bg-amber-400 text-slate-950' : 'hover:bg-slate-700 text-slate-200'}`}>
          1. List
        </button>
      </div>

      <div className="h-4 w-px bg-slate-700" />

      {/* Table Actions */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => {
            if (!editor.isActive('table')) {
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
          }}
          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
          title="Insert Table"
        >
          <span>📊</span> Table
        </button>
        <button
          type="button"
          onClick={() => setShowTableFormatModal(true)}
          className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center gap-1 shadow-sm"
          title="Format Table Style"
        >
          Format ▼
        </button>
        {editor.isActive('table') && (
          <>
            <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-slate-700" title="Add Row">+Row</button>
            <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className="px-1.5 py-1 text-[11px] font-bold rounded hover:bg-slate-700" title="Add Col">+Col</button>
            <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className="px-1.5 py-1 text-[11px] font-bold rounded text-red-300 hover:bg-red-900/40">-Row</button>
            <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className="px-1.5 py-1 text-[11px] font-bold rounded text-red-300 hover:bg-red-900/40">-Col</button>
            <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className="px-1.5 py-1 text-[11px] font-bold rounded text-red-200 hover:bg-red-800">🗑️</button>
          </>
        )}
      </div>

      {/* Clear */}
      <button type="button"
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="px-2 py-1 text-[11px] opacity-60 hover:opacity-100 rounded-lg hover:bg-slate-800 transition cursor-pointer ml-auto"
        title="Clear Formatting">
        🧹 Clear
      </button>

      {/* ══════════ Format Table Modal ══════════ */}
      {showTableFormatModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTableFormatModal(false)}>
          <div className="w-full max-w-md bg-[#0d1117] text-white rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center text-base">📊</div>
                <div>
                  <div className="font-extrabold text-white text-sm">Format as Table</div>
                  <div className="text-[10px] text-slate-500">Choose a preset or create custom style</div>
                </div>
              </div>
              <button onClick={() => setShowTableFormatModal(false)} className="text-slate-500 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition">×</button>
            </div>

            {/* Preset Grid */}
            <div className="p-4 grid grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto">
              {TABLE_PRESETS.map(({ label, headerBg, altBg, border }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (!editor.isActive('table')) {
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
                    }
                    setTimeout(() => {
                      applyTableStyleToDoc(editor, headerBg, altBg, null)
                    }, 10)
                    setShowTableFormatModal(false)
                  }}
                  className="p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-2xl border border-slate-700/60 text-left transition hover:scale-[1.03] group overflow-hidden"
                >
                  {/* Live preview of table */}
                  <div className="rounded-xl overflow-hidden mb-2.5 border" style={{ borderColor: border + '55' }}>
                    <div className="h-5 flex items-center px-2 text-[9px] font-extrabold text-white tracking-wide" style={{ backgroundColor: headerBg }}>
                      HEADER
                    </div>
                    <div className="h-4 flex items-center px-2 text-[8px] text-slate-300" style={{ backgroundColor: altBg }}>
                      Row 1
                    </div>
                    <div className="h-4 flex items-center px-2 text-[8px] text-slate-400 bg-transparent">
                      Row 2
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: headerBg }} />
                    <span className="text-[11px] font-bold text-slate-200 group-hover:text-white transition">{label}</span>
                  </div>
                </button>
              ))}

              {/* Custom Colors Card */}
              <button
                type="button"
                onClick={() => { setShowTableFormatModal(false); setShowCustomTable(true) }}
                className="p-3 bg-slate-800/70 hover:bg-slate-700/70 rounded-2xl border border-dashed border-slate-600 text-left transition hover:scale-[1.03] overflow-hidden"
              >
                <div className="rounded-xl overflow-hidden mb-2.5 border border-dashed border-slate-600">
                  <div className="h-5 flex items-center justify-center gap-1 text-[9px] font-bold text-slate-400">
                    🎨 Pick Your Colors
                  </div>
                  <div className="h-4 bg-gradient-to-r from-blue-900/30 via-purple-900/30 to-pink-900/30" />
                  <div className="h-4 bg-gradient-to-r from-teal-900/20 via-amber-900/20 to-red-900/20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">✨</span>
                  <span className="text-[11px] font-bold text-slate-300">Custom Colors</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Custom Table Form ══════════ */}
      {showCustomTable && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowCustomTable(false)}>
          <div className="w-full max-w-sm bg-[#0d1117] text-white rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎨</span>
                <span className="font-extrabold text-sm">Custom Table Style</span>
              </div>
              <button onClick={() => setShowCustomTable(false)} className="text-slate-500 hover:text-white text-xl font-bold w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-800 transition">×</button>
            </div>

            <div className="p-4 space-y-4">
              {/* Header Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: customTable.headerBg }} />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Header Color</span>
                </div>
                <SwatchRow colors={SWATCH_COLORS.slice(0,16)} selected={customTable.headerBg} onSelect={(c) => setCustomTable(t => ({ ...t, headerBg: c }))} />
              </div>

              <div className="border-t border-slate-800" />

              {/* Row/Body Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: customTable.rowBg }} />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Row Background</span>
                </div>
                <SwatchRow colors={SWATCH_COLORS.slice(16,32)} selected={customTable.rowBg} onSelect={(c) => setCustomTable(t => ({ ...t, rowBg: c }))} />
              </div>

              <div className="border-t border-slate-800" />

              {/* Footer Color */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: customTable.footerBg }} />
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Footer Row <span className="text-slate-500 normal-case">(optional)</span></span>
                </div>
                <SwatchRow colors={SWATCH_COLORS.slice(0,16)} selected={customTable.footerBg} onSelect={(c) => setCustomTable(t => ({ ...t, footerBg: c }))} />
              </div>

              {/* Live Preview */}
              <div className="rounded-2xl overflow-hidden border border-white/10 shadow-inner">
                <div className="h-8 flex items-center px-3 text-[11px] font-extrabold text-white tracking-wide" style={{ backgroundColor: customTable.headerBg }}>HEADER ROW</div>
                <div className="h-6 flex items-center px-3 text-[11px] text-slate-200" style={{ backgroundColor: customTable.rowBg }}>Data Row 1</div>
                <div className="h-6 flex items-center px-3 text-[11px] text-slate-300" style={{ backgroundColor: customTable.rowBg + 'aa' }}>Data Row 2</div>
                <div className="h-7 flex items-center px-3 text-[11px] font-bold text-white" style={{ backgroundColor: customTable.footerBg }}>Footer Row</div>
              </div>

              {/* Apply */}
              <button
                type="button"
                onClick={() => {
                  if (!editor.isActive('table')) {
                    editor.chain().focus().insertTable({ rows: 4, cols: 3, withHeaderRow: true }).run()
                  }
                  setTimeout(() => {
                    applyTableStyleToDoc(editor, customTable.headerBg, customTable.rowBg, customTable.footerBg)
                  }, 10)
                  setShowCustomTable(false)
                  setShowTableFormatModal(false)
                }}
                className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm rounded-2xl transition cursor-pointer shadow-lg"
              >
                ✓ Apply Custom Style
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
