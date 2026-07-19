import { Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Protects routes that require authentication
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-sm text-slate-400 font-medium">Loading…</span>
        </div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}
