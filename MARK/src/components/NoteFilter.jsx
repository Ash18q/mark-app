import { useState } from 'react'

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
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  return (
    <div className="space-y-3 mb-6">
      {/* ── Top Bar: Search + Sort + View Toggle ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search notes, checklists, tags..."
            className="w-full pl-9 pr-8 py-2 text-sm bg-white/90 backdrop-blur border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition shadow-2xs text-gray-800 placeholder-gray-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          
          {/* Sort Button (Name) */}
          <button
            onClick={() => {
              if (sortBy === 'title') {
                onToggleSortOrder()
              } else {
                onSortChange('title')
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1 cursor-pointer select-none ${
              sortBy === 'title'
                ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title="Sort by Title"
          >
            <span>Name</span>
            <span>{sortBy === 'title' ? (sortOrder === 'asc' ? '↑' : '↓') : '↕'}</span>
          </button>

          {/* Sort Button (Date) */}
          <button
            onClick={() => {
              if (sortBy === 'date') {
                onToggleSortOrder()
              } else {
                onSortChange('date')
              }
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1 cursor-pointer select-none ${
              sortBy === 'date'
                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
            }`}
            title="Sort by Date"
          >
            <span>Date</span>
            <span>{sortBy === 'date' ? (sortOrder === 'desc' ? '🆕' : '⌛') : '↕'}</span>
          </button>

          {/* View Mode Toggle Button */}
          <button
            onClick={() => onViewModeChange(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-800 text-white border border-gray-900 shadow-2xs hover:bg-gray-900 transition flex items-center gap-1.5 cursor-pointer select-none"
            title={viewMode === 'grid' ? 'Switch to List View' : 'Switch to Grid View'}
          >
            <span>{viewMode === 'grid' ? 'Grid ▦' : 'List ☰'}</span>
          </button>

          {/* Archive Toggle Button */}
          <button
            onClick={onToggleArchived}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition cursor-pointer ${
              showArchived
                ? 'bg-purple-600 text-white border-purple-700'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
            title={showArchived ? 'Show Active Notes' : 'Show Archived Notes'}
          >
            📦
          </button>
        </div>
      </div>

      {/* ── Tag Chips Filter ── */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
          <span className="text-gray-400 font-medium shrink-0 text-[11px] uppercase tracking-wider">Tags:</span>
          <button
            onClick={() => onTagSelect('')}
            className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
              !selectedTag
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagSelect(selectedTag === tag ? '' : tag)}
              className={`px-2.5 py-1 rounded-full font-medium transition cursor-pointer shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              🏷️ {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
