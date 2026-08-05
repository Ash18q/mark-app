import React from 'react'

export function GhostModeChip() {
  return (
    <div className="fixed top-20 right-4 z-50 animate-bounce">
      <div className="bg-slate-900/90 text-white border border-rose-500/50 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold font-mono">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span>👻 Ghost Mode Active</span>
      </div>
    </div>
  )
}

export function GhostBadgeIcon({ children }) {
  return (
    <div className="relative inline-flex items-center justify-center">
      {children}
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
    </div>
  )
}
