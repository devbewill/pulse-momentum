'use client'

import { useCallback } from 'react'
import type { Beat } from '@/types'
import { relativeTime } from '@/lib/utils/time'
import { SOFT_ARCHIVE_MONTHS } from '@/lib/config/matching'

interface BeatCardProps {
  beat: Beat
  onArchive?: (id: string) => void
  highlight?: boolean
}

const INPUT_ICONS: Record<Beat['inputType'], string> = {
  text: '',
  voice: '🎙',
  attachment: '📎',
}

function isSoftFaded(beat: Beat): boolean {
  if (beat.isArchived) return true
  const thresholdMs = SOFT_ARCHIVE_MONTHS * 30 * 24 * 60 * 60 * 1000
  const ref = beat.lastViewedAt ?? beat.createdAt
  return Date.now() - ref > thresholdMs
}

export function BeatCard({ beat, onArchive, highlight }: BeatCardProps) {
  const faded = isSoftFaded(beat)

  const handleArchive = useCallback(() => {
    onArchive?.(beat._id)
  }, [beat._id, onArchive])

  return (
    <article
      id={`beat-${beat._id}`}
      data-beat-id={beat._id}
      className={[
        'group relative rounded-lg px-4 py-3 transition-opacity',
        faded ? 'opacity-40 hover:opacity-70' : 'opacity-100',
        highlight ? 'beat-highlighted' : '',
      ].join(' ')}
    >
      {/* Main content */}
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-100 break-words">
        {beat.content}
      </p>

      {/* Attachment preview */}
      {beat.attachmentUrl && beat.attachmentType === 'image' && (
        <a href={beat.attachmentUrl} target="_blank" rel="noreferrer" className="mt-2 block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beat.attachmentUrl}
            alt="attachment"
            className="max-h-48 rounded-md object-cover"
          />
        </a>
      )}
      {beat.attachmentUrl && beat.attachmentType === 'link' && (
        <a
          href={beat.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-violet-400 hover:underline"
        >
          🔗 {beat.attachmentName ?? beat.attachmentUrl}
        </a>
      )}
      {beat.attachmentUrl && beat.attachmentType === 'file' && (
        <a
          href={beat.attachmentUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
        >
          📄 {beat.attachmentName ?? 'file'}
        </a>
      )}

      {/* Footer: time + type icon + archive action */}
      <footer className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          {INPUT_ICONS[beat.inputType] && (
            <span title={beat.inputType}>{INPUT_ICONS[beat.inputType]}</span>
          )}
          {relativeTime(beat.createdAt)}
        </span>

        <button
          onClick={handleArchive}
          className="hidden group-hover:inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300 transition-colors"
          title="Archive"
        >
          Archive
        </button>
      </footer>
    </article>
  )
}
