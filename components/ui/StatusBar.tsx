'use client'

import { useOnlineStatus } from '@/hooks/useOfflineSync'

export function StatusBar() {
  const isOnline = useOnlineStatus()

  if (isOnline) return null

  return (
    <div className="flex items-center justify-center gap-2 border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-amber-700">
      <span className="h-1.5 w-1.5 animate-pulse bg-amber-500" />
      Offline — sync pending
    </div>
  )
}
