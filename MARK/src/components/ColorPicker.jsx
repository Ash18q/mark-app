import { useState } from 'react'

// 10 Base Theme Colors matching MS Excel
const THEME_BASE_COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#1e293b', // Dark Slate
  '#1e3a8a', // Dark Blue
  '#0284c7', // Sky Blue
  '#15803d', // Green
  '#eab308', // Yellow / Gold
  '#c2410c', // Orange
  '#b91c1c', // Dark Red
  '#6b21a8'  // Purple
]

// Tint/Shade matrices (Lightness variations for 10 theme columns like MS Excel)
const THEME_COLOR_GRID = [
  // Row 1: Base Header Colors
  ['#000000', '#ffffff', '#1e293b', '#1e3a8a', '#0284c7', '#15803d', '#eab308', '#c2410c', '#b91c1c', '#6b21a8'],
  // Row 2: 80% Lighter
  ['#4b5563', '#f8fafc', '#f1f5f9', '#dbeafe', '#e0f2fe', '#dcfce7', '#fef9c3', '#ffedd5', '#fee2e2', '#f3e8ff'],
  // Row 3: 60% Lighter
  ['#374151', '#f1f5f9', '#cbd5e1', '#bfdbfe', '#bae6fd', '#bbf7d0', '#fef08a', '#fed7aa', '#fecaca', '#e9d5ff'],
  // Row 4: 40% Lighter
  ['#1f2937', '#e2e8f0', '#94a3b8', '#93c5fd', '#7dd3fc', '#86efac', '#fde047', '#fdba74', '#fca5a5', '#d8b4fe'],
  // Row 5: 20% Darker
  ['#111827', '#cbd5e1', '#475569', '#1d4ed8', '#0369a1', '#166534', '#ca8a04', '#ea580c', '#dc2626', '#7e22ce'],
  // Row 6: 40% Darker
  ['#030712', '#94a3b8', '#0f172a', '#1e40af', '#075985', '#14532d', '#854d0e', '#9a3412', '#991b1b', '#581c87']
]

// 10 Standard Excel Palette Colors
const STANDARD_COLORS = [
  '#c00000', // Dark Red
  '#ff0000', // Red
  '#ffc000', // Gold
  '#ffff00', // Yellow
  '#92d050', // Lime Green
  '#00b0f0', // Light Blue
  '#0070c0', // Royal Blue
  '#002060', // Dark Navy
  '#7030a0', // Purple
  '#4a0404'  // Maroon
]

export default function ColorPicker({
  selectedColor = '',
  onChange,
  onClose,
  title = 'Color Palette',
  showNoFill = true
}) {
  const [customHex, setCustomHex] = useState(selectedColor || '')

  const handleSelect = (color) => {
    onChange(color)
    if (onClose) onClose()
  }

  return (
    <div className="w-full max-w-[280px] bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-700 shadow-2xl space-y-3 animate-in fade-in zoom-in-95 duration-100 z-50">
      {/* Title */}
      <div className="flex items-center justify-between pb-1 border-b border-slate-800">
        <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider">{title}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xs font-bold px-1"
          >
            ✕
          </button>
        )}
      </div>

      {/* 1. Theme Colors Section (Excel 10x6 Grid) */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-400">Theme Colors</div>
        <div className="space-y-1">
          {THEME_COLOR_GRID.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-10 gap-1">
              {row.map((hex, cIdx) => (
                <button
                  key={cIdx}
                  type="button"
                  onClick={() => handleSelect(hex)}
                  className={`w-5 h-5 rounded border transition transform hover:scale-125 hover:z-10 cursor-pointer ${
                    selectedColor === hex ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-white/20'
                  }`}
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Standard Colors Section (10 Colors) */}
      <div className="space-y-1">
        <div className="text-[10px] font-bold text-slate-400">Standard Colors</div>
        <div className="grid grid-cols-10 gap-1">
          {STANDARD_COLORS.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => handleSelect(hex)}
              className={`w-5 h-5 rounded border transition transform hover:scale-125 hover:z-10 cursor-pointer ${
                selectedColor === hex ? 'ring-2 ring-amber-400 border-white scale-110' : 'border-white/20'
              }`}
              style={{ backgroundColor: hex }}
              title={hex}
            />
          ))}
        </div>
      </div>

      {/* 3. No Fill Option */}
      {showNoFill && (
        <button
          type="button"
          onClick={() => handleSelect('')}
          className="w-full py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition cursor-pointer"
        >
          <span>🚫</span>
          <span>No Fill / Reset</span>
        </button>
      )}

      {/* 4. Custom Hex Input */}
      <div className="pt-2 border-t border-slate-800 flex items-center gap-1.5">
        <input
          type="text"
          value={customHex}
          onChange={(e) => setCustomHex(e.target.value)}
          placeholder="#1e293b"
          className="flex-1 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-xl border border-slate-700 focus:outline-none placeholder-slate-500 font-mono"
        />
        <button
          type="button"
          onClick={() => {
            if (customHex.trim()) handleSelect(customHex.trim())
          }}
          className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition cursor-pointer"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
