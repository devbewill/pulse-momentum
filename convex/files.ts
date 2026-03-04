import { v } from 'convex/values'
import { mutation } from './_generated/server'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

/**
 * Generate a short-lived upload URL for Convex file storage.
 * The client uploads directly to this URL, then calls saveFileUrl.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl()
  },
})

/**
 * After a successful upload, return the public URL for a storage ID.
 */
export const getFileUrl = mutation({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId as any)
  },
})
