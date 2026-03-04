/**
 * Matching & ranking configuration for Pulse semantic search.
 * Centralised here so all business rules live in one place.
 */

export interface MatchingWeights {
  similarity: number
  recency: number
  interaction: number
  keyword: number
}

// Absolute floor on raw cosine similarity — pre-ranking filter.
// Calibrated for distiluse-base-multilingual-cased-v2 on Italian short texts.
// Observed: same-topic work notes ~0.18–0.24, cross-domain (health/tech) ~0.01–0.11.
// Lowered from 0.15 to 0.10 to capture more conceptually-related notes on short texts.
export const MIN_SIMILARITY_THRESHOLD = 0.10

// Minimum composite score (after ranking weights) to show a suggestion.
export const MIN_COMPOSITE_SCORE = 0.30

// Thresholds that determine badge label
export const STRONG_MATCH_THRESHOLD = 0.25   // "strong match" — same topic, high confidence
export const CONCEPTUAL_MATCH_THRESHOLD = 0.15 // "conceptual match"

// How many suggestions to surface (3–6 per spec)
export const MIN_SUGGESTIONS = 3
export const MAX_SUGGESTIONS = 5

// Ranking formula weights (must sum to 1)
export const WEIGHT_SIMILARITY = 0.70
export const WEIGHT_RECENCY = 0.10
export const WEIGHT_INTERACTION = 0.10
export const WEIGHT_KEYWORD_BOOST = 0.10

// Recency: half-life in milliseconds (60 days)
export const RECENCY_HALF_LIFE_MS = 60 * 24 * 60 * 60 * 1000

// Debounce delay before triggering a semantic search (ms)
export const SEARCH_DEBOUNCE_MS = 400

// Minimum input length before triggering search
export const MIN_SEARCH_CHARS = 30

// Soft-archive: beats not viewed/modified for this many months get faded
export const SOFT_ARCHIVE_MONTHS = 3
