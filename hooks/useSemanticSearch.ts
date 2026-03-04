'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useAction } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { generateEmbedding } from '@/lib/embeddings'
import { rankSuggestions } from '@/lib/utils/ranking'
import { useMatchingWeights } from '@/hooks/useMatchingWeights'
import type { Beat, BeatSuggestion } from '@/types'
import {
  SEARCH_DEBOUNCE_MS,
  MIN_SEARCH_CHARS,
  MIN_SIMILARITY_THRESHOLD,
  MIN_COMPOSITE_SCORE,
  MAX_SUGGESTIONS,
} from '@/lib/config/matching'

export function useSemanticSearch(query: string) {
  const { weights } = useMatchingWeights()
  // Memoize weights to avoid causing infinite loops in useEffect deps
  const weightsKey = useMemo(() => JSON.stringify(weights), [weights.similarity, weights.recency, weights.interaction, weights.keyword])
  console.log('[Pulse] useSemanticSearch render, query length:', query.length)
  const [suggestions, setSuggestions] = useState<BeatSuggestion[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const abortRef = useRef<boolean>(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const searchSimilar = useAction(api.beats.searchSimilarAction)

  useEffect(() => {
    const trimmed = query.trim()
    console.log('[Pulse] effect fired, trimmed length:', trimmed.length, '/ min:', MIN_SEARCH_CHARS)

    if (timerRef.current) clearTimeout(timerRef.current)

    if (trimmed.length < MIN_SEARCH_CHARS) {
      setSuggestions([])
      return
    }

    console.log('[Pulse] scheduling search in', SEARCH_DEBOUNCE_MS, 'ms')
    timerRef.current = setTimeout(async () => {
      abortRef.current = false
      setIsSearching(true)

      try {
        console.log('[Pulse] Generating embedding for:', trimmed)
        const embedding = await generateEmbedding(trimmed)
        console.log('[Pulse] Embedding OK, dim:', embedding.length)
        if (abortRef.current) return

        const rawResults: { beat: Beat; score: number }[] = await searchSimilar({
          embedding,
          limit: MAX_SUGGESTIONS * 2,
        })
        console.log('[Pulse] Raw results:', rawResults.map(r => ({ score: r.score.toFixed(3), content: r.beat.content.slice(0, 40) })))
        if (abortRef.current) return

        const filtered = rawResults.filter((r) => r.score >= MIN_SIMILARITY_THRESHOLD)

        const ranked = rankSuggestions(
          filtered.map((r) => ({ beat: r.beat, similarity: r.score })),
          trimmed,
          weights
        )
          .filter((s) => s.score >= MIN_COMPOSITE_SCORE)
          .slice(0, MAX_SUGGESTIONS)

        console.log('[Pulse] After composite filter (>=', MIN_COMPOSITE_SCORE, '):', ranked.length, 'results')
        setSuggestions(ranked)
      } catch (err) {
        console.error('[Pulse] Search error:', err)
        setSuggestions([])
      } finally {
        if (!abortRef.current) setIsSearching(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      abortRef.current = true
    }
  }, [query, searchSimilar, weightsKey])

  return { suggestions, isSearching }
}
