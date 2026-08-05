import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// ─── SVG Logo ─────────────────────────────────────────────────────────────────
function MarkLogo({ size = 44 }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
    >
      <span style={{ fontSize: size * 0.45 }} className="text-white font-black tracking-tighter select-none">M</span>
    </div>
  )
}

// ─── Form Field ───────────────────────────────────────────────────────────────
function FormField({ label, id, type = 'text', value, onChange, placeholder, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-slate-600">{label}</label>
      <div className={isPassword ? 'relative' : ''}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className={`input-field w-full ${isPassword ? 'pr-11' : ''}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none text-slate-400 hover:text-slate-600 transition"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to MARK">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {successMessage && (
          <div role="status" className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-medium flex items-center gap-2">
            <span>✓</span> {successMessage}
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
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1 py-3 text-base font-bold">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
          ) : 'Sign In →'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition">
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
    <AuthLayout title="Create your account" subtitle="Start organizing links & notes in seconds">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
          <div role="alert" className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full mt-1 py-3 text-base font-bold">
          {loading ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account…</>
          ) : 'Create Account →'}
        </button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 hover:underline transition">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-32 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -right-32 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-indigo-100/40 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-fadeIn">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <MarkLogo size={52} />
          <span className="mt-3 text-3xl font-black text-slate-800 tracking-tight">MARK</span>
          <span className="text-xs text-slate-400 font-medium mt-0.5 tracking-wide">Link & Note Manager</span>
        </div>

        {/* Auth Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/60 border border-white/80 p-8">
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">{subtitle}</p>
          </div>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          By continuing, you agree to MARK's Terms of Service
        </p>
      </div>
    </div>
  )
}
