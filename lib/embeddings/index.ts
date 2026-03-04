/**
 * Pulse – Embedding Service
 *
 * Strategy decision: LOCAL model (all-MiniLM-L6-v2 via @xenova/transformers)
 *
 * Rationale vs API:
 * ┌──────────────────┬───────────────────────┬──────────────────────┐
 * │                  │ Local (transformers.js)│ API (OpenAI/Voyage)  │
 * ├──────────────────┼───────────────────────┼──────────────────────┤
 * │ Latency          │ ~50ms after warmup     │ ~200–400ms + network │
 * │ Cost             │ Free                   │ Pay-per-token        │
 * │ Privacy          │ Data stays on device   │ Sent to external API │
 * │ Offline support  │ Yes (PWA goal)         │ No                   │
 * │ Vector dimension │ 384                    │ 1536 (OpenAI small)  │
 * │ Quality          │ Good for short text    │ Slightly better      │
 * └──────────────────┴───────────────────────┴──────────────────────┘
 *
 * Winner: LOCAL – aligns with offline-first PWA goal, no cost, better UX.
 * The interface is provider-agnostic; swap generateEmbedding() to switch.
 */

import type { FeatureExtractionPipeline } from '@xenova/transformers'

// distiluse-base-multilingual-cased-v2: 512-dim, multilingual STS model.
// Trained on semantic textual similarity tasks — separates by topic, not just structure.
const MODEL_ID = 'Xenova/distiluse-base-multilingual-cased-v2'
export const EMBEDDING_DIM = 768

let pipeline: FeatureExtractionPipeline | null = null
let loadingPromise: Promise<FeatureExtractionPipeline> | null = null

async function getPipeline(): Promise<FeatureExtractionPipeline> {
  if (pipeline) return pipeline

  if (!loadingPromise) {
    loadingPromise = (async () => {
      // Dynamic import keeps the heavy WASM bundle out of the initial JS chunk
      const { pipeline: createPipeline } = await import('@xenova/transformers')
      const p = await createPipeline('feature-extraction', MODEL_ID, {
        quantized: true, // ~25 MB quantised vs ~90 MB full
      })
      pipeline = p as FeatureExtractionPipeline
      return pipeline
    })()
  }

  return loadingPromise
}

/**
 * Generate a 384-dimensional embedding for the given text.
 * The model is lazily loaded on first call and then cached for the session.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot embed empty text')
  }
  const pipe = await getPipeline()
  const output = await pipe(text.trim(), { pooling: 'mean', normalize: true })
  return Array.from(output.data as Float32Array)
}

/**
 * Cosine similarity between two equal-length vectors.
 * Used client-side for fast pre-filtering before the Convex vector query.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Warm up the embedding model in the background.
 * Call this on app mount so the first user search is instant.
 */
export function warmupEmbeddingModel(): void {
  getPipeline().catch(() => {
    // Warmup failure is non-fatal; will retry on first real call
  })
}
