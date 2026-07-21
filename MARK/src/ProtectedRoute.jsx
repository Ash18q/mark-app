import { Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Protects routes that require authentication
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [searchParams] = useSearchParams()

  // Detect if app was launched via Share Intent (e.g. sharing from Instagram / YouTube)
  const isShareIntent = Boolean(
    searchParams.get('url') ||
    searchParams.get('text') ||
    searchParams.get('link') ||
    searchParams.get('href') ||
    searchParams.get('q') ||
    window.location.search.includes('url=') ||
    window.location.search.includes('text=')
  )

  // Fast-track cached user lookup from localStorage
  const cachedUserExists = (() => {
    try {
      const storageKeys = Object.keys(localStorage)
      const tokenKey = storageKeys.find((k) => k.includes('auth-token') || k.includes('sb-'))
      if (tokenKey) {
        const cached = JSON.parse(localStorage.getItem(tokenKey) || '{}')
        return Boolean(cached?.user || cached?.currentSession?.user)
      }
    } catch { /* ignore */ }
    return false
  })()

  // If loading during share intent with cached user, render instantly (0ms delay!)
  if (loading && isShareIntent && cachedUserExists) {
    return children
  }

  // Normal loading screen for regular app launch
  if (loading && !isShareIntent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading…</span>
        </div>
      </div>
    )
  }

  return (user || cachedUserExists) ? children : <Navigate to="/login" replace />
}
