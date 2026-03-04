'use client'

import { useState, useCallback } from 'react'
import {
  WEIGHT_SIMILARITY,
  WEIGHT_RECENCY,
  WEIGHT_INTERACTION,
  WEIGHT_KEYWORD_BOOST,
  type MatchingWeights,
} from '@/lib/config/matching'

export type { MatchingWeights }

const STORAGE_KEY = 'pulse:matching-weights'

export const DEFAULT_WEIGHTS: MatchingWeights = {
  similarity: WEIGHT_SIMILARITY,
  recency: WEIGHT_RECENCY,
  interaction: WEIGHT_INTERACTION,
  keyword: WEIGHT_KEYWORD_BOOST,
}

function loadWeights(): MatchingWeights {
  if (typeof window === 'undefined') return DEFAULT_WEIGHTS
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_WEIGHTS
    const p = JSON.parse(raw)
    if (
      typeof p.similarity === 'number' &&
      typeof p.recency === 'number' &&
      typeof p.interaction === 'number' &&
      typeof p.keyword === 'number'
    ) return p
  } catch {}
  return DEFAULT_WEIGHTS
}

export function useMatchingWeights() {
  const [weights, setWeights] = useState<MatchingWeights>(loadWeights)

  const updateWeight = useCallback((key: keyof MatchingWeights, value: number) => {
    setWeights((prev) => {
      const clamped = Math.max(0, Math.min(1, value))
      const remaining = Math.round((1 - clamped) * 100) / 100
      const otherKeys = (Object.keys(prev) as (keyof MatchingWeights)[]).filter((k) => k !== key)
      const otherSum = otherKeys.reduce((s, k) => s + prev[k], 0)
      const next: MatchingWeights = { ...prev, [key]: clamped }
      if (otherSum > 0) {
        const scale = remaining / otherSum
        let distributed = 0
        otherKeys.forEach((k, i) => {
          if (i < otherKeys.length - 1) {
            const v = Math.round(prev[k] * scale * 100) / 100
            next[k] = v
            distributed += v
          } else {
            // Last key absorbs rounding error
            next[k] = Math.round((remaining - distributed) * 100) / 100
          }
        })
      } else {
        const share = Math.round((remaining / otherKeys.length) * 100) / 100
        otherKeys.forEach((k) => { next[k] = share })
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const reset = useCallback(() => {
    setWeights(DEFAULT_WEIGHTS)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { weights, updateWeight, reset }
}
