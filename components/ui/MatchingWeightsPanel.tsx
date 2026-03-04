'use client'

import { useState } from 'react'
import { useMatchingWeights } from '@/hooks/useMatchingWeights'
import type { MatchingWeights } from '@/lib/config/matching'

interface MatchingWeightsPanelProps {
  onClose?: () => void
}

const WEIGHT_LABELS: Record<keyof MatchingWeights, string> = {
  similarity: 'Similarità semantica',
  recency: 'Recency (quanto recente)',
  interaction: 'Interazione (visualizzazioni)',
  keyword: 'Keyword boost',
}

const WEIGHT_DESCRIPTIONS: Record<keyof MatchingWeights, string> = {
  similarity: 'Quanto il contenuto è simile semanticamente (match puro)',
  recency: 'Le note recenti hanno un leggero vantaggio',
  interaction: 'Le note visualizzate spesso hanno più peso',
  keyword: 'Boost aggiuntivo per keyword nel testo',
}

export function MatchingWeightsPanel({ onClose }: MatchingWeightsPanelProps) {
  const { weights, updateWeight, reset } = useMatchingWeights()
  const [hoveredKey, setHoveredKey] = useState<keyof MatchingWeights | null>(null)

  const handleSliderChange = (key: keyof MatchingWeights, value: number) => {
    updateWeight(key, value)
  }

  return (
    <div className="w-80 bg-white border border-zinc-200 rounded-sm shadow-lg p-5">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-zinc-100">
        <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-950 mb-1">
          Pesi di Matching
        </h2>
        <p className="text-[11px] font-bold text-zinc-400">
          Personalizza come i suggerimenti vengono rankati
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-5">
        {(Object.keys(weights) as (keyof MatchingWeights)[]).map((key) => (
          <div
            key={key}
            onMouseEnter={() => setHoveredKey(key)}
            onMouseLeave={() => setHoveredKey(null)}
            className="space-y-2"
          >
            {/* Label + value */}
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-bold uppercase tracking-wider text-zinc-950">
                {WEIGHT_LABELS[key]}
              </label>
              <span className="font-mono text-[11px] font-black text-zinc-400">
                {(weights[key] * 100).toFixed(0)}%
              </span>
            </div>

            {/* Slider */}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={weights[key]}
              onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
              className="w-full h-2 bg-zinc-100 rounded-sm appearance-none cursor-pointer accent-[var(--neon)]"
            />

            {/* Hover description */}
            {hoveredKey === key && (
              <p className="text-[10px] font-bold text-zinc-500 italic">
                {WEIGHT_DESCRIPTIONS[key]}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Info + Reset */}
      <div className="border-t border-zinc-100 pt-4 space-y-3">
        <div className="bg-zinc-50 border border-zinc-100 p-2.5 rounded-sm">
          <p className="text-[10px] font-bold text-zinc-600">
            <span className="font-black">Nota:</span> I pesi si auto-normalizzano a somma 1.0. Cambia un valore e gli altri si adeguano proporzionalmente.
          </p>
        </div>

        {/* Reset button */}
        <button
          onClick={reset}
          className="w-full border border-zinc-200 px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-950 hover:text-zinc-950"
        >
          Ripristina default
        </button>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full border border-zinc-200 px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:border-zinc-950 hover:text-zinc-950"
          >
            Chiudi
          </button>
        )}
      </div>
    </div>
  )
}
