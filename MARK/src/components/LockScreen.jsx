import { useState, useEffect } from 'react'
import { useSecurity } from '../context/SecurityContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

export default function LockScreen() {
  const { isLocked, unlockApp, lockoutUntil, securityConfig } = useSecurity()
  const { user } = useAuth()

  const [pin, setPin] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [remainingTime, setRemainingTime] = useState(0)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpMsg, setOtpMsg] = useState({ type: '', text: '' })

  // Lockout countdown timer
  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingTime(0)
      return
    }

    const interval = setInterval(() => {
      const diff = Math.ceil((lockoutUntil - Date.now()) / 1000)
      if (diff <= 0) {
        setRemainingTime(0)
        clearInterval(interval)
      } else {
        setRemainingTime(diff)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [lockoutUntil])

  // Keypad / Typing Listener
  useEffect(() => {
    if (!isLocked) return

    const handleKeyDown = (e) => {
      if (remainingTime > 0) return

      if (/^[0-9]$/.test(e.key)) {
        if (pin.length < 6) setPin((prev) => prev + e.key)
      } else if (e.key === 'Backspace') {
        setPin((prev) => prev.slice(0, -1))
      } else if (e.key === 'Enter') {
        if (pin.length >= 4) handleUnlock(pin)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isLocked, pin, remainingTime])

  if (!isLocked) return null

  const handleKeyPress = (num) => {
    if (remainingTime > 0) return
    if (pin.length < 6) {
      const nextPin = pin + num
      setPin(nextPin)
      setErrorMsg('')
    }
  }

  const handleDelete = () => {
    if (remainingTime > 0) return
    setPin((prev) => prev.slice(0, -1))
    setErrorMsg('')
  }

  const handleClear = () => {
    if (remainingTime > 0) return
    setPin('')
    setErrorMsg('')
  }

  const handleUnlock = async (pinToSubmit = pin) => {
    if (remainingTime > 0) return
    if (!pinToSubmit || pinToSubmit.length < 4) {
      setErrorMsg('Please enter a 4-6 digit MPIN')
      return
    }

    const res = await unlockApp(pinToSubmit)
    if (res.success) {
      setPin('')
      setErrorMsg('')
    } else {
      setPin('')
      if (res.lockedOut) {
        setErrorMsg(`Too many failed attempts. Try again in ${res.remaining}s`)
      } else if (res.attempts >= 5) {
        setErrorMsg('5 Failed attempts. App locked for 5 minutes.')
      } else if (res.attempts >= 3) {
        setErrorMsg('3 Failed attempts. App locked for 30 seconds.')
      } else {
        setErrorMsg('Incorrect MPIN. Please try again.')
      }
    }
  }

  // Handle Forgot PIN OTP Request
  const handleSendResetOtp = async () => {
    if (!user?.email) return
    setOtpLoading(true)
    setOtpMsg({ type: '', text: '' })

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email)
      if (error) throw error
      setOtpSent(true)
      setOtpMsg({
        type: 'success',
        text: `✓ Reset link/code sent to ${user.email}. Check your inbox!`,
      })
    } catch (err) {
      setOtpMsg({
        type: 'error',
        text: err.message || 'Failed to send OTP reset link.',
      })
    } finally {
      setOtpLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-3xl border border-white/40 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center space-y-6">
        
        {/* App Logo Badge */}
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-3xl shadow-lg shadow-blue-500/30">
            M
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">MARK App Security</h2>
          <p className="text-xs text-slate-500 font-medium">Enter your 4-6 digit MPIN to unlock</p>
        </div>

        {/* PIN Entry Circles */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3, 4, 5].map((index) => {
            const isFilled = index < pin.length
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                  isFilled
                    ? 'bg-blue-600 border-blue-600 scale-110 shadow-md shadow-blue-500/40'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            )
          })}
        </div>

        {/* Error / Lockout Message */}
        {remainingTime > 0 ? (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-xs font-bold font-mono animate-pulse">
            ⏳ App Locked! Try again in {remainingTime}s
          </div>
        ) : errorMsg ? (
          <div className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 animate-shake">
            {errorMsg}
          </div>
        ) : (
          <div className="text-[11px] text-slate-400 font-medium h-5">
            {pin.length >= 4 ? 'Press Submit or Enter to Unlock' : 'Type numeric MPIN'}
          </div>
        )}

        {/* Numeric Keypad Grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[240px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              disabled={remainingTime > 0}
              onClick={() => handleKeyPress(num)}
              className="w-16 h-12 mx-auto rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 text-slate-800 font-extrabold text-lg transition flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            disabled={remainingTime > 0}
            onClick={handleClear}
            className="w-16 h-12 mx-auto rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs transition flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            C
          </button>
          <button
            type="button"
            disabled={remainingTime > 0}
            onClick={() => handleKeyPress('0')}
            className="w-16 h-12 mx-auto rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 active:bg-blue-100 text-slate-800 font-extrabold text-lg transition flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            0
          </button>
          <button
            type="button"
            disabled={remainingTime > 0}
            onClick={handleDelete}
            className="w-16 h-12 mx-auto rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-base transition flex items-center justify-center cursor-pointer disabled:opacity-40"
          >
            ⌫
          </button>
        </div>

        {/* Submit Button & Reset PIN link */}
        <div className="w-full space-y-3 pt-2">
          <button
            type="button"
            disabled={remainingTime > 0 || pin.length < 4}
            onClick={() => handleUnlock(pin)}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-2xl text-xs transition cursor-pointer shadow-md shadow-blue-500/20"
          >
            Unlock App
          </button>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer block mx-auto"
          >
            Forgot MPIN? Reset via Email
          </button>
        </div>
      </div>

      {/* Reset MPIN Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-left shadow-2xl border border-slate-100 animate-scaleUp">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">🔑 Reset MPIN Security</h3>
              <button
                type="button"
                onClick={() => setResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              We will send an OTP password reset link to your registered email (<span className="font-bold text-slate-700">{user?.email}</span>).
            </p>

            {otpMsg.text && (
              <div
                className={`text-xs px-3.5 py-2 rounded-xl border ${
                  otpMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-medium'
                    : 'bg-rose-50 border-rose-200 text-rose-700 font-medium'
                }`}
              >
                {otpMsg.text}
              </div>
            )}

            <button
              type="button"
              disabled={otpLoading}
              onClick={handleSendResetOtp}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-2xl transition text-xs cursor-pointer disabled:opacity-60"
            >
              {otpLoading ? 'Sending Reset Link…' : 'Send Reset Link to Email'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
