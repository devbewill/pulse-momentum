'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const stats = useQuery(api.beats.getStats)
  const isCapture = pathname === '/'
  const isArchive = pathname === '/pulses'

  return (
    <div className="flex h-dvh bg-white">
      {/* ─── Desktop sidebar ────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-52 md:shrink-0 md:flex-col border-r border-zinc-200">
        {/* Logo */}
        <div className="px-5 pt-8 pb-6">
          <div className="flex items-center gap-2">
            <span className="star-glow text-[18px] leading-none text-[#B5FF4D]" style={{ color: 'var(--neon)' }}>✦</span>
            <span className="text-[18px] font-black uppercase tracking-tight text-zinc-950">Pulse</span>
          </div>
          <p className="mt-1 pl-[26px] text-[10px] text-zinc-400 italic">
            le tue idee, connesse
          </p>
        </div>

        {/* Navigation */}
        <nav className="px-3 flex flex-col gap-0.5">
          <Link
            href="/"
            className={[
              'flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all duration-100 rounded-sm',
              isCapture
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100',
            ].join(' ')}
          >
            <span className="text-[13px]" style={isCapture ? {} : { color: 'inherit' }}>✦</span>
            Cattura
          </Link>
          <Link
            href="/pulses"
            className={[
              'flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-bold uppercase tracking-wider transition-all duration-100 rounded-sm',
              isArchive
                ? 'bg-zinc-950 text-white'
                : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100',
            ].join(' ')}
          >
            <ListIcon size={13} />
            Archivio
          </Link>
        </nav>

        {/* Divider */}
        <div className="mx-4 my-5 h-px bg-zinc-100" />

        {/* Stats */}
        <div className="px-5">
          <p className="mb-4 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">
            Attività
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatBlock label="Oggi" value={stats?.today} />
            <StatBlock label="Settimana" value={stats?.week} />
          </div>
          <div className="border-t border-zinc-100 pt-3 flex items-baseline justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">Totale</span>
            <span className="font-mono font-black text-[28px] leading-none text-zinc-950 tabular-nums">
              {stats?.total ?? '—'}
            </span>
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="px-5 py-4 border-t border-zinc-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-300">v0.1 · PWA · Offline</p>
        </div>
      </aside>

      {/* ─── Main column ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        {/* Mobile topbar */}
        <header className="md:hidden flex shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="text-[14px] leading-none" style={{ color: 'var(--neon)' }}>✦</span>
            <span className="text-[15px] font-black uppercase tracking-tight text-zinc-950">Pulse</span>
          </div>
          {stats !== undefined && stats.total > 0 && (
            <span className="font-mono font-black text-[11px] tabular-nums text-zinc-400">
              {stats.total}
            </span>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden flex shrink-0 border-t border-zinc-200 bg-white"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          <Link
            href="/"
            className={[
              'flex flex-1 flex-col items-center gap-1 px-4 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100',
              isCapture ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700',
            ].join(' ')}
          >
            <span className="text-[15px] leading-none" style={isCapture ? { color: 'var(--neon)' } : {}}>✦</span>
            Cattura
          </Link>
          <div className="w-px bg-zinc-100 self-stretch my-2" />
          <Link
            href="/pulses"
            className={[
              'flex flex-1 flex-col items-center gap-1 px-4 py-3 text-[12px] font-black uppercase tracking-wider transition-colors duration-100',
              isArchive ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-700',
            ].join(' ')}
          >
            <ListIcon size={15} />
            Archivio
          </Link>
        </nav>
      </div>
    </div>
  )
}

function StatBlock({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div>
      <div className="font-mono font-black text-[28px] leading-none text-zinc-950 tabular-nums">
        {value ?? <span className="inline-block h-5 w-6 animate-pulse rounded-sm bg-zinc-100 align-middle" />}
      </div>
      <div className="mt-1 text-[11px] font-black uppercase tracking-widest text-zinc-400">{label}</div>
    </div>
  )
}

function ListIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}
