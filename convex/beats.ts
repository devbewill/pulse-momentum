import { v } from 'convex/values'
import { mutation, query, action } from './_generated/server'
import { paginationOptsValidator } from 'convex/server'
import { api } from './_generated/api'
import type { Beat } from '../types'
import { MAX_SUGGESTIONS } from '../lib/config/matching'

// ─── Mutations ────────────────────────────────────────────────────────────────

/**
 * Create a new beat.
 * Embedding is generated client-side and passed in; this keeps Convex functions
 * pure and avoids loading the WASM model inside a Convex action.
 */
export const createBeat = mutation({
  args: {
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
    inputType: v.union(v.literal('text'), v.literal('voice'), v.literal('attachment')),
    attachmentUrl: v.optional(v.string()),
    attachmentType: v.optional(
      v.union(v.literal('image'), v.literal('file'), v.literal('link'))
    ),
    attachmentName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    const id = await ctx.db.insert('beats', {
      content: args.content,
      embedding: args.embedding,
      inputType: args.inputType,
      attachmentUrl: args.attachmentUrl,
      attachmentType: args.attachmentType,
      attachmentName: args.attachmentName,
      isArchived: false,
      interactionCount: 0,
      createdAt: now,
      updatedAt: now,
    })
    return id
  },
})

/**
 * Update the content (and optionally the embedding) of an existing beat.
 */
export const updateBeat = mutation({
  args: {
    id: v.id('beats'),
    content: v.string(),
    embedding: v.optional(v.array(v.float64())),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      content: args.content,
      embedding: args.embedding,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Archive or unarchive a beat (soft-delete).
 */
export const archiveBeat = mutation({
  args: {
    id: v.id('beats'),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isArchived: args.archived ?? true,
      updatedAt: Date.now(),
    })
  },
})

/**
 * Record that the user interacted with a beat (clicked a suggestion card).
 * Increments interactionCount and updates lastViewedAt.
 */
export const trackInteraction = mutation({
  args: { id: v.id('beats') },
  handler: async (ctx, args) => {
    const beat = await ctx.db.get(args.id)
    if (!beat) return
    await ctx.db.patch(args.id, {
      interactionCount: beat.interactionCount + 1,
      lastViewedAt: Date.now(),
    })
  },
})

/**
 * Update the tags of an existing beat.
 */
export const updateTags = mutation({
  args: { id: v.id('beats'), tags: v.array(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { tags: args.tags, updatedAt: Date.now() })
  },
})

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Paginated list of beats for the main feed, ordered newest-first.
 * Excludes archived beats by default.
 */
export const listBeats = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const includeArchived = args.includeArchived ?? false

    return ctx.db
      .query('beats')
      .withIndex('by_created', (q) =>
        includeArchived ? q : q.eq('isArchived', false)
      )
      .order('desc')
      .paginate(args.paginationOpts)
  },
})

/**
 * Aggregate stats for the sidebar counters.
 */
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - 7)
    weekStart.setHours(0, 0, 0, 0)

    const [totalDocs, weekDocs, todayDocs] = await Promise.all([
      ctx.db
        .query('beats')
        .withIndex('by_created', (q) => q.eq('isArchived', false))
        .collect(),
      ctx.db
        .query('beats')
        .withIndex('by_created', (q) =>
          q.eq('isArchived', false).gte('createdAt', weekStart.getTime())
        )
        .collect(),
      ctx.db
        .query('beats')
        .withIndex('by_created', (q) =>
          q.eq('isArchived', false).gte('createdAt', todayStart.getTime())
        )
        .collect(),
    ])

    return {
      total: totalDocs.length,
      week: weekDocs.length,
      today: todayDocs.length,
    }
  },
})

/**
 * Get a single beat by ID.
 */
export const getBeat = query({
  args: { id: v.id('beats') },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id)
  },
})

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Vector similarity search. Must be an action because ctx.vectorSearch()
 * is only available in action context (not queries).
 */
export const searchSimilarAction = action({
  args: {
    embedding: v.array(v.float64()),
    limit: v.optional(v.number()),
    excludeId: v.optional(v.id('beats')),
  },
  handler: async (ctx, args): Promise<{ beat: Beat; score: number }[]> => {
    const limit = args.limit ?? MAX_SUGGESTIONS

    const vectorResults = await ctx.vectorSearch('beats', 'by_embedding', {
      vector: args.embedding,
      limit: limit * 2,
      filter: (q) => q.eq('isArchived', false),
    })

    // Preserve the real cosine similarity score (_score) from Convex
    const scoreById = new Map(vectorResults.map((r) => [r._id.toString(), r._score]))

    const docs = await Promise.all(
      vectorResults.map((r) => ctx.runQuery(api.beats.getBeat, { id: r._id }))
    )

    return docs
      .filter((doc): doc is NonNullable<typeof doc> => {
        if (doc === null) return false
        if (args.excludeId && doc._id === args.excludeId) return false
        return true
      })
      .slice(0, limit)
      .map((beat) => ({
        beat: beat as unknown as Beat,
        score: scoreById.get(beat._id.toString()) ?? 0,
      }))
  },
})

