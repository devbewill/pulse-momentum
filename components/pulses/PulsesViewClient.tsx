'use client'

import dynamic from 'next/dynamic'

// Convex hooks are browser-only; skip SSR entirely for this tree
export const PulsesViewClient = dynamic(
  () => import('./PulsesView').then((m) => m.PulsesView),
  { ssr: false }
)
