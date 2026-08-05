import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Notes from '../components/Notes'

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

// ─── Platform SVG Icons ──────────────────────────────────────────────────────
const GlobeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
)
const YouTubeTileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="#FF0000" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
)
const InstagramTileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="#E4405F" viewBox="0 0 24 24">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)
const LinkedInTileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="#0A66C2" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
  </svg>
)
const XTwitterTileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="#000000" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
)
const MoreTileIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"/>
  </svg>
)
const FacebookTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="#1877F2" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
)
const ThreadsTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#000000"/>
    <path fill="#FFFFFF" d="M12.186 19.5h-.007c-2.985-.018-5.305-1.01-6.898-2.948-1.485-1.807-2.155-4.357-1.992-7.579.23-4.552 3.45-8.203 7.833-8.879 4.408-.68 8.588 1.982 10.019 6.378.214.658-.147 1.364-.805 1.578-.658.213-1.364-.147-1.578-.805-1.095-3.364-4.292-5.4-7.663-4.88-3.37.52-5.842 3.325-6.017 6.823-.127 2.508.39 4.482 1.534 5.868 1.202 1.46 2.983 2.208 5.294 2.223 2.94.018 5.113-1.117 6.458-3.371.958-1.606 1.233-3.733 1.233-5.033 0-.383-.025-.783-.075-1.183-.092-.683-.642-1.217-1.333-1.217-.675 0-1.233.517-1.333 1.192-.075.508-.217 1.042-.433 1.583-.633 1.567-2.042 2.35-3.725 2.35-1.408 0-2.525-.567-3.142-1.6-.567-.95-.633-2.15-.183-3.208.483-1.133 1.475-1.85 2.717-1.967 1.4-.133 2.6.367 3.292 1.367.367.525.567 1.175.567 1.875 0 .692-.2 1.35-.567 1.875-.692 1-1.892 1.5-3.292 1.367-1.242-.117-2.234-.834-2.717-1.967-.45-1.058-.384-2.258.183-3.208.617-1.033 1.734-1.6 3.142-1.6 1.683 0 3.092.783 3.725 2.35.216.541.358 1.075.433 1.583.1 1.35.034 3.425-.925 5.033-1.65 2.775-4.325 4.15-7.95 4.125z"/>
  </svg>
)
const RednoteTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#FF2442"/>
    <text x="12" y="15.5" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="system-ui, -apple-system, sans-serif" textAnchor="middle">小红书</text>
  </svg>
)
const SnapchatTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="5" fill="#FFFC00"/>
    <path d="M12 4.5c-2.4 0-4.1 1.7-4.1 3.9 0 .8.1 1.6.4 2.2-.5.2-1.1.5-1.5.5-.3 0-.5-.1-.7-.3-.2-.2-.2-.5-.1-.8.2-.5.1-1.1-.3-1.5-.4-.4-1-.5-1.5-.2-.5.3-.8.9-.7 1.5.2 1.3 1.2 2.3 2.5 2.5-.1.4-.2.8-.2 1.2 0 1.5.9 2.8 2.2 3.4-.4.4-.9.9-1.6.9-.5 0-1-.1-1.4-.4-.3-.2-.7-.2-1 0-.3.2-.4.6-.2.9.4.7 1.1 1.2 1.9 1.4.3.1.6.1.9.1 1.3 0 2.5-.6 3.4-1.6.9 1 2.1 1.6 3.4 1.6.3 0 .6 0 .9-.1.8-.2 1.5-.7 1.9-1.4.2-.3.1-.7-.2-.9-.3-.2-.7-.2-1 0-.4.3-.9.4-1.4.4-.7 0-1.2-.5-1.6-.9 1.3-.6 2.2-1.9 2.2-3.4 0-.4-.1-.8-.2-1.2 1.3-.2 2.3-1.2 2.5-2.5.1-.6-.2-1.2-.7-1.5-.5-.3-1.1-.2-1.5.2-.4.4-.5 1-.3 1.5.1.3.1.6-.1.8-.2.2-.4.3-.7.3-.4 0-1-.3-1.5-.5.3-.6.4-1.4.4-2.2 0-2.2-1.7-3.9-4.1-3.9z" fill="#FFFFFF" stroke="#000000" strokeWidth="1.2" strokeLinejoin="round"/>
  </svg>
)
const TelegramTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M5.463 11.849c4.986-2.172 8.312-3.606 9.977-4.301 4.744-1.972 5.731-2.315 6.373-2.326.141-.003.456.032.66.198.172.14.22.329.243.461.023.133.051.435.029.672-.25 2.63-1.332 9.011-1.884 11.962-.234 1.25-.694 1.669-1.139 1.71-.968.089-1.703-.639-2.641-1.253-1.467-.961-2.296-1.558-3.719-2.496-1.644-1.085-.578-1.681.359-2.654.245-.255 4.5-4.125 4.583-4.48.01-.044.02-.21-.077-.296-.098-.086-.242-.057-.346-.033-.148.034-2.508 1.594-7.078 4.68-.669.46-1.275.687-1.817.675-.598-.013-1.748-.337-2.605-.616-1.051-.341-1.887-.522-1.814-1.102.038-.302.454-.613 1.248-.933z" fill="#FFFFFF"/>
  </svg>
)
const GitHubTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
  </svg>
)
const RedditTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="#FF4500" viewBox="0 0 24 24">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.188-.491.96 0 1.743.784 1.743 1.743 0 .548-.258 1.033-.655 1.353.03.203.045.41.045.618 0 3.154-3.662 5.718-8.176 5.718-4.513 0-8.175-2.564-8.175-5.718 0-.204.015-.41.043-.611A1.734 1.734 0 0 1 3.9 11.99c0-.96.783-1.744 1.744-1.744.458 0 .88.182 1.187.49 1.194-.855 2.846-1.417 4.67-1.487l.951-4.463 3.3.693c.038.648.57 1.165 1.258 1.165z"/>
  </svg>
)
const DiscordTileIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="#5865F2" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.128c-.598.347-1.22.645-1.873.893a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028z"/>
  </svg>
)

function getPlatformTileIcon(p, className = "w-4 h-4") {
  const name = (p || '').toLowerCase()
  if (name.includes('youtube') || name === 'yt') return <YouTubeTileIcon className={className} />
  if (name.includes('instagram') || name === 'insta') return <InstagramTileIcon className={className} />
  if (name.includes('linkedin')) return <LinkedInTileIcon className={className} />
  if (name.includes('twitter') || name === 'x') return <XTwitterTileIcon className={className} />
  if (name.includes('facebook') || name === 'fb') return <FacebookTileIcon className={className} />
  if (name.includes('threads')) return <ThreadsTileIcon className={className} />
  if (name.includes('rednote') || name.includes('xiaohongshu')) return <RednoteTileIcon className={className} />
  if (name.includes('snapchat') || name === 'snap') return <SnapchatTileIcon className={className} />
  if (name.includes('telegram') || name === 'tg') return <TelegramTileIcon className={className} />
  if (name.includes('github')) return <GitHubTileIcon className={className} />
  if (name.includes('reddit')) return <RedditTileIcon className={className} />
  if (name.includes('discord')) return <DiscordTileIcon className={className} />
  return <GlobeIcon className={`${className} text-purple-600`} />
}

// ─── Platform color palette ───────────────────────────────────────────────────
const PLATFORM_COLORS = {
  youtube: 'bg-red-50 text-red-600 border-red-200',
  yt: 'bg-red-50 text-red-600 border-red-200',
  instagram: 'bg-pink-50 text-pink-600 border-pink-200',
  insta: 'bg-pink-50 text-pink-600 border-pink-200',
  threads: 'bg-slate-100 text-slate-700 border-slate-200',
  facebook: 'bg-blue-50 text-blue-600 border-blue-200',
  'twitter/x': 'bg-sky-50 text-sky-600 border-sky-200',
  twitter: 'bg-sky-50 text-sky-600 border-sky-200',
  x: 'bg-sky-50 text-sky-600 border-sky-200',
  linkedin: 'bg-blue-50 text-blue-600 border-blue-200',
  github: 'bg-slate-100 text-slate-700 border-slate-200',
  reddit: 'bg-orange-50 text-orange-600 border-orange-200',
  discord: 'bg-violet-50 text-violet-600 border-violet-200',
  default: 'bg-indigo-50 text-indigo-600 border-indigo-200',
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

// ─── Platform Autocomplete Input (Interactive Pill Chips + Custom Typeable) ──
function PlatformInput({ id = 'link-platform', value = '', onChange, suggestions = DEFAULT_PLATFORMS, className = '' }) {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const ref = useRef(null)

  const filtered = useMemo(() => {
    if (!inputValue.trim()) return suggestions
    const q = inputValue.trim().toLowerCase()
    return suggestions.filter((s) => s.toLowerCase().includes(q))
  }, [suggestions, inputValue])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [])

  function selectPlatform(p) {
    const trimmed = (p || '').trim()
    onChange(trimmed)
    setInputValue('')
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (inputValue.trim()) {
        selectPlatform(inputValue.trim())
      }
    }
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 min-h-[38px] w-full border border-slate-200/80 rounded-xl px-3 py-1 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition shadow-2xs">
        {/* Selected Platform Badge */}
        {value ? (
          <span className="bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-2xs">
            {getPlatformTileIcon(value, "w-3.5 h-3.5")}
            <span>{value}</span>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-purple-400 hover:text-purple-700 font-bold ml-0.5 text-xs cursor-pointer"
            >
              ×
            </button>
          </span>
        ) : null}

        {/* Input */}
        <input
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            setOpen(true)
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setOpen(true)}
          placeholder={value ? 'Type to change platform…' : 'Add or select platform…'}
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 min-w-[100px] py-1 font-medium"
          autoComplete="off"
        />

        {/* Chevron arrow */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-md transition cursor-pointer"
        >
          <svg className={`w-3.5 h-3.5 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Autocomplete Dropdown List */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl max-h-44 overflow-y-auto p-1.5 space-y-0.5 animate-fadeIn">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => selectPlatform(s)}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                (value || '').toLowerCase() === s.toLowerCase()
                  ? 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                {getPlatformTileIcon(s, "w-3.5 h-3.5")}
                <span>{s}</span>
              </div>
              {(value || '').toLowerCase() === s.toLowerCase() && <span className="text-purple-600 font-bold">✓</span>}
            </button>
          ))}

          {/* If typing something custom not in suggestions */}
          {inputValue.trim() && !suggestions.some(s => s.toLowerCase() === inputValue.trim().toLowerCase()) && (
            <button
              type="button"
              onClick={() => selectPlatform(inputValue.trim())}
              className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition flex items-center justify-between cursor-pointer border border-purple-200"
            >
              <span>➕ Save platform "{inputValue.trim()}"</span>
              <span className="text-[10px] text-purple-500 font-semibold">Press Enter</span>
            </button>
          )}
        </div>
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
    <div ref={ref} className="relative">
      <div className="flex flex-wrap items-center gap-2 min-h-[46px] w-full border border-slate-200/80 rounded-2xl px-3.5 py-2 bg-slate-50/70 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition shadow-2xs">
        {/* Rendered Chips matching Screenshot 1 */}
        {currentTags.map((t) => (
          <span
            key={t}
            className="bg-[#f3f0ff] border border-[#ede9fe] text-[#6d28d9] text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs"
          >
            <span>{t}</span>
            <button
              type="button"
              onClick={() => removeTag(t)}
              className="text-purple-400 hover:text-purple-700 font-bold leading-none text-sm cursor-pointer"
            >
              ×
            </button>
          </span>
        ))}

        {/* Add Tag Chip Button */}
        <button
          type="button"
          onClick={() => {
            if (inputValue.trim()) addTag(inputValue)
            else setOpen(!open)
          }}
          className="bg-purple-50/60 hover:bg-purple-100/60 border border-dashed border-purple-200 text-purple-600 text-xs font-semibold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition"
        >
          <span>+ Add tag</span>
        </button>

        {/* Typeable Input */}
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
            if (inputValue.trim()) addTag(inputValue)
          }}
          onFocus={() => setOpen(true)}
          placeholder={currentTags.length === 0 ? placeholder : ''}
          className="bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none flex-1 min-w-[80px] py-1 font-medium"
          autoComplete="off"
        />

        {/* Chevron arrow */}
        <button
          type="button"
          tabIndex={-1}
          onMouseDown={handleChevronClick}
          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition"
        >
          <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
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

  const inputCls = 'input-field'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-scaleIn border border-slate-100">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 flex items-center justify-between rounded-t-3xl">
          <div>
            <h2 id="edit-modal-title" className="text-white font-bold text-base flex items-center gap-2">
              <PencilIcon /> Edit Link
            </h2>
            <p className="text-indigo-200 text-xs mt-0.5">Update tag or platform for this link</p>
          </div>
          <button
            onClick={onClose}
            className="text-indigo-200 hover:text-white transition p-1.5 rounded-xl hover:bg-white/15"
            aria-label="Close modal"
          >
            <XIcon />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
          {/* URL — editable */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-url" className="text-sm font-semibold text-slate-600">🌐 URL</label>
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
            <label htmlFor="edit-tag" className="text-sm font-semibold text-slate-600">🏷️ Tag</label>
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
            <label htmlFor="edit-platform" className="text-sm font-semibold text-slate-600">📱 Platform</label>
            <PlatformInput
              id="edit-platform"
              value={platform}
              onChange={setPlatform}
              className={inputCls}
            />
          </div>

          {/* Error */}
          {error && (
            <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-start gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2.5 text-sm"
            >
              {loading ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
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

// ─── Library Insights Stat Cards (Screenshot 1 Exact Replica) ────────────────
function StatCards({ links = [] }) {
  const total = links.length

  const platformCounts = useMemo(() => {
    const counts = {}
    links.forEach((l) => {
      const p = l.platform || 'Website'
      counts[p] = (counts[p] || 0) + 1
    })
    return counts
  }, [links])

  const entries = Object.entries(platformCounts).sort((a, b) => b[1] - a[1])
  const topFour = entries.slice(0, 4)
  const remainingCount = entries.length > 4 ? entries.length - 4 : 0

  function getPlatformIcon(p) {
    const name = p.toLowerCase()
    if (name.includes('youtube') || name === 'yt') return <YouTubeTileIcon className="w-4 h-4" />
    if (name.includes('instagram') || name === 'insta') return <InstagramTileIcon className="w-4 h-4" />
    if (name.includes('linkedin')) return <LinkedInTileIcon className="w-4 h-4" />
    if (name.includes('twitter') || name === 'x') return <XTwitterTileIcon className="w-4 h-4" />
    return <GlobeIcon className="w-4 h-4 text-purple-600" />
  }

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg font-bold">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 text-base">Library Insights</h3>
        </div>
        <select className="bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer">
          <option>All time</option>
          <option>This month</option>
          <option>This week</option>
        </select>
      </div>

      {/* Total Links Card + Sparkline Graph */}
      <div className="bg-gradient-to-r from-emerald-50/50 via-emerald-50/20 to-slate-50/40 border border-emerald-100/80 rounded-2xl p-4 flex items-center justify-between relative overflow-hidden">
        <div>
          <span className="text-xs font-semibold text-slate-500">Total Links</span>
          <div className="text-3xl font-black text-slate-900 mt-1 tracking-tight">{total}</div>
        </div>
        <div className="w-36 h-10 flex items-center justify-end">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 140 40">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0 32 Q 20 30 35 26 T 70 28 T 105 16 T 135 8 L 135 40 L 0 40 Z"
              fill="url(#chartGrad)"
            />
            <path
              d="M 0 32 Q 20 30 35 26 T 70 28 T 105 16 T 135 8"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="135" cy="8" r="3.5" fill="#10b981" />
          </svg>
        </div>
      </div>

      {/* By Platform Badges */}
      <div>
        <span className="text-xs font-bold text-slate-500 block mb-2.5">By Platform</span>
        <div className="flex flex-wrap items-center gap-2">
          {topFour.length === 0 ? (
            <span className="text-xs text-slate-400">No link statistics available yet.</span>
          ) : (
            topFour.map(([platform, count]) => (
              <span key={platform} className="bg-slate-50 border border-slate-200/80 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
                <span>{getPlatformIcon(platform)}</span>
                <span>{platform}</span>
                <span className="text-slate-900 font-bold ml-0.5">{count}</span>
              </span>
            ))
          )}
          {remainingCount > 0 && (
            <span className="text-emerald-700 font-bold text-xs cursor-pointer px-1">
              +{remainingCount} more
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Add Link Form (Tab 1) ────────────────────────────────────────────────────
function AddLinkTab({ initialUrl = '', links = [] }) {
  const { addLink, tags } = useAuth()
  const [url, setUrl] = useState(initialUrl)
  const [tag, setTag] = useState('')
  const [platform, setPlatform] = useState(() => detectPlatform(initialUrl))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showCustomPlatform, setShowCustomPlatform] = useState(false)
  const tagInputRef = useRef(null)

  const safeLinks = links || []

  // Dynamic platform suggestions: defaults + any user-saved custom platforms
  const platformSuggestions = useMemo(() => {
    const defaults = ['YouTube', 'Instagram', 'Threads', 'Facebook', 'Twitter/X', 'LinkedIn', 'GitHub', 'Reddit', 'Discord']
    const existing = [...new Set(safeLinks.map(l => l.platform).filter(Boolean))]
    return [...new Set([...defaults, ...existing])]
  }, [safeLinks])

  // Dynamically compute user's top 10 most frequently saved platforms from analytics history
  const topPlatforms = useMemo(() => {
    const defaultList = ['Website', 'YouTube', 'Instagram', 'LinkedIn', 'Twitter/X', 'Telegram', 'Snapchat', 'Threads', 'Rednote', 'Facebook']
    const counts = {}
    safeLinks.forEach(l => {
      if (l.platform) {
        const p = l.platform.trim()
        if (p) counts[p] = (counts[p] || 0) + 1
      }
    })
    const sortedUserPlatforms = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    const combined = [...new Set([...sortedUserPlatforms, ...defaultList])]
    return combined.slice(0, 10)
  }, [safeLinks])

  // Build 10 tiles list (Exact 10 top dynamic shortcut platforms)
  const platformTiles = useMemo(() => {
    return topPlatforms.map(p => ({
      id: p,
      label: p === 'Twitter/X' ? 'X (Twitter)' : p,
      icon: getPlatformTileIcon(p, "w-4 h-4")
    }))
  }, [topPlatforms])

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

  const inputCls = 'input-field'

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText()
      if (text && text.trim()) {
        const trimmed = text.trim()
        setUrl(trimmed)
        const d = detectPlatform(trimmed)
        if (d) setPlatform(d)
      }
    } catch { /* clip fail */ }
  }

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
                onSelectComplete={() => {}}
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
    <div className="max-w-2xl mx-auto">
      {/* Top Card: Add New Link ONLY (Tight padding to prevent scrolling to Save Link) */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4.5 sm:p-5 shadow-sm space-y-3.5">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-lg font-bold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h2 className="text-slate-900 font-bold text-base tracking-tight">Add New Link</h2>
              <p className="text-slate-400 text-[11px]">Save, organize &amp; find your links instantly.</p>
            </div>
          </div>

          {/* Paste from clipboard button */}
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold text-xs px-3 py-1.5 rounded-xl border border-purple-100 flex items-center gap-1.5 transition cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>Paste from clipboard</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* URL */}
          <div className="space-y-1">
            <label htmlFor="link-url" className="block text-[11px] font-bold text-slate-900 tracking-wide uppercase">
              URL
            </label>
            <div className="relative flex items-center bg-slate-50/70 border border-slate-200/80 rounded-xl px-3.5 py-2.5 focus-within:bg-white focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-100 transition shadow-2xs">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                id="link-url"
                type="url"
                value={url}
                onChange={(e) => {
                  const val = e.target.value
                  setUrl(val)
                  const d = detectPlatform(val)
                  if (d) setPlatform(d)
                }}
                placeholder="https://example.com/article"
                className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                required
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
              <span>We'll fetch the title and details automatically.</span>
              <span>{url.length} / 2000</span>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-1">
            <label htmlFor="link-tag" className="block text-[11px] font-bold text-slate-900 tracking-wide uppercase">
              Tags
            </label>
            <TagInput
              id="link-tag"
              value={tag}
              onChange={setTag}
              suggestions={tags}
            />
            <span className="block text-[10px] text-slate-400 pt-0.5">
              Add or select tags to keep your links organized.
            </span>
          </div>

          {/* Platform — 10 Top Shortcut Tiles + Fixed Tag-like Platform Autocomplete Input */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-slate-900 tracking-wide uppercase">
              Platform
            </label>

            {/* 10 Shortcut Platform Tiles */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
              {platformTiles.map((tile) => {
                const isSelected = (platform || 'Website').toLowerCase() === tile.id.toLowerCase()

                return (
                  <button
                    key={tile.id}
                    type="button"
                    onClick={() => setPlatform(tile.id)}
                    className={`rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-center gap-1 transition-all duration-150 cursor-pointer relative ${
                      isSelected
                        ? 'bg-purple-50/80 border-2 border-purple-600 text-purple-700 font-bold shadow-2xs'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:border-purple-300 shadow-2xs font-medium'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 bg-purple-600 text-white rounded-full flex items-center justify-center text-[8px] font-bold absolute -top-1 -right-1 shadow-2xs">
                        ✓
                      </div>
                    )}
                    <div className={isSelected ? 'text-purple-600' : 'text-slate-600'}>
                      {tile.icon}
                    </div>
                    <span className="text-[10px] sm:text-[11px] truncate max-w-full leading-tight">{tile.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Fixed Tag-like Platform Autocomplete Input below tiles */}
            <div className="pt-0.5">
              <PlatformInput
                id="link-platform"
                value={platform}
                onChange={setPlatform}
                suggestions={platformSuggestions}
              />
            </div>

            <span className="block text-[10px] text-slate-400 pt-0.5">
              We'll suggest the platform automatically when possible.
            </span>
          </div>

          {/* Alerts */}
          {error && (
            <div role="alert" className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-1.5">
              <span>⚠️</span> {error}
            </div>
          )}
          {success && (
            <div role="status" className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 flex items-center gap-1.5">
              <span>✅</span> Link saved to your library!
            </div>
          )}

          {/* Save Link Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl transition shadow-md flex items-center justify-center gap-2 text-base cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving…</>
            ) : (
              <>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                <span>Save Link</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Dedicated Insights Tab Component ──────────────────────────────────────────
function InsightsTab({ links = [], notes = [] }) {
  const [timeFilter, setTimeFilter] = useState('All time')

  // Time-based filtering logic
  const filteredLinks = useMemo(() => {
    if (timeFilter === 'All time') return links
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const yesterdayStart = todayStart - 86400000

    return links.filter(l => {
      const created = new Date(l.created_at || l.updated_at).getTime()
      if (isNaN(created)) return true

      if (timeFilter === 'Today') {
        return created >= todayStart
      } else if (timeFilter === 'Yesterday') {
        return created >= yesterdayStart && created < todayStart
      } else if (timeFilter === 'This week') {
        const oneWeekAgo = now.getTime() - 7 * 86400000
        return created >= oneWeekAgo
      } else if (timeFilter === 'This month') {
        const oneMonthAgo = now.getTime() - 30 * 86400000
        return created >= oneMonthAgo
      }
      return true
    })
  }, [links, timeFilter])

  const totalLinks = filteredLinks.length
  const totalNotes = notes.length

  const platformStats = useMemo(() => {
    const counts = {}
    filteredLinks.forEach((l) => {
      const p = l.platform || 'Website'
      counts[p] = (counts[p] || 0) + 1
    })
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1])
    return entries.map(([name, count]) => ({
      name,
      count,
      percent: totalLinks > 0 ? Math.round((count / totalLinks) * 100) : 0
    }))
  }, [filteredLinks, totalLinks])

  const tagStats = useMemo(() => {
    const counts = {}
    filteredLinks.forEach((l) => {
      if (l.tag) {
        l.tag.split(',').forEach(t => {
          const trimmed = t.trim()
          if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1
        })
      }
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [filteredLinks])

  const topPlatform = platformStats[0] || { name: 'None', count: 0, percent: 0 }
  const topTag = tagStats[0] || ['None', 0]

  function getPlatformIcon(name) {
    return getPlatformTileIcon(name, "w-4 h-4")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn pb-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-2xs">
            📈
          </div>
          <div>
            <h2 className="text-slate-900 font-bold text-lg tracking-tight">Library Insights &amp; Analytics</h2>
            <p className="text-slate-400 text-xs mt-0.5">Comprehensive analysis of your saved links, platforms &amp; notes.</p>
          </div>
        </div>

        {/* Time Category Selector */}
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          <option value="All time">📅 All time</option>
          <option value="Today">⚡ Today</option>
          <option value="Yesterday">🕒 Yesterday</option>
          <option value="This week">🗓️ This week</option>
          <option value="This month">📊 This month</option>
        </select>
      </div>

      {/* 4 Summary Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Links */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2 relative overflow-hidden">
          <span className="text-xs font-semibold text-slate-400">Total Links</span>
          <div className="text-2xl font-black text-slate-900">{totalLinks}</div>
          <div className="w-full h-1 bg-emerald-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Top Platform */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400">Top Platform</span>
          <div className="text-lg font-bold text-slate-900 truncate flex items-center gap-1.5">
            {getPlatformIcon(topPlatform.name)}
            <span className="truncate">{topPlatform.name}</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold">{topPlatform.count} links ({topPlatform.percent}%)</div>
        </div>

        {/* Top Tag */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400">Top Tag</span>
          <div className="text-lg font-bold text-purple-700 truncate">
            #{topTag[0]}
          </div>
          <div className="text-[11px] text-purple-600 font-semibold">{topTag[1]} tagged links</div>
        </div>

        {/* Total Notes */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-2">
          <span className="text-xs font-semibold text-slate-400">Notes &amp; Tables</span>
          <div className="text-2xl font-black text-slate-900">{totalNotes}</div>
          <div className="text-[11px] text-amber-600 font-semibold">Rich Documents</div>
        </div>
      </div>

      {/* Main Chart & Total Growth Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <span>📊</span> Link Growth Trend
          </h3>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
            ↑ Active Collection
          </span>
        </div>

        <div className="bg-gradient-to-r from-emerald-50/40 via-emerald-50/10 to-slate-50/30 border border-emerald-100/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 font-medium">Accumulated Resources</span>
            <div className="text-3xl font-black text-slate-900 mt-1">{totalLinks} Saved URLs</div>
            <p className="text-xs text-slate-400 mt-1">Organized across {platformStats.length} platform categories</p>
          </div>
          
          <div className="w-full sm:w-64 h-16">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
              <defs>
                <linearGradient id="insightsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 34 Q 30 30 50 24 T 100 26 T 150 14 T 200 6 L 200 40 L 0 40 Z"
                fill="url(#insightsGrad)"
              />
              <path
                d="M 0 34 Q 30 30 50 24 T 100 26 T 150 14 T 200 6"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="200" cy="6" r="4" fill="#10b981" />
            </svg>
          </div>
        </div>
      </div>

      {/* Platform Breakdown Progress Bars */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <span>📱</span> Platform Distribution
        </h3>

        {platformStats.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No platform data available yet.</div>
        ) : (
          <div className="space-y-3.5">
            {platformStats.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2 text-slate-800">
                    {getPlatformIcon(item.name)}
                    <span>{item.name}</span>
                  </div>
                  <div className="text-slate-500 font-bold">
                    <span>{item.count} links</span>
                    <span className="text-slate-400 font-normal ml-2">({item.percent}%)</span>
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(item.percent, 4)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tag Cloud Breakdown */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
          <span>🏷️</span> Tags Breakdown
        </h3>

        {tagStats.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">No tags added yet.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tagStats.map(([t, cnt]) => (
              <span
                key={t}
                className="bg-[#f3f0ff] border border-[#ede9fe] text-[#6d28d9] px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-2xs"
              >
                <span>#{t}</span>
                <span className="bg-purple-200/80 text-purple-800 text-[10px] font-bold px-1.5 py-0.2 rounded-md">
                  {cnt}
                </span>
              </span>
            ))}
          </div>
        )}
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
      <div className="bg-white border border-slate-100 rounded-2xl relative z-30 shadow-sm transition-all">
        {/* Compact Toggle Header */}
        <div
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="px-4 py-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50/70 transition select-none rounded-2xl"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs shadow-sm">
              🔍
            </div>
            <span className="text-sm font-bold text-slate-700">Filter & Sort</span>
            {hasActiveFilters && (
              <span className="bg-indigo-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Active
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
            <span className="text-[11px] text-slate-500 font-semibold bg-slate-100 px-2.5 py-1 rounded-full">
              {filtered.length} / {links.length}
            </span>
            <span className="text-xs text-slate-400 font-bold ml-0.5">
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
              let str = cardTitle
                .replace(/&quot;/g, '"')
                .replace(/&#x2019;/g, "'")
                .replace(/&#x2018;/g, "'")
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 16)))
                .replace(/&#([0-9]+);/g, (_, code) => String.fromCodePoint(parseInt(code, 10)))
                .trim()

              const match = str.match(/on\s+instagram/i)
              if (match) {
                const idx = match.index
                const authorPart = str.slice(0, idx).trim()
                let afterPart = str.slice(idx + match[0].length).trim()

                afterPart = afterPart.replace(/^[:\s"\-–—'”„“]+/, '').trim()
                afterPart = afterPart.replace(/["'”„“\s]+$/, '').trim()

                const contentCheck = afterPart.replace(/\./g, '').trim()
                if (contentCheck.length > 0) {
                  cardTitle = afterPart
                } else if (authorPart.length > 0 && authorPart.toLowerCase() !== 'post' && authorPart.toLowerCase() !== 'reel') {
                  cardTitle = authorPart
                }
              } else {
                str = str.replace(/^["'”„“\s]+/, '').replace(/["'”„“\s]+$/, '').trim()
                if (str.length > 0) cardTitle = str
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
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                {/* 1. Top: Thumbnail (160px) */}
                <div className="relative w-full h-[160px] bg-slate-100 overflow-hidden">
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
                    <div className="h-4 bg-slate-200 rounded animate-pulse w-4/5 my-0.5" />
                  ) : (
                    <h4 className="text-sm font-semibold text-slate-800 line-clamp-2 leading-snug">
                      {cardTitle}
                    </h4>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-1 min-w-0">
                    {(() => {
                      const itemTags = link.tag ? link.tag.split(',').map(t => t.trim()).filter(Boolean) : []
                      if (itemTags.length === 0) {
                        return (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500 border border-slate-200">
                            No tag
                          </span>
                        )
                      }
                      return itemTags.map(t => (
                        <span key={t} className="tag-pill">
                          🏷️ <span className="truncate">{t}</span>
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

                {/* Bottom Footer Section: Platform & Date */}
                <div className="bg-slate-50 border-t border-slate-100 p-2 px-2.5 flex items-center justify-between gap-1 mt-auto min-w-0">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border leading-tight flex-shrink-0 ${platformColor(link.platform)}`}>
                    {link.platform || 'Other'}
                  </span>

                  {/* Date & Time */}
                  {(() => {
                    const { dateStr, timeStr } = formatDateParts(link.created_at)
                    return (
                      <div className="flex flex-col items-end text-right leading-tight flex-shrink-0 ml-auto">
                        <span className="text-[10px] text-slate-600 font-semibold">{dateStr}</span>
                        <span className="text-[9px] text-slate-400 font-medium">{timeStr}</span>
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
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 p-6 flex flex-col gap-4 animate-scaleIn">
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
  const { user, links, notes, deleteLink, updateLink, signOut } = useAuth()
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
    { id: 'add', label: 'Add Link', icon: '➕' },
    { id: 'library', label: 'My Library', icon: '📋' },
    { id: 'notes', label: 'Notes', icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-slate-50/60 font-sans">

      {/* ── Header (Screenshot 1 Exact Replica) ── */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left Logo + Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#9382ff] text-white flex items-center justify-center font-black text-xl shadow-md shadow-purple-500/20">
              M
            </div>
            <div>
              <h1 className="font-bold text-slate-900 text-lg leading-tight tracking-tight">Mark</h1>
              <p className="text-xs text-slate-400 font-normal">Link &amp; Note Manager</p>
            </div>
          </div>

          {/* Right Logout Button */}
          <button
            id="logout-btn"
            onClick={handleLogout}
            className="w-10 h-10 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-600 transition cursor-pointer shadow-2xs"
            title="Logout"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-4 py-6 pb-28">
        {activeTab === 'add' && <AddLinkTab initialUrl={sharedUrl} links={links} />}
        {activeTab === 'library' && (
          <LibraryTab
            links={links}
            onDelete={deleteLink}
            onUpdate={updateLink}
            onFilteredChange={(data, hasFilters, previews) => setLibraryState({ data, hasFilters, previews })}
          />
        )}
        {activeTab === 'insights' && <InsightsTab links={links} notes={notes} />}
        {activeTab === 'notes' && <Notes />}
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

      {/* ── Floating Bottom Navigation Bar (Image 2 Replica) ── */}
      <div className="fixed bottom-4 left-0 right-0 z-40 px-3 pointer-events-none">
        <nav className="max-w-md mx-auto bg-white border border-slate-100 rounded-3xl shadow-xl shadow-slate-200/60 p-2 pointer-events-auto flex items-center justify-between gap-1">
          {/* Section 1: Add Link */}
          <button
            id="tab-add"
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-2 rounded-2xl flex items-center gap-1.5 text-xs transition-all duration-150 cursor-pointer ${
              activeTab === 'add'
                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              activeTab === 'add' ? 'bg-slate-200/80 text-slate-800' : 'bg-slate-100 text-slate-600'
            }`}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <span>Add Link</span>
          </button>

          {/* Section 2: My Library */}
          <button
            id="tab-library"
            onClick={() => setActiveTab('library')}
            className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs transition-all duration-150 cursor-pointer ${
              activeTab === 'library'
                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>My Library</span>
          </button>

          {/* Section 3: Insights */}
          <button
            id="tab-insights"
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs transition-all duration-150 cursor-pointer ${
              activeTab === 'insights'
                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Insights</span>
          </button>

          {/* Section 4: Notes */}
          <button
            id="tab-notes"
            onClick={() => setActiveTab('notes')}
            className={`px-3 py-2 rounded-2xl flex items-center gap-1.5 text-xs transition-all duration-150 cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-slate-100 text-slate-900 font-bold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 font-medium'
            }`}
          >
            <svg className="w-4 h-4 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Notes</span>
          </button>
        </nav>
      </div>
    </div>
  )
}
