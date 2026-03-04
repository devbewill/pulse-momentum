import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

/**
 * Pulse – Convex schema
 *
 * Embedding dimension: 512 (distiluse-base-multilingual-cased-v2 via transformers.js)
 * This matches the local model used in lib/embeddings/index.ts.
 * If switching to OpenAI text-embedding-3-small (1536-dim), update
 * EMBEDDING_DIMENSION and re-deploy.
 */
export const EMBEDDING_DIMENSION = 768

export default defineSchema({
  beats: defineTable({
    // Core content
    content: v.string(),

    // Vector embedding for semantic search (float64 array, length = EMBEDDING_DIMENSION)
    embedding: v.optional(v.array(v.float64())),

    // Timestamps (Unix ms) – createdAt mirrors _creationTime but is explicit
    createdAt: v.number(),
    updatedAt: v.number(),

    // Input method
    inputType: v.union(v.literal('text'), v.literal('voice'), v.literal('attachment')),

    // Optional attachment (max 1 per beat as per spec)
    attachmentUrl: v.optional(v.string()),
    attachmentType: v.optional(
      v.union(v.literal('image'), v.literal('file'), v.literal('link'))
    ),
    attachmentName: v.optional(v.string()),

    // Soft-archive state
    isArchived: v.boolean(),
    lastViewedAt: v.optional(v.number()),

    // Interaction tracking for ranking
    interactionCount: v.number(),

    // User-applied tags
    tags: v.optional(v.array(v.string())),
  })
    // Vector index for semantic similarity search
    .vectorIndex('by_embedding', {
      vectorField: 'embedding',
      dimensions: EMBEDDING_DIMENSION,
      filterFields: ['isArchived'],
    })
    // Standard indexes for feed queries
    .index('by_created', ['isArchived', 'createdAt'])
    .index('by_last_viewed', ['isArchived', 'lastViewedAt']),
})
