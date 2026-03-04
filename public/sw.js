/**
 * Pulse – Service Worker (offline-first PWA)
 *
 * Strategy:
 * - App Shell (HTML, JS, CSS): Cache-First with network fallback
 * - API requests (Convex): Network-First with no caching
 * - Beat drafts offline: Written to IndexedDB by the app; SW syncs on reconnect
 */

const CACHE_NAME = 'pulse-shell-v1'
const OFFLINE_DRAFT_SYNC_TAG = 'pulse-sync-drafts'

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
]

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  )
  self.skipWaiting()
})

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// ─── Fetch ────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip cross-origin requests and Convex API calls (never cache)
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('convex.cloud')
  ) {
    return
  }

  // Network-first for navigation requests so the shell is always fresh
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
        .catch(() => caches.match('/'))
    )
    return
  }

  // Cache-first for static assets (_next/static/*)
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((res) => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return res
        })
      })
    )
    return
  }
})

// ─── Background Sync ──────────────────────────────────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === OFFLINE_DRAFT_SYNC_TAG) {
    event.waitUntil(syncOfflineDrafts())
  }
})

async function syncOfflineDrafts() {
  // The app writes offline drafts to IndexedDB under the key 'offline-drafts'.
  // On reconnect, this function reads them and posts each to the app via postMessage.
  const clients = await self.clients.matchAll({ type: 'window' })
  for (const client of clients) {
    client.postMessage({ type: 'SYNC_OFFLINE_DRAFTS' })
  }
}
