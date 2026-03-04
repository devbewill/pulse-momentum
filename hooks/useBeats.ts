'use client'

import { usePaginatedQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { generateEmbedding } from '@/lib/embeddings'
import type { InputType, AttachmentType } from '@/types'

const PAGE_SIZE = 30

export function useBeats(includeArchived = false) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.beats.listBeats,
    { includeArchived },
    { initialNumItems: PAGE_SIZE }
  )

  // Beats from Convex come newest-first; we render them top=old, bottom=new
  const beats = [...(results ?? [])].reverse()

  return {
    beats,
    isLoading: status === 'LoadingFirstPage',
    canLoadMore: status === 'CanLoadMore',
    loadMore: () => loadMore(PAGE_SIZE),
  }
}

export function useCreateBeat() {
  const createBeat = useMutation(api.beats.createBeat)

  return async (args: {
    content: string
    inputType?: InputType
    attachmentUrl?: string
    attachmentType?: AttachmentType
    attachmentName?: string
  }) => {
    const embedding = await generateEmbedding(args.content).catch(() => undefined)

    return createBeat({
      content: args.content,
      embedding,
      inputType: args.inputType ?? 'text',
      attachmentUrl: args.attachmentUrl,
      attachmentType: args.attachmentType ?? undefined,
      attachmentName: args.attachmentName,
    })
  }
}

export function useArchiveBeat() {
  const archiveBeat = useMutation(api.beats.archiveBeat)
  return (id: string, archived = true) =>
    archiveBeat({ id: id as any, archived })
}

export function useTrackInteraction() {
  const track = useMutation(api.beats.trackInteraction)
  return (id: string) => track({ id: id as any })
}

export function useUpdateTags() {
  const updateTags = useMutation(api.beats.updateTags as any)
  return (id: string, tags: string[]) => updateTags({ id: id as any, tags })
}
