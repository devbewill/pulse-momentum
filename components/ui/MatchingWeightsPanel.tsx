'use client'

import { useState } from 'react'
import { useMatchingWeights } from '@/hooks/useMatchingWeights'
import type { MatchingWeights } from '@/lib/config/matching'

interface MatchingWeightsPanelProps {
  onClose?: () => void
}

const WEIGHT_LABELS: Record<keyof MatchingWeights, string> = {
  similarity: 'Semantic Similarity',
  recency: 'Recency (how recent)',
  interaction: 'Interaction (views)',
  keyword: 'Keyword boost',
}

const WEIGHT_DESCRIPTIONS: Record<keyof MatchingWeights, string> = {
  similarity: 'How similar the content is semantically (pure match)',
  recency: 'Recent notes have a slight advantage',
  interaction: 'Notes viewed often have more weight',
  keyword: 'Additional boost for keywords in text',
}

export function MatchingWeightsPanel({ onClose }: MatchingWeightsPanelProps) {
  const { weights, updateWeight, reset } = useMatchingWeights()

  const handleSliderChange = (key: keyof MatchingWeights, value: number) => {
    updateWeight(key, value)
  }

  return (
    <div className="w-96 bg-white border border-zinc-200 rounded-sm shadow-lg p-5 max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-5 pb-4 border-b border-zinc-100">
        <h2 className="text-[13px] font-black uppercase tracking-widest text-zinc-950 mb-1">
          Matching Weights
        </h2>
        <p className="text-[11px] font-bold text-zinc-400">
          Customize how suggestions are ranked
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-6 mb-5">
        {(Object.keys(weights) as (keyof MatchingWeights)[]).map((key) => (
          <div key={key} className="space-y-2">
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

            {/* Always visible description */}
            <p className="text-[10px] font-bold text-zinc-500 italic min-h-[2em]">
              {WEIGHT_DESCRIPTIONS[key]}
            </p>
          </div>
        ))}
      </div>

      {/* Info + Reset */}
      <div className="border-t border-zinc-100 pt-4 space-y-3">
        <div className="bg-zinc-50 border border-zinc-100 p-2.5 rounded-sm">
          <p className="text-[10px] font-bold text-zinc-600">
            <span className="font-black">Note:</span> Weights auto-normalize to sum 1.0. Change a value and others adjust proportionally.
          </p>
        </div>

        {/* Reset button */}
        <button
          onClick={reset}
          className="w-full border border-zinc-200 px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-950 hover:text-zinc-950"
        >
          Reset defaults
        </button>

        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full border border-zinc-200 px-3 py-2 text-[12px] font-bold uppercase tracking-wider text-zinc-400 transition-all hover:border-zinc-950 hover:text-zinc-950"
          >
            Close
          </button>
        )}
      </div>
    </div>
  )
}
