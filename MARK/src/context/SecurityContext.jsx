import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from '../supabaseClient'

const SecurityContext = createContext(null)

// ─── SHA-256 Hashing via Web Crypto API ──────────────────────────────────────
export async function hashString(str) {
  if (!str) return ''
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(str)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  } catch (err) {
    console.warn('[MARK Security] Web Crypto unavailable, using fallback hash:', err)
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash |= 0
    }
    return 'fb_' + Math.abs(hash).toString(16)
  }
}

export function SecurityProvider({ children }) {
  const { user } = useAuth()

  // Security config state synced with Supabase metadata
  const [securityConfig, setSecurityConfig] = useState({
    mpinEnabled: false,
    mpinHash: '',
    exportPasswordHash: '',
    ghostEnabled: false,
    autoLockTimer: 30, // Default 30 seconds
  })

  const [isLocked, setIsLocked] = useState(false)
  const [isGhostMode, setIsGhostMode] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(null)
  const [lastActiveTime, setLastActiveTime] = useState(Date.now())

  // Sync security metadata from Supabase user_metadata
  useEffect(() => {
    if (user?.user_metadata?.security) {
      const sec = user.user_metadata.security
      const newConfig = {
        mpinEnabled: !!sec.mpinEnabled,
        mpinHash: sec.mpinHash || '',
        exportPasswordHash: sec.exportPasswordHash || '',
        ghostEnabled: !!sec.ghostEnabled,
        autoLockTimer: typeof sec.autoLockTimer === 'number' ? sec.autoLockTimer : 30,
      }
      setSecurityConfig(newConfig)

      // Initial lock check if MPIN enabled and hasn't been unlocked in this session
      if (newConfig.mpinEnabled && newConfig.mpinHash) {
        setIsLocked(true)
      }
    } else {
      setSecurityConfig({
        mpinEnabled: false,
        mpinHash: '',
        exportPasswordHash: '',
        ghostEnabled: false,
        autoLockTimer: 30,
      })
      setIsLocked(false)
      setIsGhostMode(false)
    }
  }, [user])

  // Helper to update Supabase metadata
  const updateSecurityMetadata = useCallback(
    async (newSecData) => {
      if (!user) return
      const currentSec = user.user_metadata?.security || {}
      const updatedSec = { ...currentSec, ...newSecData }

      const { error } = await supabase.auth.updateUser({
        data: { security: updatedSec },
      })

      if (error) {
        console.error('[MARK Security] Failed to update security metadata:', error)
        throw error
      }

      setSecurityConfig((prev) => ({ ...prev, ...newSecData }))
    },
    [user]
  )

  // ─── Auto-Lock Background Timer Listener ────────────────────────────────────
  useEffect(() => {
    if (!securityConfig.mpinEnabled || !user) return

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setLastActiveTime(Date.now())
      } else {
        const inactiveSeconds = (Date.now() - lastActiveTime) / 1000
        const timeoutSeconds = securityConfig.autoLockTimer

        if (timeoutSeconds === 0 || inactiveSeconds >= timeoutSeconds) {
          setIsLocked(true)
          setIsGhostMode(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [securityConfig.mpinEnabled, securityConfig.autoLockTimer, lastActiveTime, user])

  // Unlock verification method
  const unlockApp = useCallback(
    async (pinInput) => {
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000)
        return { success: false, lockedOut: true, remaining }
      }

      const typedHash = await hashString(pinInput)

      // 1. Normal PIN Match
      if (typedHash === securityConfig.mpinHash) {
        setIsLocked(false)
        setIsGhostMode(false)
        setFailedAttempts(0)
        setLockoutUntil(null)
        return { success: true, ghost: false }
      }

      // 2. Ghost Mode Panic PIN Check
      // Condition: Ghost mode ON, entered PIN ends with '9', and length matches PIN length
      if (
        securityConfig.ghostEnabled &&
        pinInput.endsWith('9') &&
        securityConfig.mpinHash
      ) {
        // Try replacing the last digit '9' with digits 0-8 to check if prefix matches real PIN
        let isPanicMatch = false
        const prefix = pinInput.slice(0, -1)
        for (let d = 0; d <= 9; d++) {
          const candidateHash = await hashString(prefix + d)
          if (candidateHash === securityConfig.mpinHash) {
            isPanicMatch = true
            break
          }
        }

        if (isPanicMatch) {
          setIsLocked(false)
          setIsGhostMode(true)
          setFailedAttempts(0)
          setLockoutUntil(null)
          return { success: true, ghost: true }
        }
      }

      // 3. Invalid PIN -> Lockout handling
      const newFails = failedAttempts + 1
      setFailedAttempts(newFails)

      let lockoutTime = null
      if (newFails >= 5) {
        lockoutTime = Date.now() + 300000 // 5 minutes
        setLockoutUntil(lockoutTime)
      } else if (newFails >= 3) {
        lockoutTime = Date.now() + 30000 // 30 seconds
        setLockoutUntil(lockoutTime)
      }

      return {
        success: false,
        attempts: newFails,
        lockoutUntil: lockoutTime,
      }
    },
    [securityConfig, failedAttempts, lockoutUntil]
  )

  // Set New MPIN
  const setMpin = useCallback(
    async (newPin) => {
      const hash = await hashString(newPin)
      await updateSecurityMetadata({ mpinEnabled: true, mpinHash: hash })
    },
    [updateSecurityMetadata]
  )

  // Disable MPIN
  const disableMpin = useCallback(async () => {
    await updateSecurityMetadata({ mpinEnabled: false })
    setIsLocked(false)
    setIsGhostMode(false)
  }, [updateSecurityMetadata])

  // Change Existing MPIN
  const changeMpin = useCallback(
    async (oldPin, newPin) => {
      const oldHash = await hashString(oldPin)
      if (oldHash !== securityConfig.mpinHash) {
        throw new Error('Current MPIN is incorrect.')
      }
      await setMpin(newPin)
    },
    [securityConfig.mpinHash, setMpin]
  )

  // Set/Change Export Password
  const setExportPassword = useCallback(
    async (newPass) => {
      const hash = await hashString(newPass)
      await updateSecurityMetadata({ exportPasswordHash: hash })
    },
    [updateSecurityMetadata]
  )

  const verifyExportPassword = useCallback(
    async (passInput) => {
      if (!securityConfig.exportPasswordHash) return true
      const inputHash = await hashString(passInput)
      return inputHash === securityConfig.exportPasswordHash
    },
    [securityConfig.exportPasswordHash]
  )

  // Toggle Panic / Ghost Mode
  const toggleGhostMode = useCallback(
    async (enabled) => {
      await updateSecurityMetadata({ ghostEnabled: enabled })
    },
    [updateSecurityMetadata]
  )

  // Set Auto-Lock Timer
  const setAutoLockTimer = useCallback(
    async (seconds) => {
      await updateSecurityMetadata({ autoLockTimer: seconds })
    },
    [updateSecurityMetadata]
  )

  // Reset Security State (on Logout)
  const resetSecurityState = useCallback(() => {
    setIsLocked(false)
    setIsGhostMode(false)
    setFailedAttempts(0)
    setLockoutUntil(null)
  }, [])

  const value = useMemo(
    () => ({
      securityConfig,
      isLocked,
      isGhostMode,
      failedAttempts,
      lockoutUntil,
      unlockApp,
      setMpin,
      disableMpin,
      changeMpin,
      setExportPassword,
      verifyExportPassword,
      toggleGhostMode,
      setAutoLockTimer,
      resetSecurityState,
      setIsLocked,
    }),
    [
      securityConfig,
      isLocked,
      isGhostMode,
      failedAttempts,
      lockoutUntil,
      unlockApp,
      setMpin,
      disableMpin,
      changeMpin,
      setExportPassword,
      verifyExportPassword,
      toggleGhostMode,
      setAutoLockTimer,
      resetSecurityState,
    ]
  )

  return <SecurityContext.Provider value={value}>{children}</SecurityContext.Provider>
}

export function useSecurity() {
  const ctx = useContext(SecurityContext)
  if (!ctx) throw new Error('useSecurity must be used within SecurityProvider')
  return ctx
}
