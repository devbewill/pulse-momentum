import type { Beat, BeatSuggestion, MatchStrength } from '@/types'
import {
  STRONG_MATCH_THRESHOLD,
  CONCEPTUAL_MATCH_THRESHOLD,
  WEIGHT_SIMILARITY,
  WEIGHT_RECENCY,
  WEIGHT_INTERACTION,
  WEIGHT_KEYWORD_BOOST,
  RECENCY_HALF_LIFE_MS,
  type MatchingWeights,
} from '@/lib/config/matching'

/**
 * Normalise recency into [0, 1] using an exponential decay with a 30-day half-life.
 */
export function recencyScore(createdAt: number): number {
  const ageMs = Date.now() - createdAt
  return Math.exp((-Math.LN2 * ageMs) / RECENCY_HALF_LIFE_MS)
}

/**
 * Normalise interaction count into [0, 1] using a logarithmic scale.
 * 0 interactions → 0, 10 interactions → ~1.
 */
export function interactionScore(count: number): number {
  return Math.min(Math.log1p(count) / Math.log1p(10), 1)
}

/**
 * Simple keyword boost: count how many words in `query` appear verbatim in `content`.
 */
export function keywordBoost(query: string, content: string): number {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 3)
  if (queryWords.length === 0) return 0
  const contentLower = content.toLowerCase()
  const hits = queryWords.filter((w) => contentLower.includes(w)).length
  return hits / queryWords.length
}

/**
 * Compute the composite ranking score for a beat given its raw similarity.
 */
export function computeRankScore(
  beat: Beat,
  similarity: number,
  query: string
): number {
  return (
    WEIGHT_SIMILARITY * similarity +
    WEIGHT_RECENCY * recencyScore(beat.createdAt) +
    WEIGHT_INTERACTION * interactionScore(beat.interactionCount) +
    WEIGHT_KEYWORD_BOOST * keywordBoost(query, beat.content)
  )
}

/**
 * Determine badge label from raw cosine similarity.
 * Requires keyword overlap to qualify as "strong" — pure vector similarity
 * without any shared words is treated as conceptual only, given the narrow
 * score range of the multilingual model on short Italian texts.
 */
export function matchStrength(similarity: number, keywordScore = 0): MatchStrength {
  return similarity >= STRONG_MATCH_THRESHOLD && keywordScore > 0 ? 'strong' : 'conceptual'
}

/**
 * Rank a list of {beat, similarity} pairs and return BeatSuggestion[].
 * Each result carries a full ScoreBreakdown so the UI can explain the score.
 * Accepts optional custom weights; falls back to config constants.
 */
export function rankSuggestions(
  items: { beat: Beat; similarity: number }[],
  query: string,
  weights?: MatchingWeights
): BeatSuggestion[] {
  const w: MatchingWeights = weights ?? {
    similarity: WEIGHT_SIMILARITY,
    recency: WEIGHT_RECENCY,
    interaction: WEIGHT_INTERACTION,
    keyword: WEIGHT_KEYWORD_BOOST,
  }
  return items
    .map(({ beat, similarity }) => {
      const recency = recencyScore(beat.createdAt)
      const interaction = interactionScore(beat.interactionCount)
      const keyword = keywordBoost(query, beat.content)
      return {
        beat,
        score:
          w.similarity * similarity +
          w.recency * recency +
          w.interaction * interaction +
          w.keyword * keyword,
        matchStrength: matchStrength(similarity, keyword),
        breakdown: { similarity, recency, interaction, keyword },
      }
    })
    .sort((a, b) => b.score - a.score)
}

/**
 * Check if a similarity score qualifies as a conceptual match (above minimum threshold).
 */
export function isConceptualMatch(similarity: number): boolean {
  return similarity >= CONCEPTUAL_MATCH_THRESHOLD
}
