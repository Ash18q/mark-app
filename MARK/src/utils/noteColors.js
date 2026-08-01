export const NOTE_COLORS = {
  // ── Dark Themes ──
  olive: {
    id: 'olive',
    name: 'Olive Green',
    bg: 'bg-[#434522]',
    text: 'text-[#eceebf]',
    title: 'text-[#f5f7d2]',
    border: 'border-amber-900/30',
    hex: '#434522',
    isLight: false
  },
  slate: {
    id: 'slate',
    name: 'Dark Slate',
    bg: 'bg-[#1e293b]',
    text: 'text-slate-200',
    title: 'text-white',
    border: 'border-slate-700/50',
    hex: '#1e293b',
    isLight: false
  },
  red: {
    id: 'red',
    name: 'Crimson Red',
    bg: 'bg-[#5c1d24]',
    text: 'text-red-100',
    title: 'text-red-50',
    border: 'border-red-800/40',
    hex: '#5c1d24',
    isLight: false
  },
  blue: {
    id: 'blue',
    name: 'Deep Blue',
    bg: 'bg-[#1b365d]',
    text: 'text-blue-100',
    title: 'text-blue-50',
    border: 'border-blue-800/40',
    hex: '#1b365d',
    isLight: false
  },
  purple: {
    id: 'purple',
    name: 'Royal Purple',
    bg: 'bg-[#3b1f52]',
    text: 'text-purple-100',
    title: 'text-purple-50',
    border: 'border-purple-800/40',
    hex: '#3b1f52',
    isLight: false
  },
  emerald: {
    id: 'emerald',
    name: 'Emerald Green',
    bg: 'bg-[#144733]',
    text: 'text-emerald-100',
    title: 'text-emerald-50',
    border: 'border-emerald-800/40',
    hex: '#144733',
    isLight: false
  },
  amber: {
    id: 'amber',
    name: 'Chocolate Amber',
    bg: 'bg-[#5c3e1e]',
    text: 'text-amber-100',
    title: 'text-amber-50',
    border: 'border-amber-800/40',
    hex: '#5c3e1e',
    isLight: false
  },
  rose: {
    id: 'rose',
    name: 'Rose Night',
    bg: 'bg-[#4c1d3b]',
    text: 'text-pink-100',
    title: 'text-pink-50',
    border: 'border-pink-800/40',
    hex: '#4c1d3b',
    isLight: false
  },
  teal: {
    id: 'teal',
    name: 'Ocean Teal',
    bg: 'bg-[#134e4a]',
    text: 'text-teal-100',
    title: 'text-teal-50',
    border: 'border-teal-800/40',
    hex: '#134e4a',
    isLight: false
  },
  indigo: {
    id: 'indigo',
    name: 'Indigo Night',
    bg: 'bg-[#312e81]',
    text: 'text-indigo-100',
    title: 'text-indigo-50',
    border: 'border-indigo-800/40',
    hex: '#312e81',
    isLight: false
  },
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal Black',
    bg: 'bg-[#18181b]',
    text: 'text-zinc-200',
    title: 'text-white',
    border: 'border-zinc-800',
    hex: '#18181b',
    isLight: false
  },
  coffee: {
    id: 'coffee',
    name: 'Espresso',
    bg: 'bg-[#3f2305]',
    text: 'text-orange-100',
    title: 'text-orange-50',
    border: 'border-amber-950',
    hex: '#3f2305',
    isLight: false
  },

  // ── Light Themes ──
  parchment: {
    id: 'parchment',
    name: 'Light Parchment',
    bg: 'bg-[#f8fafc]',
    text: 'text-slate-800',
    title: 'text-slate-950',
    border: 'border-slate-300',
    hex: '#f8fafc',
    isLight: true
  },
  lightCream: {
    id: 'lightCream',
    name: 'Warm Cream',
    bg: 'bg-[#fef3c7]',
    text: 'text-amber-950',
    title: 'text-amber-950',
    border: 'border-amber-300',
    hex: '#fef3c7',
    isLight: true
  },
  lightMint: {
    id: 'lightMint',
    name: 'Soft Mint',
    bg: 'bg-[#dcfce7]',
    text: 'text-emerald-950',
    title: 'text-emerald-950',
    border: 'border-emerald-300',
    hex: '#dcfce7',
    isLight: true
  },
  lightSky: {
    id: 'lightSky',
    name: 'Sky Blue',
    bg: 'bg-[#e0f2fe]',
    text: 'text-sky-950',
    title: 'text-sky-950',
    border: 'border-sky-300',
    hex: '#e0f2fe',
    isLight: true
  },
  lightLavender: {
    id: 'lightLavender',
    name: 'Soft Lavender',
    bg: 'bg-[#f3e8ff]',
    text: 'text-purple-950',
    title: 'text-purple-950',
    border: 'border-purple-300',
    hex: '#f3e8ff',
    isLight: true
  },
  lightRose: {
    id: 'lightRose',
    name: 'Blush Pink',
    bg: 'bg-[#ffe4e6]',
    text: 'text-rose-950',
    title: 'text-rose-950',
    border: 'border-rose-300',
    hex: '#ffe4e6',
    isLight: true
  }
}

export const DEFAULT_COLOR = 'olive'

export function getTheme(colorId) {
  if (colorId && NOTE_COLORS[colorId]) {
    return NOTE_COLORS[colorId]
  }

  // If colorId is a hex color (e.g. '#1e293b')
  if (colorId && (colorId.startsWith('#') || colorId.startsWith('rgb'))) {
    return {
      id: colorId,
      name: 'Custom',
      bg: '',
      text: 'text-slate-100',
      title: 'text-white',
      border: 'border-white/20',
      hex: colorId,
      isLight: false
    }
  }

  return NOTE_COLORS.olive
}
