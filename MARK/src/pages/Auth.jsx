import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const LOGO_SVG = (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#1e40af"/>
    <text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle"
      fill="white" fontSize="18" fontWeight="bold" fontFamily="Inter,sans-serif">M</text>
  </svg>
)

function FormField({ label, id, type = 'text', value, onChange, placeholder, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <div className={isPassword ? 'relative' : ''}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`input-field w-full ${isPassword ? 'pr-10' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none hover:text-slate-600 transition"
          >
            {showPassword ? (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Login Page ───────────────────────────────────────────────────────────────
export function LoginPage() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const location   = useLocation()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const successMessage = location.state?.message

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    loading_start()
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      loading_stop()
    }
  }

  function loading_start() {
    setLoading(true)
  }
  function loading_stop() {
    setLoading(false)
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your MARK account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {successMessage && (
          <div role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-medium">
            {successMessage}
          </div>
        )}

        <FormField
          label="Email address"
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          autoComplete="current-password"
        />

        {error && (
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
            Sign up free
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── Signup Page ──────────────────────────────────────────────────────────────
export function SignupPage() {
  const { signUp, signIn } = useAuth()
  const navigate   = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 6)  { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const data = await signUp(email, password)
      if (data?.session) {
        navigate('/dashboard')
      } else if (data?.user) {
        try {
          await signIn(email, password)
          navigate('/dashboard')
        } catch {
          navigate('/login', { state: { message: 'Account created! Please log in.' } })
        }
      } else {
        navigate('/login', { state: { message: 'Account created! Please log in.' } })
      }
    } catch (err) {
      setError(err.message || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start saving links in seconds">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          label="Email address"
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <FormField
          label="Password"
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          autoComplete="new-password"
        />
        <FormField
          label="Confirm password"
          id="signup-confirm"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Repeat password"
          autoComplete="new-password"
        />

        {error && (
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
          {loading ? 'Creating account…' : 'Create Account'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}

// ─── Shared Auth Layout ───────────────────────────────────────────────────────
function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          {LOGO_SVG}
          <span className="mt-2 text-2xl font-extrabold text-primary-800 tracking-tight">MARK</span>
          <span className="text-xs text-slate-400 font-medium mt-0.5">Link Manager</span>
        </div>

        {/* Card */}
        <div className="card shadow-xl border-slate-100">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-800">{title}</h1>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
