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
const CopyIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
)
const LinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
)
const ThreeDotsIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
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

// ─── Platform auto-detection helper ─────────────────────────────────────────
function detectPlatform(url) {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (host.includes('youtube.com') || host.includes('youtu.be')) return 'YouTube'
    if (host.includes('instagram.com')) return 'Instagram'
    if (host.includes('threads.net')) return 'Threads'
    if (host.includes('x.com') || host.includes('twitter.com')) return 'Twitter/X'
    if (host.includes('facebook.com')) return 'Facebook'
    if (host.includes('linkedin.com')) return 'LinkedIn'
    if (host.includes('github.com')) return 'GitHub'
    if (host.includes('reddit.com')) return 'Reddit'
    if (host.includes('discord.com') || host.includes('discord.gg')) return 'Discord'
  } catch { /* invalid url */ }
  return ''
}

// ─── Smart Platform Input (select + custom fallback) ─────────────────────────
function PlatformInput({ id = 'platform-input', value, onChange, className = '', suggestions = DEFAULT_PLATFORMS }) {
  const isCustom = value !== '' && !suggestions.includes(value)
  const [customMode, setCustomMode] = useState(isCustom)
  const [customText, setCustomText] = useState(isCustom ? value : '')

  // sync when value changes externally (e.g. auto-detect)
  useEffect(() => {
    if (value && suggestions.includes(value)) {
      setCustomMode(false)
      setCustomText('')
    }
  }, [value, suggestions])

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
        className={className}
      >
        <option value="" disabled>Select a platform…</option>
        {suggestions.map((p) => (
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
          className={className}
        />
      )}
    </div>
  )
}

// ─── Tag Autocomplete Input (Interactive Pill Chips + Custom Typeable) ────────
function TagInput({ id = 'link-tag', value, onChange, suggestions, className = '', placeholder = 'Add or select tags…', inputRef }) {
  const [open, setOpen] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const ref = useRef(null)

  // Current tags entered (split by comma)
  const currentTags = useMemo(() => {
    return value.split(',').map(t => t.trim()).filter(Boolean)
  }, [value])

  const filtered = useMemo(() => {
    if (showAll || !inputValue.trim()) return suggestions
    const q = inputValue.trim().toLowerCase()
    return suggestions.filter((s) => s.toLowerCase().includes(q))
  }, [suggestions, showAll, inputValue])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        if (inputValue.trim()) {
          const t = inputValue.trim()
          if (!currentTags.includes(t)) {
            onChange([...currentTags, t].join(', '))
          }
          setInputValue('')
        }
        setOpen(false)
        setShowAll(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [inputValue, currentTags, onChange])

  function addTag(tagToAdd) {
    const t = tagToAdd.trim()
    if (!t) return
    if (!currentTags.includes(t)) {
      const updated = [...currentTags, t]
      onChange(updated.join(', '))
    }
    setInputValue('')
  }

  function removeTag(tagToRemove) {
    const updated = currentTags.filter(t => t !== tagToRemove)
    onChange(updated.join(', '))
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (inputValue.trim()) {
        addTag(inputValue)
      } else {
        setOpen(false)
        setShowAll(false)
      }
    } else if (e.key === 'Escape') {
      if (inputValue.trim()) {
        addTag(inputValue)
      }
      setOpen(false)
      setShowAll(false)
    } else if (e.key === 'Backspace' && !inputValue && currentTags.length > 0) {
      removeTag(currentTags[currentTags.length - 1])
    }
  }

  function handleChevronClick(e) {
    e.preventDefault()
    if (inputValue.trim()) {
      addTag(inputValue)
    }
    if (open) {
      setOpen(false)
      setShowAll(false)
    } else {
      setShowAll(true)
      setOpen(true)
    }
  }

  return (
    <div ref={ref} className="relative flex-1">
      {/* Outer Chip Container */}
      <div
        className="min-h-[42px] w-full border border-gray-200 rounded-xl px-3 py-1.5 bg-gray-50 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 flex flex-wrap items-center gap-1.5 transition cursor-text pr-9"
        onClick={() => {
          if (inputRef && inputRef.current) inputRef.current.focus()
          setOpen(true)
        }}
      >
        {/* Rendered Tag Pills/Chips */}
        {currentTags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs animate-fadeIn"
          >
            <span>🏷️ {tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="hover:text-indigo-950 font-bold text-xs p-0.5 rounded-full hover:bg-indigo-200/60 transition"
              title="Remove tag"
            >
              ✕
            </button>
          </span>
        ))}

        {/* Typeable Input for Custom Tags */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value
            if (val.endsWith(',')) {
              addTag(val.slice(0, -1))
            } else {
              setInputValue(val)
              setShowAll(false)
              setOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) {
              addTag(inputValue)
            }
          }}
          onFocus={() => setOpen(true)}
          placeholder={currentTags.length === 0 ? placeholder : 'Add tag…'}
          className="bg-transparent text-sm text-gray-800 focus:outline-none flex-1 min-w-[100px] py-0.5"
          autoComplete="off"
        />
      </div>

      {/* Hidden input to pass form validation if required */}
      <input
        type="hidden"
        value={value}
        required
      />

      {/* Chevron arrow — clickable, shows/closes suggestions */}
      <button
        type="button"
        tabIndex={-1}
        onMouseDown={handleChevronClick}
        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Toggle tag suggestions"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Suggestions List with Header & Done Button */}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Header Bar with Done Button */}
          <div className="bg-gray-50 border-b border-gray-100 px-3 py-1.5 flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              {currentTags.length > 0 ? `🏷️ ${currentTags.length} Selected` : 'Select Tags'}
            </span>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                if (inputValue.trim()) {
                  addTag(inputValue)
                }
                setOpen(false)
                setShowAll(false)
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-0.5 rounded-md transition cursor-pointer"
            >
              Done ✓
            </button>
          </div>

          <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50 py-1 text-xs">
            {filtered.map((tag) => {
              const isSelected = currentTags.includes(tag)
              return (
                <li
                  key={tag}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    if (isSelected) {
                      removeTag(tag)
                    } else {
                      addTag(tag)
                    }
                  }}
                  className={`px-3.5 py-2 cursor-pointer flex items-center justify-between font-medium transition ${isSelected ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span className="text-gray-400 text-[10px]">🏷️</span>
                    {tag}
                  </span>
                  {isSelected && (
                    <span className="text-indigo-600 font-bold text-xs">✓</span>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ link, tags, onClose, onSave }) {
  const [url, setUrl] = useState(link.url || '')
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
    if (!url.trim()) { setError('URL is required.'); return }
    if (!tag.trim()) { setError('Tag is required.'); return }
    if (!platform.trim()) { setError('Platform is required.'); return }
    setLoading(true)
    try {
      await onSave(link.id, { url, tag, platform })
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-[fadeIn_0.15s_ease]">
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
          {/* URL — editable */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-url" className="text-sm font-semibold text-gray-700">🌐 URL</label>
            <input
              id="edit-url"
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); const d = detectPlatform(e.target.value); if (d) setPlatform(d) }}
              className={inputCls}
              placeholder="https://example.com"
              required
            />
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
  const [platform, setPlatform] = useState(() => detectPlatform(initialUrl))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const tagInputRef = useRef(null)

  // Dynamic platform suggestions: defaults + any user-saved custom platforms
  const platformSuggestions = useMemo(() => {
    const defaults = ['YouTube', 'Instagram', 'Threads', 'Facebook', 'Twitter/X', 'LinkedIn', 'GitHub', 'Reddit', 'Discord']
    const existing = [...new Set(links.map(l => l.platform).filter(Boolean))]
    return [...new Set([...defaults, ...existing])]
  }, [links])

  // Sync url + auto-detect platform when initialUrl changes
  // Also re-reads window.location.href at effect time as extra safety net
  useEffect(() => {
    const effectiveUrl = initialUrl || (() => {
      try {
        const parsed = new URL(window.location.href)
        return parsed.searchParams.get('url') || parsed.searchParams.get('text') || parsed.searchParams.get('link') || ''
      } catch { return '' }
    })()
    if (effectiveUrl) {
      setUrl(effectiveUrl)
      const detected = detectPlatform(effectiveUrl)
      if (detected) setPlatform(detected)
    }
  }, [initialUrl])

  // Auto-focus tag input in Quick-Save popup mode
  const isPopupMode = Boolean(initialUrl)
  useEffect(() => {
    if (isPopupMode && tagInputRef.current) {
      tagInputRef.current.focus()
    }
  }, [isPopupMode])

  async function handleSubmit(e) {
    e.preventDefault()
    setError(''); setSuccess(false)
    if (!url.trim()) { setError('URL is required.'); return }
    setLoading(true)
    try {
      await addLink({ url: url.trim(), tag: tag.trim(), platform: platform.trim() })
      if (isPopupMode) {
        // Try to close the window (works in Android share sheet / PWA)
        try { window.close() } catch { /* ignore */ }
        // Fallback: go to library
        window.location.href = '/'
      } else {
        setUrl(''); setTag(''); setPlatform('')
        setSuccess(true)
        setTimeout(() => setSuccess(false), 2500)
      }
    } catch (err) {
      setError(err.message || 'Failed to save link.')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white focus:border-transparent transition text-sm'

  // ── Quick-Save Popup Mode (shared URL detected) ──────────────────────────────
  if (isPopupMode) {
    const detectedPlatform = detectPlatform(url)
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-[fadeIn_0.15s_ease]">
          {/* Popup Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <LinkIcon /> Quick Save
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">Tag this link and save it to your library</p>
          </div>

          {/* Popup Body */}
          <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
            {/* URL — editable so user can verify/fix if share intent garbled it */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="qs-url" className="text-xs font-semibold text-gray-500 uppercase tracking-wide">🌐 URL</label>
              <input
                id="qs-url"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); const d = detectPlatform(e.target.value); if (d) setPlatform(d) }}
                className={`${inputCls} text-xs`}
                placeholder="https://example.com"
                required
              />
            </div>

            {/* Auto-detected platform badge */}
            {detectedPlatform && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Detected:</span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${platformColor(detectedPlatform)}`}>
                  📱 {detectedPlatform}
                </span>
              </div>
            )}

            {/* Tag input — auto-focused */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="qs-tag" className="text-sm font-semibold text-gray-700">🏷️ Tag <span className="text-red-400">*</span></label>
              <TagInput
                id="qs-tag"
                value={tag}
                onChange={setTag}
                suggestions={tags}
                className={inputCls}
                placeholder="e.g. tutorial, remote jobs…"
                inputRef={tagInputRef}
              />
            </div>

            {/* Platform selector */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="qs-platform" className="text-sm font-semibold text-gray-700">📱 Platform</label>
              <PlatformInput
                id="qs-platform"
                value={platform}
                onChange={setPlatform}
                className={inputCls}
                suggestions={platformSuggestions}
              />
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Save button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
            >
              {loading ? (
                <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
              ) : (
                <>💾 Save &amp; Close</>
              )}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Normal Mode ──────────────────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left Column: Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-fit">
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
              onChange={(e) => { setUrl(e.target.value); const d = detectPlatform(e.target.value); if (d) setPlatform(d) }}
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
                suggestions={platformSuggestions}
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

// ─── Reusable Multi-Select Dropdown ─────────────────────────────────────────
function MultiSelectDropdown({ id, options, selected, onChange, placeholder = 'All' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggleOption = (opt) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(item => item !== opt))
    } else {
      onChange([...selected, opt])
    }
  }

  const toggleAll = () => {
    if (selected.length === options.length) {
      onChange([])
    } else {
      onChange([...options])
    }
  }

  const displayText = () => {
    if (selected.length === 0 || selected.length === options.length) return placeholder
    if (selected.length === 1) return selected[0]
    return `${selected.length} Selected`
  }

  return (
    <div ref={ref} className="relative w-full">
      <button
        id={id}
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 font-medium flex items-center justify-between shadow-sm hover:bg-gray-100 transition cursor-pointer"
      >
        <span className="truncate">{displayText()}</span>
        <span className="text-gray-400 text-[10px] ml-1">▼</span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[170px] bg-white border border-gray-200 rounded-xl shadow-xl p-2 flex flex-col gap-1 max-h-56 overflow-y-auto">
          <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 px-1 mb-1">
            <button
              type="button"
              onClick={toggleAll}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
            >
              {selected.length === options.length ? 'Clear All' : 'Select All'}
            </button>
            <span className="text-[10px] text-gray-400 font-mono">{selected.length}/{options.length}</span>
          </div>
          {options.map((opt) => {
            const isChecked = selected.includes(opt)
            return (
              <label
                key={opt}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 text-xs text-gray-700 cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(opt)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                />
                <span className="truncate">{opt}</span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── DateTime Range Picker Popover Component ──────────────────────────────────
function DateTimeRangePickerPopover({
  fromDate, fromTime, toDate, toTime,
  onFromDateChange, onFromTimeChange, onToDateChange, onToTimeChange,
  onPresetSelect, onReset
}) {
  const [open, setOpen] = useState(false)
  const popoverRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const formattedDisplay = () => {
    if (!fromDate && !toDate) return 'Select Date & Time Range...'
    const fDate = fromDate || 'Start'
    const fTime = fromTime || '00:00'
    const tDate = toDate || 'End'
    const tTime = toTime || '23:59'
    return `${fDate} ${fTime}  -  ${tDate} ${tTime}`
  }

  const presets = [
    { label: 'Today', key: 'today' },
    { label: 'Yesterday', key: 'yesterday' },
    { label: 'Last 3 days', key: '3days' },
    { label: 'Last week', key: '7days' },
    { label: 'This month', key: 'thisMonth' },
    { label: 'Last 3 months', key: '3months' },
    { label: 'Last 6 months', key: '6months' },
    { label: 'The past year', key: 'thisYear' },
  ]

  // Mini calendar helper
  const now = new Date()
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [calYear, setCalYear] = useState(now.getFullYear())

  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const firstDayIndex = new Date(calYear, calMonth, 1).getDay()
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  const handleDateClick = (day) => {
    const mStr = String(calMonth + 1).padStart(2, '0')
    const dStr = String(day).padStart(2, '0')
    const clickedDate = `${calYear}-${mStr}-${dStr}`

    if (!fromDate || (fromDate && toDate)) {
      onFromDateChange(clickedDate)
      onFromTimeChange('00:00')
      onToDateChange('')
      onToTimeChange('23:59')
    } else {
      if (new Date(clickedDate) >= new Date(fromDate)) {
        onToDateChange(clickedDate)
        onToTimeChange('23:59')
      } else {
        onToDateChange(fromDate)
        onToTimeChange('23:59')
        onFromDateChange(clickedDate)
        onFromTimeChange('00:00')
      }
    }
  }

  return (
    <div ref={popoverRef} className="relative w-full sm:w-auto flex-1 min-w-[220px]">
      {/* Trigger Input Box */}
      <div
        onClick={() => setOpen(!open)}
        className="w-full border border-blue-400/80 hover:border-blue-500 rounded-xl px-3 py-1.5 bg-white text-gray-700 font-mono text-xs flex items-center justify-between shadow-sm cursor-pointer transition"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-gray-400">🕒</span>
          <span className="truncate font-medium text-gray-800">{formattedDisplay()}</span>
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onReset(); setOpen(false) }}
            className="text-gray-400 hover:text-red-500 ml-2 font-bold cursor-pointer"
            title="Clear date filter"
          >
            ⊗
          </button>
        )}
      </div>

      {/* Compact Popover Card: Side-by-Side layout on all screens (mobile & desktop) */}
      {open && (
        <div className="absolute z-[100] top-full left-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col w-[94vw] sm:w-[490px] p-3">
          {/* Main 12-Column Grid (4 cols Quick Select, 8 cols Calendar + Time) */}
          <div className="grid grid-cols-12 gap-2.5 bg-gray-50/80 border border-gray-100 p-2 rounded-xl">
            {/* Left Column (col-span-4): Quick Select Chips */}
            <div className="col-span-4 flex flex-col gap-1.5 border-r border-gray-200/60 pr-1.5">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                ⚡ Quick Select
              </span>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[220px] pr-0.5">
                {presets.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => { onPresetSelect(p.key); }}
                    className="w-full text-left px-2 py-1 text-[10px] font-medium rounded-full border border-gray-200 bg-white text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition cursor-pointer truncate shadow-2xs"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column (col-span-8): From/To Date + Time Inputs & Mini Calendar */}
            <div className="col-span-8 flex flex-col gap-2 pl-0.5">
              <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                📅 Date & Time
              </span>

              {/* Direct Typeable From & To Inputs Stack */}
              <div className="flex flex-col gap-1 text-[10px]">
                {/* From Input Box */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase w-8 flex-shrink-0">From:</span>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={fromDate}
                    onChange={(e) => onFromDateChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none flex-1 min-w-0 cursor-text"
                  />
                  <input
                    type="text"
                    placeholder="00:00"
                    value={fromTime}
                    onChange={(e) => onFromTimeChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-md px-1 py-0.5 text-[10px] font-mono font-bold text-gray-700 focus:outline-none w-11 flex-shrink-0 text-center cursor-text"
                  />
                </div>

                {/* To Input Box */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-gray-400 uppercase w-8 flex-shrink-0">To:</span>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD"
                    value={toDate}
                    onChange={(e) => onToDateChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-md px-1.5 py-0.5 text-[10px] font-mono font-bold text-gray-700 focus:ring-1 focus:ring-blue-500 focus:outline-none flex-1 min-w-0 cursor-text"
                  />
                  <input
                    type="text"
                    placeholder="23:59"
                    value={toTime}
                    onChange={(e) => onToTimeChange(e.target.value)}
                    className="bg-white border border-gray-200 rounded-md px-1 py-0.5 text-[10px] font-mono font-bold text-gray-700 focus:outline-none w-11 flex-shrink-0 text-center cursor-text"
                  />
                </div>
              </div>

              {/* Compact Mini Interactive Calendar Grid */}
              <div className="border border-gray-200/70 rounded-xl p-1.5 bg-white max-w-full">
                <div className="flex items-center justify-between mb-1 px-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1) }
                      else setCalMonth(m => m - 1)
                    }}
                    className="text-[10px] text-gray-500 hover:text-indigo-600 font-bold px-1 cursor-pointer"
                  >
                    ‹
                  </button>
                  <span className="text-[10px] font-bold text-gray-700 truncate">
                    {monthNames[calMonth]} {calYear}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1) }
                      else setCalMonth(m => m + 1)
                    }}
                    className="text-[10px] text-gray-500 hover:text-indigo-600 font-bold px-1 cursor-pointer"
                  >
                    ›
                  </button>
                </div>

                {/* Calendar Days Header */}
                <div className="grid grid-cols-7 text-center text-[8px] font-bold text-gray-400 mb-0.5">
                  <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-7 text-center gap-0.5 text-[10px]">
                  {Array.from({ length: firstDayIndex }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-4.5" />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1
                    const mStr = String(calMonth + 1).padStart(2, '0')
                    const dStr = String(day).padStart(2, '0')
                    const dFormatted = `${calYear}-${mStr}-${dStr}`
                    const isSelectedFrom = fromDate === dFormatted
                    const isSelectedTo = toDate === dFormatted
                    const isInRange = fromDate && toDate && dFormatted >= fromDate && dFormatted <= toDate

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateClick(day)}
                        className={`h-5 w-5 rounded-full flex items-center justify-center mx-auto text-[9px] transition cursor-pointer ${isSelectedFrom || isSelectedTo
                            ? 'bg-blue-600 text-white font-bold'
                            : isInRange
                              ? 'bg-blue-100 text-blue-700 font-medium'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                      >
                        {day}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Popover Footer */}
          <div className="bg-gray-50 border-t border-gray-100 p-2.5 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Default time: 00:00 to 23:59</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getPresetDates(preset) {
  const now = new Date()
  const formatDateStr = (d) => {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const todayStr = formatDateStr(now)

  switch (preset) {
    case 'today':
      return { fromDate: todayStr, fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    case 'yesterday': {
      const y = new Date(now)
      y.setDate(y.getDate() - 1)
      const yStr = formatDateStr(y)
      return { fromDate: yStr, fromTime: '00:00', toDate: yStr, toTime: '23:59' }
    }
    case '3days': {
      const s = new Date(now)
      s.setDate(s.getDate() - 3)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    case '7days': {
      const s = new Date(now)
      s.setDate(s.getDate() - 7)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    case 'thisMonth': {
      const s = new Date(now.getFullYear(), now.getMonth(), 1)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    case '3months': {
      const s = new Date(now)
      s.setMonth(s.getMonth() - 3)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    case '6months': {
      const s = new Date(now)
      s.setMonth(s.getMonth() - 6)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    case 'thisYear': {
      const s = new Date(now.getFullYear(), 0, 1)
      return { fromDate: formatDateStr(s), fromTime: '00:00', toDate: todayStr, toTime: '23:59' }
    }
    default:
      return { fromDate: '', fromTime: '00:00', toDate: '', toTime: '23:59' }
  }
}

// ─── My Library Table (Tab 2) ─────────────────────────────────────────────────
function LibraryTab({ links, onDelete, onUpdate, onFilteredChange }) {
  const { tags } = useAuth()

  // Distinct lists (parsing comma-separated multi-tags)
  const availableTags = useMemo(() => {
    return [...new Set(links.flatMap(l => l.tag ? l.tag.split(',').map(t => t.trim()) : []).filter(Boolean))]
  }, [links])
  const availablePlatforms = useMemo(() => [...new Set(links.map(l => l.platform).filter(Boolean))], [links])

  // Pending filter states
  const [pendingTags, setPendingTags] = useState([])
  const [pendingPlatforms, setPendingPlatforms] = useState([])
  const [pendingPreset, setPendingPreset] = useState('all')
  const [pendingFromDate, setPendingFromDate] = useState('')
  const [pendingFromTime, setPendingFromTime] = useState('00:00')
  const [pendingToDate, setPendingToDate] = useState('')
  const [pendingToTime, setPendingToTime] = useState('23:59')
  const [sortDir, setSortDir] = useState('desc')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Applied filter states (updated ONLY on Confirm/Apply button click)
  const [appliedTags, setAppliedTags] = useState([])
  const [appliedPlatforms, setAppliedPlatforms] = useState([])
  const [appliedFromDate, setAppliedFromDate] = useState('')
  const [appliedFromTime, setAppliedFromTime] = useState('00:00')
  const [appliedToDate, setAppliedToDate] = useState('')
  const [appliedToTime, setAppliedToTime] = useState('23:59')

  const [deletingId, setDeletingId] = useState(null)
  const [editingLink, setEditingLink] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  // Close 3-dots popover menu when clicking anywhere outside
  useEffect(() => {
    const closeMenu = () => setActiveMenuId(null)
    document.addEventListener('click', closeMenu)
    return () => document.removeEventListener('click', closeMenu)
  }, [])

  function handleCopy(id, url) {
    try {
      navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  async function handleNativeShare(link) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.tag ? `MARK - ${link.tag}` : 'MARK Link',
          url: link.url
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy(link.id, link.url)
        }
      }
    } else {
      handleCopy(link.id, link.url)
    }
  }

  const hasActiveFilters = appliedTags.length > 0 || appliedPlatforms.length > 0 || Boolean(appliedFromDate) || Boolean(appliedToDate)

  function handleApply() {
    setAppliedTags([...pendingTags])
    setAppliedPlatforms([...pendingPlatforms])
    setAppliedFromDate(pendingFromDate)
    setAppliedFromTime(pendingFromTime)
    setAppliedToDate(pendingToDate)
    setAppliedToTime(pendingToTime)
    setIsFilterOpen(false) // Automatically collapse after applying
  }

  function handleReset() {
    setPendingTags([])
    setPendingPlatforms([])
    setPendingPreset('all')
    setPendingFromDate('')
    setPendingFromTime('00:00')
    setPendingToDate('')
    setPendingToTime('23:59')

    setAppliedTags([])
    setAppliedPlatforms([])
    setAppliedFromDate('')
    setAppliedFromTime('00:00')
    setAppliedToDate('')
    setAppliedToTime('23:59')
  }

  const filtered = useMemo(() => {
    return links
      .filter(l => {
        // Multi-tag filter matching
        if (appliedTags.length > 0) {
          const itemTags = l.tag ? l.tag.split(',').map(t => t.trim()) : []
          if (!appliedTags.some(t => itemTags.includes(t))) return false
        }
        // Multi-platform filter
        if (appliedPlatforms.length > 0 && !appliedPlatforms.includes(l.platform)) return false

        // Date + Time range filter
        if (appliedFromDate || appliedToDate) {
          const itemMs = new Date(l.created_at).getTime()
          if (appliedFromDate) {
            const fromMs = new Date(`${appliedFromDate}T${appliedFromTime || '00:00'}:00`).getTime()
            if (!isNaN(fromMs) && itemMs < fromMs) return false
          }
          if (appliedToDate) {
            const toMs = new Date(`${appliedToDate}T${appliedToTime || '23:59'}:59`).getTime()
            if (!isNaN(toMs) && itemMs > toMs) return false
          }
        }
        return true
      })
      .sort((a, b) => {
        const d = new Date(a.created_at) - new Date(b.created_at)
        return sortDir === 'asc' ? d : -d
      })
  }, [links, appliedTags, appliedPlatforms, appliedFromDate, appliedFromTime, appliedToDate, appliedToTime, sortDir])

  // Previews state for fetched metadata: { [linkId]: { thumbnail, title } }
  const [previews, setPreviews] = useState({})
  const [loadingPreviews, setLoadingPreviews] = useState({})

  async function handleDelete(id) {
    if (!window.confirm('Delete this link?')) return
    setDeletingId(id)
    try { await onDelete(id) } finally { setDeletingId(null) }
  }

  function formatDateParts(iso) {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return { dateStr: '', timeStr: '' }
    const day = d.getDate().toString().padStart(2, '0')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const month = monthNames[d.getMonth()]
    const yr = d.getFullYear()
    const hours = d.getHours().toString().padStart(2, '0')
    const mins = d.getMinutes().toString().padStart(2, '0')
    return {
      dateStr: `${day} ${month} ${yr}`,
      timeStr: `${hours}:${mins}`
    }
  }

  const getDisplayUrl = (url) => {
    try {
      const u = new URL(url)
      return u.hostname + u.pathname
    } catch {
      return url.length > 40 ? url.slice(0, 40) + '…' : url
    }
  }

  const getThumbnail = (url) => {
    try {
      const u = new URL(url)
      const host = u.hostname.toLowerCase()

      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        let vid = u.searchParams.get('v')
        if (!vid && host.includes('youtu.be')) {
          vid = u.pathname.replace('/', '').split('/')[0]
        }
        if (!vid) {
          const match = u.pathname.match(/\/(shorts|embed|v)\/([^/?#]+)/)
          if (match) vid = match[2]
        }
        if (vid) return `https://img.youtube.com/vi/${vid}/hqdefault.jpg`
      }

      if (host.includes('instagram.com') || host.includes('instagr.am')) {
        const match = url.match(/\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([^/?#'"\s]+)/)
        if (match && match[1]) {
          const shortcode = match[1]
          return `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`
        }
      }
    } catch { /* ignore */ }
    return null
  }

  // Fetch Link Previews (thumbnail + title) via /api/thumbnail
  useEffect(() => {
    links.forEach(async (link) => {
      if (previews[link.id] || loadingPreviews[link.id]) return

      setLoadingPreviews(prev => ({ ...prev, [link.id]: true }))
      const syncThumb = getThumbnail(link.url)

      try {
        const res = await fetch(`/api/thumbnail?url=${encodeURIComponent(link.url)}`)
        if (res.ok) {
          const data = await res.json()
          setPreviews(prev => ({
            ...prev,
            [link.id]: {
              thumbnail: data.thumbnail || syncThumb,
              title: data.title || getDisplayUrl(link.url)
            }
          }))
          return
        }
      } catch (err) { /* fallback below */ }

      setPreviews(prev => ({
        ...prev,
        [link.id]: {
          thumbnail: syncThumb,
          title: getDisplayUrl(link.url)
        }
      }))
    })
  }, [links])

  // Sync filtered links, filter status, and previews to parent Dashboard for Export feature
  useEffect(() => {
    if (onFilteredChange) {
      onFilteredChange(filtered, hasActiveFilters, previews)
    }
  }, [filtered, hasActiveFilters, previews, onFilteredChange])

  return (
    <div className="flex flex-col gap-4">
      {/* ── Collapsible Filter Bar ── */}
      <div className="bg-white border border-gray-200 rounded-2xl relative z-30 shadow-sm transition-all">
        {/* Compact Toggle Header */}
        <div
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50/80 transition select-none rounded-2xl"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">🔍</span>
            <span className="text-xs font-bold text-gray-700">Filter & Sort</span>
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
                Active Filter
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleReset(); }}
                className="text-[11px] text-red-500 hover:text-red-600 font-bold px-2 py-0.5 rounded-md hover:bg-red-50 transition cursor-pointer"
              >
                Clear
              </button>
            )}
            <span className="text-[11px] text-gray-400 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full">
              {filtered.length} / {links.length} links
            </span>
            <span className="text-xs text-gray-400 font-bold ml-0.5">
              {isFilterOpen ? '▲' : '▼'}
            </span>
          </div>
        </div>

        {/* Collapsible Filter Form Panel */}
        {isFilterOpen && (
          <div className="p-3.5 pt-2 border-t border-gray-100 flex flex-col gap-3 bg-gray-50/40 rounded-b-2xl">
            {/* Row 1: Multi-select Tags & Platforms & Sort Order */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2.5">
              {/* Multi-Select Tag Filter */}
              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label htmlFor="filter-tag-btn" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  🏷️ Tags ({pendingTags.length > 0 ? pendingTags.length : 'All'})
                </label>
                <MultiSelectDropdown
                  id="filter-tag-btn"
                  options={availableTags}
                  selected={pendingTags}
                  onChange={setPendingTags}
                  placeholder="All Tags"
                />
              </div>

              {/* Multi-Select Platform Filter */}
              <div className="flex flex-col gap-1 flex-1 min-w-[130px]">
                <label htmlFor="filter-platform-btn" className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  📱 Platforms ({pendingPlatforms.length > 0 ? pendingPlatforms.length : 'All'})
                </label>
                <MultiSelectDropdown
                  id="filter-platform-btn"
                  options={availablePlatforms}
                  selected={pendingPlatforms}
                  onChange={setPendingPlatforms}
                  placeholder="All Platforms"
                />
              </div>

              {/* Sort Order Button */}
              <div className="flex flex-col gap-1 min-w-[100px] flex-1 sm:flex-initial">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                  ↕️ Order
                </span>
                <button
                  id="sort-date-btn"
                  type="button"
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                  title="Toggle sort direction"
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 text-gray-700 hover:bg-gray-100 transition cursor-pointer flex items-center justify-center gap-1 font-semibold shadow-sm h-[34px]"
                >
                  Date {sortDir === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            {/* Row 2: Date & Time Range Picker Popover + Search & Reset Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-gray-100">
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap">
                Start and ending time
              </span>

              <DateTimeRangePickerPopover
                fromDate={pendingFromDate}
                fromTime={pendingFromTime}
                toDate={pendingToDate}
                toTime={pendingToTime}
                onFromDateChange={setPendingFromDate}
                onFromTimeChange={setPendingFromTime}
                onToDateChange={setPendingToDate}
                onToTimeChange={setPendingToTime}
                onPresetSelect={(p) => {
                  setPendingPreset(p)
                  const dates = getPresetDates(p)
                  setPendingFromDate(dates.fromDate)
                  setPendingFromTime(dates.fromTime)
                  setPendingToDate(dates.toDate)
                  setPendingToTime(dates.toTime)
                }}
                onReset={() => {
                  setPendingFromDate('')
                  setPendingFromTime('00:00')
                  setPendingToDate('')
                  setPendingToTime('23:59')
                }}
              />

              {/* Search & Reset Buttons */}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={handleApply}
                  className="bg-blue-500 hover:bg-blue-600 active:scale-95 text-white font-bold px-5 py-1.5 rounded-lg shadow-sm text-xs transition flex items-center gap-1.5 cursor-pointer h-[32px]"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-600 font-semibold px-4 py-1.5 rounded-lg text-xs transition cursor-pointer h-[32px]"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Card Grid (Fix 4: grid grid-cols-2 gap-3) ── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 shadow-sm">
          <div className="text-5xl mb-3">📭</div>
          <p className="text-sm font-medium">No links found.</p>
          <p className="text-xs text-gray-300 mt-1">Add your first link in the "Add New Link" tab!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((link) => {
            const isInstagram = (link.platform && link.platform.toLowerCase() === 'instagram') ||
              (link.url && (link.url.includes('instagram.com') || link.url.includes('instagr.am')))
            const isYouTube = (link.platform && link.platform.toLowerCase() === 'youtube') ||
              (link.url && (link.url.includes('youtube.com') || link.url.includes('youtu.be')))

            const syncThumb = getThumbnail(link.url)
            const prevInfo = previews[link.id]

            // Use API-fetched preview thumbnail (Meta Graph / oEmbed) or synchronous fallback
            const thumb = prevInfo?.thumbnail || syncThumb

            let cardTitle = link.title || prevInfo?.title
            if (cardTitle && isInstagram) {
              const matchOn = cardTitle.match(/^(.*?)\s+on\s+Instagram(?:\s*:\s*"?|\s*:?\s*)?(.*)$/i)
              if (matchOn) {
                const author = matchOn[1] ? matchOn[1].trim() : ''
                let caption = matchOn[2] ? matchOn[2].trim() : ''

                if (caption.startsWith('"')) caption = caption.slice(1).trim()
                if (caption.endsWith('..."')) caption = caption.slice(0, -1).trim()
                else if (caption.endsWith('"')) caption = caption.slice(0, -1).trim()

                if (caption.length > 0) {
                  cardTitle = caption
                } else if (author.length > 0 && author !== 'Post' && author !== 'Reel') {
                  cardTitle = author
                }
              }

              if (cardTitle.startsWith('"') && cardTitle.endsWith('"')) {
                cardTitle = cardTitle.slice(1, -1).trim()
              }
            }

            if (!cardTitle || cardTitle === '- YouTube' || cardTitle === 'YouTube' || cardTitle === 'Instagram' || cardTitle === 'Instagram Post') {
              if (isYouTube) {
                cardTitle = 'YouTube Video'
              } else if (isInstagram) {
                const itemTag = link.tag ? link.tag.split(',')[0].trim() : ''
                cardTitle = itemTag || 'Instagram Post'
              } else {
                cardTitle = getDisplayUrl(link.url)
              }
            }

            const isLoading = !prevInfo && loadingPreviews[link.id]

            return (
              <div
                key={link.id}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col group hover:shadow-lg transition-all"
              >
                {/* 1. Top: Thumbnail (160px) */}
                <div className="relative w-full h-[160px] bg-gray-100 overflow-hidden">
                  {isLoading ? (
                    <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                      <span className="text-2xl opacity-40">🖼️</span>
                    </div>
                  ) : thumb && thumb !== 'FAILED' ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                      <img
                        src={thumb}
                        alt=""
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const match = link.url.match(/\/(?:p|reel|reels|tv|share\/p|share\/reel)\/([^/?#'"\s]+)/)
                          const shortcode = match ? match[1] : null
                          if (shortcode && !e.target.src.includes('instagr.am')) {
                            e.target.src = `https://images.weserv.nl/?url=https://instagr.am/p/${shortcode}/media/?size=m`
                          } else if (shortcode && !e.target.src.includes('size=l')) {
                            e.target.src = `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`
                          } else {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'flex';
                            }
                          }
                        }}
                      />
                      {/* Fallback Instagram Gradient Banner if image fails to load */}
                      {isInstagram ? (
                        <span
                          className="w-full h-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex flex-col items-center justify-center gap-1 text-white p-3 text-center absolute inset-0 hidden"
                          style={{ display: 'none' }}
                        >
                          <span className="text-3xl drop-shadow">📸</span>
                          <span className="text-[11px] font-extrabold tracking-wide uppercase">Instagram Post</span>
                          {link.tag && (
                            <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-semibold max-w-full truncate">
                              {link.tag.split(',')[0]}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span
                          className="w-full h-full bg-gray-100 items-center justify-center text-4xl hidden text-gray-400 absolute inset-0"
                          style={{ display: 'none' }}
                        >
                          🔗
                        </span>
                      )}
                    </a>
                  ) : isInstagram ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="w-full h-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex flex-col items-center justify-center gap-1 text-white hover:opacity-95 transition p-3 text-center">
                      <span className="text-3xl drop-shadow">📸</span>
                      <span className="text-[11px] font-extrabold tracking-wide uppercase">Instagram Post</span>
                      {link.tag && (
                        <span className="text-[10px] bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full font-semibold max-w-full truncate">
                          {link.tag.split(',')[0]}
                        </span>
                      )}
                    </a>
                  ) : (
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400 hover:bg-gray-200 transition"
                    >
                      🔗
                    </a>
                  )}
                </div>

                {/* 2. Middle Section: Title (top) -> Tags (light bg) -> Domain & 3-Dots Menu */}
                <div className="p-3 bg-white flex flex-col gap-2.5 flex-1 justify-between min-w-0">
                  {/* Title (max 2 lines) */}
                  {isLoading ? (
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-4/5 my-0.5" />
                  ) : (
                    <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug">
                      {cardTitle}
                    </h4>
                  )}

                  {/* Tags (light bg container) */}
                  <div className="flex flex-wrap items-center gap-1 min-w-0 bg-slate-50/80 p-1.5 rounded-xl border border-gray-100/80">
                    {(() => {
                      const itemTags = link.tag ? link.tag.split(',').map(t => t.trim()).filter(Boolean) : []
                      if (itemTags.length === 0) {
                        return (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                            🏷️ No tag
                          </span>
                        )
                      }
                      return itemTags.map(t => (
                        <span key={t} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/80 max-w-full truncate">
                          <span className="text-[9px]">🏷️</span>
                          <span className="truncate">{t}</span>
                        </span>
                      ))
                    })()}
                  </div>

                  {/* URL Domain link + 3-Dots Action Menu Button */}
                  <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-gray-100 relative">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.url}
                      className="text-[10px] text-gray-400 hover:text-indigo-600 font-medium truncate flex items-center gap-1 min-w-0"
                    >
                      <span>🌐</span> {getDisplayUrl(link.url)}
                    </a>

                    {/* 3-Dots Menu Button */}
                    <div className="relative flex-shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setActiveMenuId(activeMenuId === link.id ? null : link.id)
                        }}
                        className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer"
                        title="More actions"
                        aria-label="More actions"
                      >
                        <ThreeDotsIcon />
                      </button>

                      {/* 3-Dots Action Popover Menu (Copy, Share, Edit, Delete) */}
                      {activeMenuId === link.id && (
                        <div className="absolute right-0 bottom-full mb-1 z-50 w-36 bg-white border border-gray-200 rounded-xl shadow-xl py-1 text-xs divide-y divide-gray-100 animate-fadeIn">
                          {/* 1. Copy Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCopy(link.id, link.url)
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 font-medium flex items-center gap-2 transition cursor-pointer"
                          >
                            <span>📋</span>
                            <span>{copiedId === link.id ? 'Copied!' : 'Copy Link'}</span>
                          </button>

                          {/* 2. Share Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNativeShare(link)
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium flex items-center gap-2 transition cursor-pointer"
                          >
                            <span>📤</span>
                            <span>Share Link</span>
                          </button>

                          {/* 3. Edit Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingLink(link)
                              setActiveMenuId(null)
                            }}
                            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium flex items-center gap-2 transition cursor-pointer"
                          >
                            <span>✏️</span>
                            <span>Edit Link</span>
                          </button>

                          {/* 4. Delete Link */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(null)
                              handleDelete(link.id)
                            }}
                            className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 font-medium flex items-center gap-2 transition cursor-pointer"
                          >
                            <span>🗑️</span>
                            <span>Delete Link</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Footer Section: Light Red BG for Platform & Date (Top) / Time (Below) */}
                <div className="bg-red-50/70 border-t border-red-100/80 p-2 px-2.5 flex items-center justify-between gap-1 mt-auto min-w-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border shadow-2xs leading-tight flex-shrink-0 ${platformColor(link.platform)}`}>
                    {link.platform || 'Other'}
                  </span>

                  {/* Date (Top) and Time (Below) without icon */}
                  {(() => {
                    const { dateStr, timeStr } = formatDateParts(link.created_at)
                    return (
                      <div className="flex flex-col items-end text-right font-mono leading-tight flex-shrink-0 ml-auto">
                        <span className="text-[10px] text-gray-600 font-semibold">{dateStr}</span>
                        <span className="text-[9px] text-gray-400 font-medium">{timeStr}</span>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )
          })}
        </div>
      )}

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

// ─── Export Data Helpers ──────────────────────────────────────────────────────
function exportToCSV(data, previews = {}) {
  const headers = ['#', 'Title', 'URL', 'Tags', 'Platform', 'Created At']
  const rows = data.map((item, index) => {
    const itemTitle = previews[item.id]?.title || getDisplayUrl(item.url)
    return [
      index + 1,
      `"${(itemTitle || '').replace(/"/g, '""')}"`,
      `"${(item.url || '').replace(/"/g, '""')}"`,
      `"${(item.tag || '').replace(/"/g, '""')}"`,
      `"${(item.platform || '').replace(/"/g, '""')}"`,
      `"${new Date(item.created_at).toLocaleString()}"`
    ]
  })
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  downloadFile(csvContent, `MARK_links_${getTodayDateStr()}.csv`, 'text/csv;charset=utf-8;')
}

function exportToJSON(data, previews = {}) {
  const formatted = data.map((item) => ({
    title: previews[item.id]?.title || getDisplayUrl(item.url),
    url: item.url,
    tags: item.tag,
    platform: item.platform,
    created_at: item.created_at
  }))
  const jsonContent = JSON.stringify(formatted, null, 2)
  downloadFile(jsonContent, `MARK_links_${getTodayDateStr()}.json`, 'application/json;charset=utf-8;')
}

function getTodayDateStr() {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// ─── Export Modal ─────────────────────────────────────────────────────────────
function ExportModal({ data, hasFilters, previews = {}, onClose }) {
  const [format, setFormat] = useState('csv')

  function handleDownload() {
    if (format === 'csv') {
      exportToCSV(data, previews)
    } else {
      exportToJSON(data, previews)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📥</span>
            <h3 className="text-base font-bold text-gray-800">Export Links Data</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Count & Filter Info */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="block text-xs text-indigo-900 font-bold">
              {data.length} {data.length === 1 ? 'link' : 'links'} ready to export
            </span>
            <span className="text-[11px] text-indigo-600 font-medium">
              {hasFilters ? '⚡ Filtered View (Custom selection)' : '🌐 All Links (Full Library)'}
            </span>
          </div>
          <span className="text-2xl">📦</span>
        </div>

        {/* Format Selection Options */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Choose Export Format
          </label>

          <div className="grid grid-cols-2 gap-2.5">
            {/* Option 1: CSV */}
            <div
              onClick={() => setFormat('csv')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${format === 'csv'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">📊</span>
                {format === 'csv' && <span className="text-xs text-indigo-600 font-bold">✓</span>}
              </div>
              <span className="text-xs font-bold">CSV (.csv)</span>
              <span className="text-[10px] text-gray-400">Excel / Google Sheets</span>
            </div>

            {/* Option 2: JSON */}
            <div
              onClick={() => setFormat('json')}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex flex-col gap-1 ${format === 'json'
                  ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900'
                  : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">📜</span>
                {format === 'json' && <span className="text-xs text-indigo-600 font-bold">✓</span>}
              </div>
              <span className="text-xs font-bold">JSON (.json)</span>
              <span className="text-[10px] text-gray-400">Structured Data</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>📥</span>
            <span>Download File</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, links, deleteLink, updateLink, signOut } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState('add')

  // Filtered links tracking from LibraryTab for Export feature
  const [libraryState, setLibraryState] = useState({ data: [], hasFilters: false, previews: {} })
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)

  // Sync default links if libraryState is empty
  const exportData = libraryState.data.length > 0 || libraryState.hasFilters ? libraryState.data : links

  // Extract sharedUrl from query params
  const sharedUrl = (() => {
    const sp = searchParams
    const fromReact = sp.get('url') || sp.get('text') || sp.get('link') || sp.get('href') || sp.get('q') || ''
    if (fromReact) return fromReact

    try {
      const params = new URLSearchParams(window.location.search)
      const fromSearch = params.get('url') || params.get('text') || params.get('link') || params.get('href') || params.get('q') || ''
      if (fromSearch) return fromSearch
    } catch { /* ignore */ }

    try {
      const parsed = new URL(window.location.href)
      return parsed.searchParams.get('url') || parsed.searchParams.get('text') || parsed.searchParams.get('link') || parsed.searchParams.get('href') || parsed.searchParams.get('q') || ''
    } catch { return '' }
  })()

  useEffect(() => { if (sharedUrl) setActiveTab('add') }, [sharedUrl])

  async function handleLogout() {
    await signOut()
    navigate('/login')
  }

  // ⚡ FIX 1: Speed (Popup Mode Direct Render for Android Share Intent)
  if (sharedUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-4 sm:p-6 border border-gray-100">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h2 className="text-base font-bold text-gray-800">Quick Save Link</h2>
            </div>
            <button
              onClick={() => navigate('/dashboard', { replace: true })}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition"
              title="Close"
            >
              ✕
            </button>
          </div>
          <AddLinkTab initialUrl={sharedUrl} links={links} />
        </div>
      </div>
    )
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
            {activeTab === 'library' && (
              <button
                id="export-btn"
                onClick={() => setIsExportModalOpen(true)}
                className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1 rounded-lg transition font-bold cursor-pointer shadow-2xs"
                title="Export links data"
              >
                <span>📥</span>
                <span>Export</span>
              </button>
            )}
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

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-24">
        {activeTab === 'add' && <AddLinkTab initialUrl={sharedUrl} links={links} />}
        {activeTab === 'library' && (
          <LibraryTab
            links={links}
            onDelete={deleteLink}
            onUpdate={updateLink}
            onFilteredChange={(data, hasFilters, previews) => setLibraryState({ data, hasFilters, previews })}
          />
        )}
      </main>

      {/* ── Export Modal ── */}
      {isExportModalOpen && (
        <ExportModal
          data={exportData}
          hasFilters={libraryState.hasFilters}
          previews={libraryState.previews}
          onClose={() => setIsExportModalOpen(false)}
        />
      )}

      {/* ── Fixed Bottom Navigation Bar (Android App Style: 50/50 Split) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur border-t border-gray-200 shadow-lg">
        <div className="max-w-3xl mx-auto grid grid-cols-2 h-14">
          {tabs.map(tab => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`col-span-1 flex items-center justify-center gap-2 h-full text-sm font-semibold transition-all select-none border-t-2 cursor-pointer
                ${activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/80 font-bold'
                  : 'border-transparent text-gray-500 hover:text-indigo-600 hover:bg-gray-50/50'}`}
            >
              <span className="text-base">{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'library' && links.length > 0 && (
                <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-2xs">
                  {links.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
