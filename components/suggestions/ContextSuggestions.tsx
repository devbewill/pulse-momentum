'use client'

import { useState, useCallback } from 'react'
import type { BeatSuggestion } from '@/types'
import { SuggestionCard } from './SuggestionCard'

interface ContextSuggestionsProps {
  suggestions: BeatSuggestion[]
  isSearching: boolean
  onMerge: (selected: BeatSuggestion[]) => void
  onArchive: (ids: string[]) => void
}

export function ContextSuggestions({
  suggestions,
  isSearching,
  onMerge,
  onArchive,
}: ContextSuggestionsProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const handleSelect = useCallback((beatId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(beatId)) next.delete(beatId)
      else next.add(beatId)
      return next
    })
  }, [])

  const handleMerge = useCallback(() => {
    const selected = suggestions.filter((s) => selectedIds.has(s.beat._id))
    onMerge(selected)
    setSelectedIds(new Set())
  }, [suggestions, selectedIds, onMerge])

  const handleArchive = useCallback(() => {
    onArchive(Array.from(selectedIds))
    setSelectedIds(new Set())
  }, [selectedIds, onArchive])

  const allSelected = selectedIds.size === suggestions.length && suggestions.length > 0

  const handleToggleAll = useCallback(() => {
    setSelectedIds(allSelected ? new Set() : new Set(suggestions.map((s) => s.beat._id)))
  }, [allSelected, suggestions])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-2 pt-4">
      {/* Section header */}
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <span className="text-[12px] font-black uppercase tracking-[0.2em] text-zinc-400">
          Detected context
        </span>
        {isSearching && (
          <div className="h-3 w-3 animate-spin border-2 border-zinc-200 border-t-zinc-950" />
        )}
        {suggestions.length > 0 && !isSearching && (
          <span className="font-mono text-[12px] font-bold text-zinc-400">{suggestions.length}</span>
        )}
      </div>

      {/* Suggestion rows */}
      {suggestions.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {suggestions.map((s, i) => (
            <SuggestionCard
              key={s.beat._id}
              suggestion={s}
              index={i}
              isSelected={selectedIds.has(s.beat._id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Action bar */}
      {selectedIds.size > 0 && (
        <div className="mt-3 flex shrink-0 items-center gap-2 border-t border-zinc-100 pt-3">
          <button
            onClick={handleToggleAll}
            className="text-[13px] font-bold uppercase tracking-wider text-zinc-400 transition-colors hover:text-zinc-950"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
          <div className="flex-1" />
          <button
            onClick={handleMerge}
            className="border border-zinc-950 bg-zinc-950 px-3 py-2 text-[13px] font-black uppercase tracking-wider text-white transition-all hover:bg-white hover:text-zinc-950"
          >
            Merge {selectedIds.size > 1 ? `(${selectedIds.size})` : ''}
          </button>
          <button
            onClick={handleArchive}
            className="border border-zinc-200 px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-950 hover:text-zinc-950"
          >
            Archive
          </button>
        </div>
      )}
    </div>
  )
}
