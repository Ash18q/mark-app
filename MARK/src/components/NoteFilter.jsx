import React from 'react'

export default function NoteFilter({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOrder,
  onToggleSortOrder,
  viewMode,
  onViewModeChange,
  selectedTag,
  onTagSelect,
  showArchived,
  onToggleArchived,
  allTags = []
}) {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-xs space-y-3 mb-5">
      
      {/* ── Search Input ── */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search notes, checklists, tags..."
          className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100 font-medium pr-8"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Controls Row: Sort + Active/Archive + View Mode Toggle ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100">
        
        {/* Sort By Date/Title Dropdown button */}
        <div className="flex items-center gap-2">
          
          {/* Sort By Date/Title Dropdown button */}
          <button
            type="button"
            onClick={() => {
              if (sortBy === 'date') {
                onSortChange('title')
              } else {
                onSortChange('date')
              }
            }}
            className="px-2.5 py-1 rounded-xl text-[11px] font-bold border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition cursor-pointer flex items-center gap-1"
            title="Toggle sort between Date & Name"
          >
            <span>Sort: {sortBy === 'date' ? 'Date' : 'Name'}</span>
            <span onClick={(e) => { e.stopPropagation(); onToggleSortOrder(); }} className="text-indigo-600 hover:scale-110">
              {sortOrder === 'desc' ? '↓' : '↑'}
            </span>
          </button>

          {/* Explicit 2-Tab Segment: Active Notes vs Archived Notes */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 text-[11px] font-bold">
            <button
              type="button"
              onClick={() => showArchived && onToggleArchived()}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                !showArchived
                  ? 'bg-white text-indigo-600 shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              📝 Active Notes
            </button>
            <button
              type="button"
              onClick={() => !showArchived && onToggleArchived()}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                showArchived
                  ? 'bg-purple-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-500 hover:text-purple-700'
              }`}
            >
              📦 Archived Notes
            </button>
          </div>

          {/* View Mode Grid/List Icon Segment */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1 rounded-lg transition cursor-pointer ${viewMode === 'grid' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1 rounded-lg transition cursor-pointer ${viewMode === 'list' ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
