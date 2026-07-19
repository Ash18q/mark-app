import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_PLATFORMS = [
  'YouTube', 'Instagram', 'Threads', 'Facebook',
  'Twitter/X', 'LinkedIn', 'GitHub', 'Reddit', 'Discord',
]

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const LogoutIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
)
const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
)
const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

// ─── Platform color palette ───────────────────────────────────────────────────
const PLATFORM_COLORS = {
  youtube: 'bg-red-100 text-red-700 border-red-200',
  yt: 'bg-red-100 text-red-700 border-red-200',
  instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  insta: 'bg-pink-100 text-pink-700 border-pink-200',
  threads: 'bg-gray-200 text-gray-800 border-gray-300',
  facebook: 'bg-blue-100 text-blue-700 border-blue-200',
  'twitter/x': 'bg-sky-100 text-sky-700 border-sky-200',
  twitter: 'bg-sky-100 text-sky-700 border-sky-200',
  x: 'bg-sky-100 text-sky-700 border-sky-200',
  linkedin: 'bg-blue-100 text-blue-700 border-blue-200',
  github: 'bg-gray-100 text-gray-700 border-gray-200',
  reddit: 'bg-orange-100 text-orange-700 border-orange-200',
  discord: 'bg-violet-100 text-violet-700 border-violet-200',
  default: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}
function platformColor(p = '') {
  return PLATFORM_COLORS[p.toLowerCase()] || PLATFORM_COLORS.default
}

// ─── Smart Platform Input (select + custom fallback) ─────────────────────────
function PlatformInput({ id = 'platform-input', value, onChange, className = '' }) {
  const isCustom = value !== '' && !DEFAULT_PLATFORMS.includes(value)
  const [customMode, setCustomMode] = useState(isCustom)
  const [customText, setCustomText] = useState(isCustom ? value : '')

  const selectCls = className
  const textCls = className

  function handleSelectChange(e) {
    const selected = e.target.value
    if (selected === '__custom__') {
      setCustomMode(true)
      setCustomText('')
      onChange('')
    } else {
      setCustomMode(false)
      setCustomText('')
      onChange(selected)
    }
  }

  function handleCustomChange(e) {
    setCustomText(e.target.value)
    onChange(e.target.value)
  }

  const selectValue = customMode ? '__custom__' : (value || '')

  return (
    <div className="flex flex-col gap-2">
      <select
        id={id}
        value={selectValue}
        onChange={handleSelectChange}
        required={!customMode}
        className={selectCls}
      >
        <option value="" disabled>Select a platform…</option>
        {DEFAULT_PLATFORMS.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
        <option value="__custom__">✏️ Custom / Other</option>
      </select>

      {customMode && (
        <input
          id={`${id}-custom`}
          type="text"
          value={customText}
          onChange={handleCustomChange}
          placeholder="Type platform name…"
          autoComplete="off"
          required
          autoFocus
          className={textCls}
        />
      )}
    </div>
  )
}

// ─── Tag Autocomplete Input ───────────────────────────────────────────────────
function TagInput({ id = 'link-tag', value, onChange, suggestions, className = '', placeholder = 'e.g. tutorial, recipe, notes' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value
  )
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])
  return (
    <div ref={ref} className="relative">
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        required
      />
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-40 overflow-y-auto">
          {filtered.map((tag) => (
            <li
              key={tag}
              onMouseDown={() => { onChange(tag); setOpen(false) }}
              className="px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer flex items-center gap-2 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-indigo-400 flex-shrink-0" />
              {tag}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ link, tags, onClose, onSave }) {
  const [tag, setTag] = useState(link.tag || '')
  const [platform, setPlatform] = useState(link.platform || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose()
  }

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    if (!tag.trim()) { setError('Tag is required.'); return }
    if (!platform.trim()) { setError('Platform is required.'); return }
    setLoading(true)
    try {
      await onSave(link.id, { tag, platform })
      onClose()
    } catch (err) {
      setError(err.message || 'Update failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition text-sm'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-[fadeIn_0.15s_ease]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4 flex items-center justify-between">
          <div>
            <h2 id="edit-modal-title" className="text-white font-bold text-base flex items-center gap-2">
              <PencilIcon /> Edit Link
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">Update tag or platform for this link</p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-5 flex flex-col gap-4">
          {/* URL — read-only */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">🌐 URL (read-only)</label>
            <div className="w-full px-4 py-3 rounded-xl border border-dashed border-gray-300 bg-gray-100 text-gray-500 text-sm truncate select-all cursor-text" title={link.url}>
              {link.url}
            </div>
          </div>

          {/* Tag */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-tag" className="text-sm font-semibold text-gray-700">🏷️ Tag</label>
            <TagInput
              id="edit-tag"
              value={tag}
              onChange={setTag}
              suggestions={tags}
              className={inputCls}
              placeholder="Enter or update tag…"
            />
          </div>

          {/* Platform */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-platform" className="text-sm font-semibold text-gray-700">📱 Platform</label>
            <PlatformInput
              id="edit-platform"
              value={platform}
              onChange={setPlatform}
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : (
                <><PencilIcon /> Update Link</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Stat Cards ───────────────────────────────────────────────────────────────
function StatCards({ links }) {
  const total = links.length

  const platformCounts = links.reduce((acc, l) => {
    const p = l.platform || 'Other';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  const tagCounts = links.reduce((acc, l) => {
    const t = l.tag || 'No Tag';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const tagColorClasses = [
    'text-indigo-600',
    'text-pink-650',
    'text-emerald-600',
    'text-amber-600',
    'text-sky-600',
    'text-purple-600',
    'text-rose-600',
    'text-teal-600',
  ];

  function getTagColor(tag) {
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % tagColorClasses.length;
    return tagColorClasses[index];
  }

  const PLATFORM_EMOJIS = {
    youtube: '▶️',
    yt: '▶️',
    instagram: '📸',
    insta: '📸',
    threads: '🧵',
    facebook: '👥',
    'twitter/x': '🐦',
    twitter: '🐦',
    x: '🐦',
    linkedin: '💼',
    github: '💻',
    reddit: '🤖',
    discord: '💬',
    default: '🔗'
  };

  function getPlatformEmoji(p) {
    return PLATFORM_EMOJIS[p.toLowerCase()] || PLATFORM_EMOJIS.default;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm flex flex-col gap-4 text-sm text-gray-700">
      <h3 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-2 flex items-center gap-2">
        📊 Library Insights
      </h3>

      {/* Total Links */}
      <div className="flex items-center gap-2 font-medium">
        <span>🔗</span>
        <span>Total: <strong className="text-indigo-650 font-extrabold text-base">{total}</strong> links</span>
      </div>

      {/* Platform Stats */}
      <div className="flex flex-col gap-1 border-t border-gray-50 pt-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Platforms</span>
        {Object.keys(platformCounts).length === 0 ? (
          <span className="text-gray-400 text-xs">No platforms yet.</span>
        ) : (
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-gray-600">
            {Object.entries(platformCounts).map(([platform, count], idx, arr) => (
              <span key={platform} className="flex items-center gap-1">
                <span>{getPlatformEmoji(platform)}</span>
                <span>{platform}: <strong>{count}</strong></span>
                {idx < arr.length - 1 && <span className="text-gray-300 ml-1.5">|</span>}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tags Stats */}
      <div className="flex flex-col gap-1 border-t border-gray-50 pt-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">📂 Tags</span>
        <div className="text-xs text-gray-655 leading-relaxed">
          {Object.keys(tagCounts).length === 0 ? (
            <span className="text-gray-400">None</span>
          ) : (
            Object.entries(tagCounts).map(([tag, count], idx, arr) => (
              <span key={tag}>
                <span className={`font-semibold ${getTagColor(tag)}`}>{tag}</span>
                <span className="text-gray-450 font-medium"> ({count})</span>
                {idx < arr.length - 1 ? ' | ' : ''}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Link Form (Tab 1) ────────────────────────────────────────────────────
function AddLinkTab({ initialUrl, links }) {
  const { addLink, tags } = useAuth()
  const [url, setUrl] = useState(initialUrl)
  const [tag, setTag] = useState('')
  const [platform, setPlatform] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => { setUrl(initialUrl) }, [initialUrl])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (!url.trim()) { setError('URL is required.'); return }
    setLoading(true)
    try {
      await addLink({ url: url.trim(), tag: tag.trim(), platform: platform.trim() })
      setUrl(''); setTag(''); setPlatform('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.message || 'Failed to save link.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition text-sm'

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-fit">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4">
          <h2 className="text-white font-bold text-base flex items-center gap-2">
            <LinkIcon /> Save a New Link
          </h2>
          <p className="text-indigo-200 text-xs mt-0.5">Paste any URL and tag it for quick access later</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* URL */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="link-url" className="text-sm font-semibold text-gray-700">🌐 URL</label>
            <input
              id="link-url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/article"
              className={inputCls}
              required
            />
          </div>

          {/* Tag + Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="link-tag" className="text-sm font-semibold text-gray-700">🏷️ Tag</label>
              <TagInput
                id="link-tag"
                value={tag}
                onChange={setTag}
                suggestions={tags}
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="add-platform" className="text-sm font-semibold text-gray-700">📱 Platform</label>
              <PlatformInput
                id="add-platform"
                value={platform}
                onChange={setPlatform}
                className={inputCls}
              />
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span className="mt-0.5">⚠️</span> {error}
            </div>
          )}
          {success && (
            <div role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-2">
              <span>✅</span> Link saved to your library!
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            ) : (
              <><span className="text-base">💾</span> Save Link</>
            )}
          </button>
        </form>
      </div>

      {/* Right Column: Compact Stats */}
      <div className="h-fit">
        <StatCards links={links} />
      </div>
    </div>
  )
}

// ─── Date range utility (pure vanilla JS) ─────────────────────────────────────
function getDateBounds(range) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  switch (range) {
    case 'today':
      return { from: today, to: now }
    case 'yesterday': {
      const s = new Date(today); s.setDate(today.getDate() - 1)
      return { from: s, to: today }
    }
    case '7days': {
      const s = new Date(today); s.setDate(today.getDate() - 7)
      return { from: s, to: now }
    }
    case 'thisMonth':
      return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: now }
    case '3months': {
      const s = new Date(today); s.setMonth(today.getMonth() - 3)
      return { from: s, to: now }
    }
    case '6months': {
      const s = new Date(today); s.setMonth(today.getMonth() - 6)
      return { from: s, to: now }
    }
    case 'thisYear':
      return { from: new Date(now.getFullYear(), 0, 1), to: now }
    default:
      return null
  }
}

// ─── My Library Table (Tab 2) ─────────────────────────────────────────────────
function LibraryTab({ links, onDelete, onUpdate }) {
  const { tags } = useAuth()

  const [filterTag, setFilterTag] = useState('All')
  const [filterPlatform, setFilterPlatform] = useState('All')
  const [sortDir, setSortDir] = useState('desc')
  const [dateRange, setDateRange] = useState('all')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [editingLink, setEditingLink] = useState(null)

  const allTags = useMemo(() => ['All', ...new Set(links.map(l => l.tag).filter(Boolean))], [links])
  const allPlatforms = useMemo(() => ['All', ...new Set(links.map(l => l.platform).filter(Boolean))], [links])

  const filtered = useMemo(() => {
    let fromDate = null, toDate = null

    if (dateRange === 'custom') {
      if (customFrom) fromDate = new Date(customFrom)
      if (customTo) toDate = new Date(new Date(customTo).getTime() + 86399999)
    } else if (dateRange !== 'all') {
      const b = getDateBounds(dateRange)
      if (b) { fromDate = b.from; toDate = b.to }
    }

    return links
      .filter(l => filterTag === 'All' || l.tag === filterTag)
      .filter(l => filterPlatform === 'All' || l.platform === filterPlatform)
      .filter(l => {
        if (!fromDate && !toDate) return true
        const d = new Date(l.created_at)
        if (fromDate && d < fromDate) return false
        if (toDate && d > toDate) return false
        return true
      })
      .sort((a, b) => {
        const d = new Date(a.created_at) - new Date(b.created_at)
        return sortDir === 'asc' ? d : -d
      })
  }, [links, filterTag, filterPlatform, dateRange, customFrom, customTo, sortDir])

  async function handleDelete(id) {
    if (!window.confirm('Delete this link?')) return
    setDeletingId(id)
    try { await onDelete(id) } finally { setDeletingId(null) }
  }

  function formatDate(iso) {
    return new Date(iso).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
    })
  }

  const getDisplayUrl = (url) => {
    try {
      const u = new URL(url)
      return u.hostname + u.pathname
    } catch {
      return url.length > 40 ? url.slice(0, 40) + '…' : url
    }
  }

  const todayStr = new Date().toISOString().split('T')[0]
  const selectCls = 'text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer'

  return (
    <div className="flex flex-col gap-4">
      {/* ── Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-sm">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Filter:</span>

        <select id="filter-tag" value={filterTag} onChange={e => setFilterTag(e.target.value)} className={selectCls}>
          {allTags.map(t => <option key={t}>{t}</option>)}
        </select>

        <select id="filter-platform" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)} className={selectCls}>
          {allPlatforms.map(p => <option key={p}>{p}</option>)}
        </select>

        <select
          id="filter-date-range"
          value={dateRange}
          onChange={e => { setDateRange(e.target.value); setCustomFrom(''); setCustomTo('') }}
          className={selectCls}
        >
          <option value="all">All Dates</option>
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="7days">Last 7 Days</option>
          <option value="thisMonth">This Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="thisYear">This Year</option>
          <option value="custom">📅 Custom</option>
        </select>

        <button
          id="sort-date-btn"
          onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
          title="Toggle sort direction"
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 transition cursor-pointer flex items-center gap-1.5"
        >
          Date {sortDir === 'desc' ? '↓' : '↑'}
        </button>

        <span className="ml-auto text-xs text-gray-400 font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
          {filtered.length} / {links.length} links
        </span>
      </div>

      {/* ── Custom Date Inputs ── */}
      {dateRange === 'custom' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">📅 Custom Range:</span>
          <div className="flex items-center gap-2">
            <label htmlFor="custom-from" className="text-xs text-gray-600 font-medium whitespace-nowrap">From</label>
            <input id="custom-from" type="date" value={customFrom} max={customTo || todayStr}
              onChange={e => setCustomFrom(e.target.value)}
              className="text-sm border border-indigo-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="custom-to" className="text-xs text-gray-600 font-medium whitespace-nowrap">To</label>
            <input id="custom-to" type="date" value={customTo} min={customFrom || undefined} max={todayStr}
              onChange={e => setCustomTo(e.target.value)}
              className="text-sm border border-indigo-300 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer" />
          </div>
          {(customFrom || customTo) && (
            <button onClick={() => { setCustomFrom(''); setCustomTo('') }}
              className="text-xs text-indigo-500 hover:text-indigo-700 underline ml-auto">
              Clear
            </button>
          )}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-20 text-center text-gray-400">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-sm font-medium">No links found.</p>
            <p className="text-xs text-gray-300 mt-1">Add your first link in the "Add New Link" tab!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse min-w-[660px]">
              <thead>
                <tr className="bg-gradient-to-r from-indigo-700 to-blue-700 text-white">
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider border border-indigo-600 w-10">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider border border-indigo-600">URL</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider border border-indigo-600">Tag</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider border border-indigo-600">Platform</th>
                  <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider border border-indigo-600">Date</th>
                  <th className="px-3 py-3 text-center font-semibold text-xs uppercase tracking-wider border border-indigo-600 w-20">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((link, idx) => (
                  <tr key={link.id}
                    className={`border-b border-gray-200 hover:bg-indigo-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-3 py-2.5 text-center text-gray-400 font-mono text-xs border border-gray-200">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-2.5 border border-gray-200 max-w-[200px]">
                      <a href={link.url} target="_blank" rel="noopener noreferrer" title={link.url}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline font-medium block truncate">
                        {getDisplayUrl(link.url)}
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-center border border-gray-200">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
                        {link.tag || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center border border-gray-200">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${platformColor(link.platform)}`}>
                        {link.platform || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-center text-gray-500 text-xs font-mono border border-gray-200 whitespace-nowrap">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-3 py-2.5 text-center border border-gray-200">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => setEditingLink(link)}
                          className="p-1.5 rounded-lg text-indigo-400 hover:text-indigo-700 hover:bg-indigo-50 transition-colors"
                          aria-label="Edit link"
                          title="Edit"
                        >
                          <PencilIcon />
                        </button>
                        <button
                          onClick={() => handleDelete(link.id)}
                          disabled={deletingId === link.id}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                          aria-label="Delete link"
                          title="Delete"
                        >
                          {deletingId === link.id
                            ? <span className="inline-block w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            : <TrashIcon />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingLink && (
        <EditModal
          link={editingLink}
          tags={tags}
          onClose={() => setEditingLink(null)}
          onSave={onUpdate}
        />
      )}
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, links, deleteLink, updateLink, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('add')

  const sharedUrl = searchParams.get('url') || searchParams.get('text') || ''
  useEffect(() => { if (sharedUrl) setActiveTab('add') }, [sharedUrl])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  const tabs = [
    { id: 'add', label: 'Add New Link', icon: '➕' },
    { id: 'library', label: 'My Library', icon: '📋' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-blue-50">

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl flex items-center justify-center shadow">
              <span className="text-white font-extrabold text-sm">M</span>
            </div>
            <div className="leading-none">
              <span className="font-extrabold text-indigo-800 text-lg tracking-tight">MARK</span>
              <span className="block text-[10px] text-gray-400 font-medium -mt-0.5">Link Manager</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:block text-xs text-gray-400 truncate max-w-[150px]">{user?.email}</span>
            <button
              id="logout-btn"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition font-medium border border-gray-200 hover:border-red-200"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Tabs ── */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60'
                  : 'border-transparent text-gray-500 hover:text-indigo-600 hover:bg-gray-50'}`}
            >
              <span>{tab.icon}</span> {tab.label}
              {tab.id === 'library' && links.length > 0 && (
                <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                  {links.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-12">
        {sharedUrl && activeTab === 'add' && (
          <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-sm text-indigo-700">
            <span className="text-xl">🔗</span>
            <div>
              <p className="font-semibold">Shared URL detected!</p>
              <p className="text-xs text-indigo-500 mt-0.5">Pre-filled in the form below.</p>
            </div>
          </div>
        )}

        {activeTab === 'add' && <AddLinkTab initialUrl={sharedUrl} links={links} />}
        {activeTab === 'library' && <LibraryTab links={links} onDelete={deleteLink} onUpdate={updateLink} />}
      </main>
    </div>
  )
}
