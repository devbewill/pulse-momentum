'use client'

import dynamic from 'next/dynamic'

// Convex hooks are browser-only; skip SSR entirely for this tree
export const PulseEditorClient = dynamic(
  () => import('./PulseEditor').then((m) => m.PulseEditor),
  { ssr: false }
)
