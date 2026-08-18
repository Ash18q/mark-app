import React, { useMemo } from 'react'

export default function MindMapModal2({ note, onClose }) {
  if (!note) return null

  // Parse markdown headings and bullet items into a tree structure
  const nodes = useMemo(() => {
    const lines = (note.content || '').split('\n').filter(l => l.trim().length > 0)
    const tree = {
      title: note.title || 'Untitled Note',
      children: []
    }

    let currentSection = null

    lines.forEach(line => {
      const trimmed = line.trim()
      if (trimmed.startsWith('# ')) {
        const item = { title: trimmed.replace(/^#\s+/, ''), children: [] }
        tree.children.push(item)
        currentSection = item
      } else if (trimmed.startsWith('## ')) {
        const item = { title: trimmed.replace(/^##\s+/, ''), children: [] }
        if (currentSection) {
          currentSection.children.push(item)
        } else {
          tree.children.push(item)
          currentSection = item
        }
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('1. ')) {
        const itemText = trimmed.replace(/^[-*1-9.]+\s+/, '')
        if (currentSection) {
          currentSection.children.push({ title: itemText, children: [] })
        } else {
          tree.children.push({ title: itemText, children: [] })
        }
      } else if (trimmed.length > 0 && !currentSection) {
        if (tree.children.length < 6) {
          tree.children.push({ title: trimmed.slice(0, 40) + (trimmed.length > 40 ? '...' : ''), children: [] })
        }
      }
    })

    if (tree.children.length === 0 && note.content) {
      tree.children.push({ title: note.content.slice(0, 50) + '...', children: [] })
    }

    return tree
  }, [note])

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧠</span>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Mind Map &amp; Outline</h3>
              <p className="text-[11px] text-indigo-100 font-medium">{note.title || 'Untitled Note'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-sm transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mind Map Tree Display Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/70">
          <div className="flex flex-col items-center gap-6">
            {/* Root Central Node */}
            <div className="px-6 py-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-sm rounded-2xl shadow-md text-center max-w-xs ring-4 ring-indigo-100">
              📌 {nodes.title}
            </div>

            {/* Connecting Vertical Line */}
            {nodes.children.length > 0 && (
              <div className="w-0.5 h-6 bg-indigo-300" />
            )}

            {/* Level 1 Branch Nodes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {nodes.children.map((child, idx) => (
                <div key={idx} className="bg-white border border-indigo-100 p-4 rounded-2xl shadow-xs relative flex flex-col gap-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-900">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />
                    <span>{child.title}</span>
                  </div>

                  {/* Level 2 Sub-children */}
                  {child.children && child.children.length > 0 && (
                    <div className="pl-4 border-l-2 border-indigo-100 flex flex-col gap-1.5 mt-1">
                      {child.children.map((sub, sIdx) => (
                        <div key={sIdx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <span className="text-indigo-400 font-bold">›</span>
                          <span>{sub.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-100 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
          >
            Close Mind Map
          </button>
        </div>
      </div>
    </div>
  )
}
