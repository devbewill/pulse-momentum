'use client'

import { useEffect, useRef, useCallback } from 'react'
import { BeatCard } from './BeatCard'
import type { Beat } from '@/types'

interface BeatFeedProps {
  beats: Beat[]
  isLoading: boolean
  canLoadMore: boolean
  onLoadMore: () => void
  onArchive: (id: string) => void
  highlightedId?: string | null
}

export function BeatFeed({
  beats,
  isLoading,
  canLoadMore,
  onLoadMore,
  onArchive,
  highlightedId,
}: BeatFeedProps) {
  const topSentinelRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Infinite scroll upward: load more when top sentinel comes into view
  useEffect(() => {
    if (!canLoadMore) return
    const sentinel = topSentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) onLoadMore()
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [canLoadMore, onLoadMore])

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-500" />
      </div>
    )
  }

  if (beats.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-zinc-500 select-none">
        <span className="text-4xl">✦</span>
        <p className="text-sm">Start writing your first pulse.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-y-auto">
      {/* Top sentinel for infinite scroll */}
      <div ref={topSentinelRef} className="h-4 shrink-0" />

      {canLoadMore && (
        <button
          onClick={onLoadMore}
          className="mx-auto mb-4 rounded-full bg-zinc-800 px-4 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
        >
          Load earlier
        </button>
      )}

      <div className="flex flex-col gap-1 px-2 pb-4">
        {beats.map((beat) => (
          <BeatCard
            key={beat._id}
            beat={beat}
            onArchive={onArchive}
            highlight={highlightedId === beat._id}
          />
        ))}
      </div>

      {/* Bottom anchor for auto-scroll */}
      <div ref={bottomRef} className="h-1 shrink-0" />
    </div>
  )
}
