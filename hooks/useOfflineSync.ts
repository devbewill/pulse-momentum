'use client'

import { useEffect, useState, useCallback } from 'react'
import { getOfflineDrafts, removeDraft } from '@/lib/offline/indexedDb'
import { useCreateBeat } from '@/hooks/useBeats'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    const setOnline = () => setIsOnline(true)
    const setOffline = () => setIsOnline(false)
    window.addEventListener('online', setOnline)
    window.addEventListener('offline', setOffline)
    return () => {
      window.removeEventListener('online', setOnline)
      window.removeEventListener('offline', setOffline)
    }
  }, [])

  return isOnline
}

/**
 * When the app comes back online, sync any offline drafts to Convex.
 * Also listens for the SYNC_OFFLINE_DRAFTS message from the Service Worker.
 */
export function useOfflineSync() {
  const isOnline = useOnlineStatus()
  const createBeat = useCreateBeat()
  const [syncing, setSyncing] = useState(false)

  const syncDrafts = useCallback(async () => {
    const drafts = await getOfflineDrafts()
    if (drafts.length === 0) return

    setSyncing(true)
    for (const draft of drafts) {
      try {
        await createBeat({
          content: draft.content,
          inputType: draft.inputType,
          attachmentUrl: draft.attachmentUrl,
          attachmentType: draft.attachmentType as any,
          attachmentName: draft.attachmentName,
        })
        await removeDraft(draft.id)
      } catch {
        // Leave the draft in IDB; retry on next reconnect
      }
    }
    setSyncing(false)
  }, [createBeat])

  // Sync when coming back online
  useEffect(() => {
    if (isOnline) syncDrafts()
  }, [isOnline, syncDrafts])

  // Sync when service worker sends the message
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_OFFLINE_DRAFTS') syncDrafts()
    }
    navigator.serviceWorker?.addEventListener('message', handler)
    return () => navigator.serviceWorker?.removeEventListener('message', handler)
  }, [syncDrafts])

  return { isOnline, syncing }
}
