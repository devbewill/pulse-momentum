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
  { key: 'SEM', fullName: 'SEMANTIC',    desc: 'similarità vettoriale tra embedding', weight: WEIGHT_SIMILARITY,    field: 'similarity'  as const },
  { key: 'REC', fullName: 'RECENCY',     desc: 'decadimento esponenziale nel tempo',  weight: WEIGHT_RECENCY,       field: 'recency'     as const },
  { key: 'KWD', fullName: 'KEYWORD',     desc: 'overlap di parole chiave nel testo',  weight: WEIGHT_KEYWORD_BOOST, field: 'keyword'     as const },
  { key: 'INT', fullName: 'INTERACTION', desc: 'frequenza di accesso e utilizzo',     weight: WEIGHT_INTERACTION,   field: 'interaction' as const },
]

export function SuggestionCard({ suggestion, isSelected, onSelect, index }: SuggestionCardProps) {
  const { beat, score, matchStrength, breakdown } = suggestion

  return (
    <button
      onClick={() => onSelect(beat._id)}
      className={[
        'suggestion-enter group relative flex w-full flex-col border px-4 py-3.5 text-left transition-all duration-100',
        isSelected
          ? 'border-zinc-950 bg-zinc-950 text-white'
          : 'border-zinc-200 bg-white hover:border-zinc-950',
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
          {matchStrength === 'strong' ? 'Match Forte' : 'Concettuale'}
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
        {/* Formula */}
        <p className={['mb-3 font-mono text-[10px] uppercase tracking-widest', isSelected ? 'text-white/30' : 'text-zinc-300'].join(' ')}>
          {`Σ = ${BREAKDOWN_ROWS.map(r => `${r.weight}×${r.key}`).join(' + ')}`}
        </p>

        {/* Component bars — 1-col, full names + descriptions */}
        <div className="flex flex-col gap-3">
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
                    <span className={['mt-0.5 text-[10px] leading-tight', isSelected ? 'text-white/35' : 'text-zinc-400'].join(' ')}>
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

        {/* Sum line */}
        <div className="mt-3 flex items-center gap-2">
          <div className={['h-px flex-1', isSelected ? 'bg-white/10' : 'bg-zinc-100'].join(' ')} />
          <span className={['font-mono text-[10px] font-bold', isSelected ? 'text-white/40' : 'text-zinc-400'].join(' ')}>TOTALE</span>
          <span
            className="font-mono text-[13px] font-black tabular-nums px-2 py-0.5 text-zinc-950"
            style={{ background: 'var(--neon)' }}
          >
            {score.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  )
}
