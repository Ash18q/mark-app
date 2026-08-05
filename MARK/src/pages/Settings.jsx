import { useState, useMemo } from 'react'
import { useSecurity } from '../context/SecurityContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

export default function Settings() {
  const { user, signOut } = useAuth()
  const {
    securityConfig,
    setMpin,
    disableMpin,
    changeMpin,
    setExportPassword,
    toggleGhostMode,
    setAutoLockTimer,
    resetSecurityState,
  } = useSecurity()

  const [showEmail, setShowEmail] = useState(false)
  const [openAccordion, setOpenAccordion] = useState(null) // 'handle' | 'password' | null

  // Modals state
  const [mpinModal, setMpinModal] = useState({ open: false, mode: 'set' }) // 'set' | 'change' | 'disable'
  const [currentPin, setCurrentPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [mpinLoading, setMpinLoading] = useState(false)
  const [mpinError, setMpinError] = useState('')

  // Export Password Modal state
  const [exportModal, setExportModal] = useState(false)
  const [newExportPass, setNewExportPass] = useState('')
  const [confirmExportPass, setConfirmExportPass] = useState('')
  const [exportLoading, setExportLoading] = useState(false)
  const [exportError, setExportError] = useState('')

  // Username state
  const initialUsername = useMemo(() => {
    return user?.user_metadata?.username || localStorage.getItem(`mark_username_${user?.id}`) || ''
  }, [user])
  const [username, setUsername] = useState(initialUsername)
  const [usernameLoading, setUsernameLoading] = useState(false)
  const [usernameMsg, setUsernameMsg] = useState({ type: '', text: '' })

  // Account Password state
  const [newAccPassword, setNewAccPassword] = useState('')
  const [confirmAccPassword, setConfirmAccPassword] = useState('')
  const [showAccPassword, setShowAccPassword] = useState(false)
  const [accPassLoading, setAccPassLoading] = useState(false)
  const [accPassMsg, setAccPassMsg] = useState({ type: '', text: '' })

  // Email masking helper
  const maskedEmail = useMemo(() => {
    const email = user?.email || ''
    if (!email.includes('@')) return email
    const [name, domain] = email.split('@')
    if (name.length <= 2) return `${name}***@${domain}`
    return `${name.slice(0, 2)}${'*'.repeat(Math.min(name.length - 2, 5))}@${domain}`
  }, [user])

  // MPIN Toggle Switch Handler
  const handleMpinToggle = async (e) => {
    const enabled = e.target.checked
    if (enabled) {
      if (!securityConfig.mpinHash) {
        setMpinModal({ open: true, mode: 'set' })
      } else {
        setMpinModal({ open: true, mode: 'enable' })
      }
    } else {
      setMpinModal({ open: true, mode: 'disable' })
    }
  }

  // Submit MPIN Modal (Set / Change / Disable)
  const handleMpinSubmit = async (e) => {
    e.preventDefault()
    setMpinError('')

    if (mpinModal.mode === 'set') {
      if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
        setMpinError('MPIN must be 4 to 6 numeric digits.')
        return
      }
      if (newPin !== confirmPin) {
        setMpinError('PIN numbers do not match.')
        return
      }

      setMpinLoading(true)
      try {
        await setMpin(newPin)
        setMpinModal({ open: false, mode: 'set' })
        setNewPin('')
        setConfirmPin('')
      } catch (err) {
        setMpinError(err.message || 'Failed to set MPIN.')
      } finally {
        setMpinLoading(false)
      }
    } else if (mpinModal.mode === 'change') {
      if (newPin.length < 4 || newPin.length > 6 || !/^\d+$/.test(newPin)) {
        setMpinError('New MPIN must be 4 to 6 numeric digits.')
        return
      }
      if (newPin !== confirmPin) {
        setMpinError('New PIN numbers do not match.')
        return
      }

      setMpinLoading(true)
      try {
        await changeMpin(currentPin, newPin)
        setMpinModal({ open: false, mode: 'change' })
        setCurrentPin('')
        setNewPin('')
        setConfirmPin('')
      } catch (err) {
        setMpinError(err.message || 'Incorrect current MPIN.')
      } finally {
        setMpinLoading(false)
      }
    } else if (mpinModal.mode === 'disable') {
      setMpinLoading(true)
      try {
        await disableMpin()
        setMpinModal({ open: false, mode: 'disable' })
      } catch (err) {
        setMpinError(err.message || 'Failed to disable MPIN.')
      } finally {
        setMpinLoading(false)
      }
    }
  }

  // Export Password Submit Handler
  const handleExportPassSubmit = async (e) => {
    e.preventDefault()
    setExportError('')

    if (newExportPass.length < 6 || !/^\d+$/.test(newExportPass)) {
      setExportError('Export password must be 6 numeric digits.')
      return
    }
    if (newExportPass !== confirmExportPass) {
      setExportError('Export passwords do not match.')
      return
    }

    setExportLoading(true)
    try {
      await setExportPassword(newExportPass)
      setExportModal(false)
      setNewExportPass('')
      setConfirmExportPass('')
    } catch (err) {
      setExportError(err.message || 'Failed to set export password.')
    } finally {
      setExportLoading(false)
    }
  }

  // Save Handle Handler
  const handleSaveUsername = async (e) => {
    e.preventDefault()
    setUsernameMsg({ type: '', text: '' })
    const trimmed = username.trim().toLowerCase().replace(/[^a-z0-9_.]/g, '')

    if (!trimmed || trimmed.length < 3) {
      setUsernameMsg({ type: 'error', text: 'Username must be at least 3 characters.' })
      return
    }

    setUsernameLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: trimmed },
      })
      if (error) throw error

      try {
        localStorage.setItem(`mark_username_${user?.id}`, trimmed)
      } catch { /* ignore */ }

      setUsername(trimmed)
      setUsernameMsg({ type: 'success', text: `✓ Handle set to @${trimmed}!` })
    } catch (err) {
      setUsernameMsg({ type: 'error', text: err.message || 'Failed to save username.' })
    } finally {
      setUsernameLoading(false)
    }
  }

  // Save Account Password Handler
  const handleUpdateAccPassword = async (e) => {
    e.preventDefault()
    setAccPassMsg({ type: '', text: '' })

    if (newAccPassword.length < 6) {
      setAccPassMsg({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }
    if (newAccPassword !== confirmAccPassword) {
      setAccPassMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }

    setAccPassLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newAccPassword })
      if (error) throw error

      setNewAccPassword('')
      setConfirmAccPassword('')
      setAccPassMsg({ type: 'success', text: '✓ Account password updated!' })
    } catch (err) {
      setAccPassMsg({ type: 'error', text: err.message || 'Failed to update password.' })
    } finally {
      setAccPassLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn pb-16">
      
      {/* ── SECTION 1: MPIN & SECURITY MANAGEMENT ── */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold">
            🔐
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">App Security &amp; MPIN</h3>
            <p className="text-xs text-slate-400">Protect your link library and private notes</p>
          </div>
        </div>

        {/* 1. App Lock (MPIN) Toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-bold text-slate-800">App Lock (MPIN)</div>
            <div className="text-[11px] text-slate-400">Require 4-6 digit MPIN when opening Mark</div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={securityConfig.mpinEnabled}
              onChange={handleMpinToggle}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
          </label>
        </div>

        {/* Change MPIN Button if enabled */}
        {securityConfig.mpinEnabled && (
          <div className="pt-1 flex items-center justify-between bg-blue-50/60 border border-blue-100 rounded-2xl p-3.5">
            <div className="text-xs font-semibold text-blue-900">
              ✓ MPIN is active ({securityConfig.mpinHash ? 'Configured' : 'Needs PIN setup'})
            </div>
            <button
              type="button"
              onClick={() => setMpinModal({ open: true, mode: 'change' })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer shadow-2xs"
            >
              Change MPIN
            </button>
          </div>
        )}

        {/* 2. Auto-Lock Timer Dropdown */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-bold text-slate-800">Auto-Lock Timer</div>
            <div className="text-[11px] text-slate-400">Lock automatically after background inactivity</div>
          </div>

          <select
            value={securityConfig.autoLockTimer}
            onChange={(e) => setAutoLockTimer(Number(e.target.value))}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={0}>⚡ Immediately</option>
            <option value={30}>⏱️ 30 seconds (Default)</option>
            <option value={60}>⌛ 1 minute</option>
            <option value={300}>📊 5 minutes</option>
          </select>
        </div>

        {/* 3. Ghost / Panic Mode Toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between py-1">
          <div className="pr-4">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>👻 Ghost / Panic Mode</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-bold">
                Panic PIN
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
              If PIN typed ends with <span className="font-bold text-slate-800">'9'</span> (e.g. 1234 → 1239), app opens but hides sensitive content (Link titles, Notes, Insights).
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={securityConfig.ghostEnabled}
              onChange={(e) => toggleGhostMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600" />
          </label>
        </div>

        {/* 4. Export Password Management */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between py-1">
          <div>
            <div className="text-xs font-bold text-slate-800">Export Password</div>
            <div className="text-[11px] text-slate-400">Required when downloading CSV or JSON library exports</div>
          </div>

          <button
            type="button"
            onClick={() => setExportModal(true)}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer"
          >
            {securityConfig.exportPasswordHash ? 'Change Password' : 'Set Password'}
          </button>
        </div>
      </div>

      {/* ── SECTION 2: ACCOUNT & PRIVACY ── */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          ACCOUNT &amp; HANDLE
        </h4>

        <div className="divide-y divide-slate-100">
          {/* Edit Profile Handle */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'handle' ? null : 'handle')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">
                  👤
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                    Unique Profile Handle
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {username ? `@${username}` : 'Set your handle (@username)'}
                  </div>
                </div>
              </div>
              <span className="text-slate-400 text-sm font-bold">
                {openAccordion === 'handle' ? '▲' : '›'}
              </span>
            </button>

            {openAccordion === 'handle' && (
              <form onSubmit={handleSaveUsername} className="mt-3 pl-12 space-y-3 animate-fadeIn">
                <div className="relative flex items-center bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-2 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition">
                  <span className="text-slate-400 font-bold mr-1 text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                    placeholder="username (e.g. ashish_18)"
                    className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none font-semibold"
                    required
                  />
                </div>

                {usernameMsg.text && (
                  <div
                    className={`text-xs px-3 py-1.5 rounded-xl border ${
                      usernameMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {usernameMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={usernameLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-60"
                >
                  {usernameLoading ? 'Saving…' : 'Save Handle'}
                </button>
              </form>
            )}
          </div>

          {/* Bound Account Email */}
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">
                ✉️
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">Bound Account Email</div>
                <div className="text-[11px] text-slate-500 font-mono">
                  {showEmail ? user?.email : maskedEmail}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowEmail(!showEmail)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {showEmail ? '🙈 Hide' : '👁️ Show'}
            </button>
          </div>

          {/* Change Account Password */}
          <div className="py-3">
            <button
              type="button"
              onClick={() => setOpenAccordion(openAccordion === 'password' ? null : 'password')}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">
                  🔑
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition">
                    Change Password
                  </div>
                  <div className="text-[11px] text-slate-400">Update account login password</div>
                </div>
              </div>
              <span className="text-slate-400 text-sm font-bold">
                {openAccordion === 'password' ? '▲' : '›'}
              </span>
            </button>

            {openAccordion === 'password' && (
              <form onSubmit={handleUpdateAccPassword} className="mt-3 pl-12 space-y-3 animate-fadeIn">
                <div className="space-y-2">
                  <input
                    type={showAccPassword ? 'text' : 'password'}
                    value={newAccPassword}
                    onChange={(e) => setNewAccPassword(e.target.value)}
                    placeholder="New Password (min 6 chars)"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                    required
                  />
                  <input
                    type={showAccPassword ? 'text' : 'password'}
                    value={confirmAccPassword}
                    onChange={(e) => setConfirmAccPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none font-medium"
                    required
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowAccPassword(!showAccPassword)}
                    className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline"
                  >
                    {showAccPassword ? 'Hide characters' : 'Show characters'}
                  </button>

                  <button
                    type="submit"
                    disabled={accPassLoading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer disabled:opacity-60"
                  >
                    {accPassLoading ? 'Updating…' : 'Update Password'}
                  </button>
                </div>

                {accPassMsg.text && (
                  <div
                    className={`text-xs px-3 py-1.5 rounded-xl border ${
                      accPassMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    {accPassMsg.text}
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: DANGER ZONE ── */}
      <div className="bg-rose-50/50 rounded-3xl border border-rose-200/70 p-6 space-y-4">
        <h4 className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">
          ⚠️ DANGER ZONE
        </h4>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="text-xs font-bold text-slate-900">Reset MPIN Security</div>
            <div className="text-[11px] text-slate-500">Send reset link to registered email to configure new PIN</div>
          </div>

          <button
            type="button"
            onClick={async () => {
              if (user?.email) {
                await supabase.auth.resetPasswordForEmail(user.email)
                alert(`✓ Password/PIN reset link sent to ${user.email}`)
              }
            }}
            className="bg-white border border-rose-300 text-rose-600 hover:bg-rose-100 font-bold px-4 py-2 rounded-2xl text-xs transition cursor-pointer shadow-2xs"
          >
            Reset MPIN via Email
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-rose-200/60 pt-4">
          <div>
            <div className="text-xs font-bold text-slate-900">Clear Data &amp; Logout</div>
            <div className="text-[11px] text-slate-500">Sign out session and clear local security tokens</div>
          </div>

          <button
            type="button"
            onClick={async () => {
              resetSecurityState()
              await signOut()
              window.location.href = '/login'
            }}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-2xl text-xs transition cursor-pointer shadow-md shadow-rose-500/20"
          >
            Clear Data &amp; Logout
          </button>
        </div>
      </div>

      {/* ── MPIN MODAL (Set / Change / Disable) ── */}
      {mpinModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-left shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">
                {mpinModal.mode === 'set' && '🔒 Set New 4-6 Digit MPIN'}
                {mpinModal.mode === 'change' && '🔑 Change MPIN'}
                {mpinModal.mode === 'disable' && '🔓 Disable App Lock'}
              </h3>
              <button
                type="button"
                onClick={() => setMpinModal({ open: false, mode: 'set' })}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleMpinSubmit} className="space-y-3">
              {mpinModal.mode === 'change' && (
                <input
                  type="password"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter Current MPIN"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono tracking-widest text-center focus:bg-white focus:border-blue-500 focus:outline-none"
                  required
                />
              )}

              {mpinModal.mode !== 'disable' && (
                <>
                  <input
                    type="password"
                    maxLength={6}
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter New MPIN (4-6 digits)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono tracking-widest text-center focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                  <input
                    type="password"
                    maxLength={6}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="Confirm New MPIN"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono tracking-widest text-center focus:bg-white focus:border-blue-500 focus:outline-none"
                    required
                  />
                </>
              )}

              {mpinModal.mode === 'disable' && (
                <p className="text-xs text-slate-500">
                  Are you sure you want to disable MPIN App Lock? Anyone with access to this device can open Mark app.
                </p>
              )}

              {mpinError && (
                <div className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {mpinError}
                </div>
              )}

              <button
                type="submit"
                disabled={mpinLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl transition text-xs cursor-pointer disabled:opacity-60"
              >
                {mpinLoading ? 'Saving…' : mpinModal.mode === 'disable' ? 'Confirm Disable' : 'Save MPIN'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── EXPORT PASSWORD MODAL ── */}
      {exportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-left shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">📦 Set Export Password</h3>
              <button
                type="button"
                onClick={() => setExportModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Set a 6-digit numeric password required to download CSV or JSON exports.
            </p>

            <form onSubmit={handleExportPassSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={6}
                value={newExportPass}
                onChange={(e) => setNewExportPass(e.target.value.replace(/\D/g, ''))}
                placeholder="6-Digit Export Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono tracking-widest text-center focus:bg-white focus:border-blue-500 focus:outline-none"
                required
              />
              <input
                type="password"
                maxLength={6}
                value={confirmExportPass}
                onChange={(e) => setConfirmExportPass(e.target.value.replace(/\D/g, ''))}
                placeholder="Confirm Export Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono tracking-widest text-center focus:bg-white focus:border-blue-500 focus:outline-none"
                required
              />

              {exportError && (
                <div className="text-xs px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                  {exportError}
                </div>
              )}

              <button
                type="submit"
                disabled={exportLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl transition text-xs cursor-pointer disabled:opacity-60"
              >
                {exportLoading ? 'Saving…' : 'Save Export Password'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
