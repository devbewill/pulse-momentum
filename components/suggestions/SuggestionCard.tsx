'use client'

import type { BeatSuggestion } from '@/types'
import { relativeTime } from '@/lib/utils/time'
import {
  WEIGHT_SIMILARITY,
  WEIGHT_RECENCY,
  WEIGHT_INTERACTION,
  WEIGHT_KEYWORD_BOOST,
} from '@/lib/config/matching'

interface SuggestionCardProps {
  suggestion: BeatSuggestion
  isSelected: boolean
  onSelect: (beatId: string) => void
  index: number
}

const BREAKDOWN_ROWS = [
  { key: 'SEM', fullName: 'SEMANTIC',    desc: 'How similar the content is semantically (vector embedding)', weight: WEIGHT_SIMILARITY,    field: 'similarity'  as const },
  { key: 'REC', fullName: 'RECENCY',     desc: 'Recent notes are more relevant (exponential decay from today)',  weight: WEIGHT_RECENCY,       field: 'recency'     as const },
  { key: 'KWD', fullName: 'KEYWORD',     desc: 'Bonus if query words appear in the note (text match)',  weight: WEIGHT_KEYWORD_BOOST, field: 'keyword'     as const },
  { key: 'INT', fullName: 'INTERACTION', desc: 'Notes you consulted more often have more weight (usage frequency)',     weight: WEIGHT_INTERACTION,   field: 'interaction' as const },
]

export function SuggestionCard({ suggestion, isSelected, onSelect, index }: SuggestionCardProps) {
  const { beat, score, matchStrength, breakdown } = suggestion

  return (
    <button
      onClick={() => onSelect(beat._id)}
      className={[
        'suggestion-enter group relative flex w-full flex-col border-[5px] border-zinc-950 px-4 py-3.5 text-left transition-all duration-100',
        isSelected
          ? 'bg-zinc-950 text-white'
          : 'bg-white hover:bg-zinc-50',
      ].join(' ')}
      style={{ animationDelay: `${index * 40}ms` }}
      data-score={score.toFixed(4)}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-2">
        {/* Match strength */}
        <span
          className={[
            'text-[12px] font-black uppercase tracking-widest',
            isSelected ? 'text-white/70' : (matchStrength === 'strong' ? 'text-zinc-950' : 'text-zinc-400'),
          ].join(' ')}
        >
          {matchStrength === 'strong' ? 'Strong Match' : 'Conceptual'}
        </span>
        <span className={isSelected ? 'text-white/30' : 'text-zinc-300'}>·</span>
        <span className={['text-[12px] font-bold', isSelected ? 'text-white/50' : 'text-zinc-400'].join(' ')}>
          {relativeTime(beat.createdAt)}
        </span>

        {/* Composite score badge */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className="font-mono text-[13px] font-black tabular-nums px-2 py-0.5 text-zinc-950"
            style={{ background: 'var(--neon)' }}
          >
            {score.toFixed(2)}
          </span>
          {/* Selection indicator */}
          <div
            className={[
              'flex h-5 w-5 shrink-0 items-center justify-center border transition-all duration-100',
              isSelected
                ? 'border-white bg-transparent'
                : 'border-zinc-300 opacity-0 group-hover:opacity-60',
            ].join(' ')}
          >
            {isSelected && (
              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="m2 6 3 3 5-5" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* ── Image ── */}
      {beat.attachmentUrl && beat.attachmentType === 'image' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={beat.attachmentUrl} alt="" className="mt-2.5 h-20 w-full object-cover" />
      )}

      {/* ── Content ── */}
      <p className={[
        'mt-3 line-clamp-2 text-[17px] leading-[1.6] font-bold',
        isSelected ? 'text-white/80' : 'text-zinc-800',
      ].join(' ')}>
        {beat.content}
      </p>

      {/* ── Score breakdown ── */}
      <div className={['mt-4 border-t pt-3', isSelected ? 'border-white/10' : 'border-zinc-100'].join(' ')}>
        {/* Description */}
        <p className={['mb-4 text-[10px] leading-snug', isSelected ? 'text-white/50' : 'text-zinc-600'].join(' ')}>
          Score = weighted sum of 4 metrics. Each metric is normalized (0–1), multiplied by its weight, then summed.
        </p>

        {/* Component bars — 1-col, full names + descriptions */}
        <div className="flex flex-col gap-3 mb-4">
          {BREAKDOWN_ROWS.map(({ key, fullName, desc, weight, field }) => {
            const raw = breakdown[field]
            const contribution = raw * weight
            return (
              <div key={key} title={`${raw.toFixed(3)} × ${weight} = ${contribution.toFixed(3)}`}>
                <div className="mb-1 flex items-baseline justify-between gap-2">
                  <div className="flex flex-col">
                    <span className={['font-mono text-[11px] font-black uppercase tracking-widest leading-none', isSelected ? 'text-white/70' : 'text-zinc-700'].join(' ')}>
                      {fullName}
                    </span>
                    <span className={['mt-0.5 text-[10px] leading-tight font-medium', isSelected ? 'text-white/40' : 'text-zinc-700'].join(' ')}>
                      {desc}
                    </span>
                  </div>
                  <span className={['shrink-0 font-mono text-[12px] font-black tabular-nums', isSelected ? 'text-white/70' : 'text-zinc-700'].join(' ')}>
                    {contribution.toFixed(2)}
                  </span>
                </div>
                <div className={['h-1.5 overflow-hidden', isSelected ? 'bg-white/10' : 'bg-zinc-100'].join(' ')}>
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${raw * 100}%`,
                      background: isSelected ? 'rgba(255,255,255,0.6)' : 'var(--neon)',
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Formula */}
        <div className="border-t pt-3" style={{ borderColor: isSelected ? 'rgba(255,255,255,0.1)' : '#f3f4f6' }}>
          <p className={['mb-2 font-mono text-[9px] font-black uppercase tracking-widest', isSelected ? 'text-white/40' : 'text-zinc-600'].join(' ')}>
            {`Formula: Σ = ${BREAKDOWN_ROWS.map(r => `${r.weight}×${r.key}`).join(' + ')}`}
          </p>
          <div className="flex items-center justify-between">
            <span className={['text-[10px] font-bold', isSelected ? 'text-white/50' : 'text-zinc-500'].join(' ')}>Match Score</span>
            <span
              className="font-mono text-[14px] font-black tabular-nums px-2.5 py-1 text-zinc-950"
              style={{ background: 'var(--neon)' }}
            >
              {score.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}
