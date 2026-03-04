/**
 * Pulse – IndexedDB offline draft storage
 *
 * When the user is offline, beats are saved here and synced
 * to Convex when the connection is restored.
 */

const DB_NAME = 'pulse-offline'
const DB_VERSION = 1
const DRAFTS_STORE = 'drafts'

export interface OfflineDraft {
  id: string
  content: string
  inputType: 'text' | 'voice' | 'attachment'
  attachmentUrl?: string
  attachmentType?: string
  attachmentName?: string
  createdAt: number
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(DRAFTS_STORE, { keyPath: 'id' })
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function saveDraftOffline(draft: OfflineDraft): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readwrite')
    tx.objectStore(DRAFTS_STORE).put(draft)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function getOfflineDrafts(): Promise<OfflineDraft[]> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readonly')
    const req = tx.objectStore(DRAFTS_STORE).getAll()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function removeDraft(id: string): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DRAFTS_STORE, 'readwrite')
    tx.objectStore(DRAFTS_STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
