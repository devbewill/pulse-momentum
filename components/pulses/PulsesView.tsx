'use client'

import { useState, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { usePaginatedQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { relativeTime } from '@/lib/utils/time'
import { parseBlocks, countMergedBlocks } from '@/lib/utils/content'
import { useUpdateTags } from '@/hooks/useBeats'
import type { Beat } from '@/types'

const PAGE_SIZE = 30
type ViewMode = 'list' | 'topics'

// ─── Italian stop words for keyword extraction ────────────────────────────────

const STOP = new Set(['il','la','lo','le','i','gli','un','una','uno','e','è','che','di','a','in','con','su','per','da','tra','fra','del','della','dei','delle','al','alla','ai','agli','nel','nella','nei','nelle','come','non','mi','ti','si','ci','vi','ho','hai','ha','abbiamo','avete','hanno','sono','sei','siamo','siete','ma','se','o','poi','quando','qui','li','più','anche','tutto','tutti','cosa','ogni','questo','questa','questi','queste','quello','quella','quelli','quelle','me','te','lui','lei','noi','voi','loro','mio','mia','tuo','tua','suo','sua','molto','poco','bene','male','già','ancora','sempre','mai','fare','essere','avere','però','allora','così','perché','quindi','dopo','prima','modo','volta','può','suo','sua'])

function extractKeyword(content: string): string {
  const words = content.toLowerCase().replace(/[^a-z\u00e0-\u00fc\s]/g, '').split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w))
  if (words.length === 0) return 'altro'
  const freq = new Map<string, number>()
  words.forEach((w) => freq.set(w, (freq.get(w) || 0) + 1))
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'altro'
}

// ─── Export ───────────────────────────────────────────────────────────────────

function exportMarkdown(beats: Beat[]) {
  const md = beats
    .map((b) => {
      const date = new Date(b.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })
      const type = b.inputType === 'voice' ? '🎙 Voce' : b.inputType === 'attachment' ? '📎 Allegato' : '✦ Testo'
      const tags = b.tags?.length ? `\n\nTag: ${b.tags.join(', ')}` : ''
      return `## ${date} · ${type}\n\n${b.content}${tags}`
    })
    .join('\n\n---\n\n')
  const blob = new Blob([`# Pulse Export\n\n${md}`], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pulse-export-${new Date().toISOString().slice(0, 10)}.md`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export function PulsesView() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.beats.listBeats,
    { includeArchived: false },
    { initialNumItems: PAGE_SIZE }
  )
  const archiveBeat = useMutation(api.beats.archiveBeat)
  const updateTags = useUpdateTags()
  const [archivingIds, setArchivingIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const beats = results ?? []
  const isLoading = status === 'LoadingFirstPage'
  const canLoadMore = status === 'CanLoadMore'

  const filteredBeats = useMemo(() => {
    if (!searchQuery.trim()) return beats
    const q = searchQuery.toLowerCase()
    return beats.filter(
      (b) =>
        b.content.toLowerCase().includes(q) ||
        b.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }, [beats, searchQuery])

  const topicGroups = useMemo(() => {
    if (viewMode !== 'topics') return null
    const groups = new Map<string, Beat[]>()
    filteredBeats.forEach((b) => {
      const kw = extractKeyword(b.content)
      if (!groups.has(kw)) groups.set(kw, [])
      groups.get(kw)!.push(b as Beat)
    })
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length)
  }, [filteredBeats, viewMode])

  const handleArchive = useCallback(async (id: string) => {
    setArchivingIds((prev) => new Set(prev).add(id))
    try {
      await archiveBeat({ id: id as any, archived: true })
    } finally {
      setArchivingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }, [archiveBeat])

  const handleTagsUpdate = useCallback(async (id: string, tags: string[]) => {
    await updateTags(id, tags)
  }, [updateTags])

  return (
    <div className="flex h-full flex-col overflow-hidden bg-white">
      {/* ── Header ── */}
      <header className="flex shrink-0 flex-col border-b border-zinc-200">
        <div className="flex items-center justify-between px-5 py-4">
          <h1 className="text-[14px] font-black uppercase tracking-[0.2em] text-zinc-950">
            Tutti i pulse
            {filteredBeats.length > 0 && (
              <span className="ml-2 font-mono text-zinc-400">{filteredBeats.length}</span>
            )}
          </h1>
          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex border border-zinc-200">
              <button
                onClick={() => setViewMode('list')}
                className={['px-3 py-1.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100', viewMode === 'list' ? 'bg-zinc-950 text-white' : 'text-zinc-400 hover:text-zinc-950'].join(' ')}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('topics')}
                className={['border-l border-zinc-200 px-3 py-1.5 text-[12px] font-black uppercase tracking-wider transition-colors duration-100', viewMode === 'topics' ? 'bg-zinc-950 text-white' : 'text-zinc-400 hover:text-zinc-950'].join(' ')}
              >
                Temi
              </button>
            </div>
            {/* Export */}
            {beats.length > 0 && (
              <button
                onClick={() => exportMarkdown(beats as Beat[])}
                title="Esporta come Markdown"
                className="border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-zinc-950 hover:text-zinc-950"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </button>
            )}
          </div>
        </div>
        {/* Search */}
        <div className="border-t border-zinc-100 px-5 py-2.5">
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="shrink-0 text-zinc-400">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca nei pulse..."
              className="flex-1 bg-transparent text-[15px] font-bold text-zinc-950 placeholder-zinc-300 outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-300 hover:text-zinc-950">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <SkeletonList />
        ) : filteredBeats.length === 0 ? (
          searchQuery ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 select-none">
              <p className="text-[15px] font-bold uppercase tracking-wider text-zinc-300">Nessun risultato</p>
              <p className="text-[13px] font-bold text-zinc-400">per &ldquo;{searchQuery}&rdquo;</p>
            </div>
          ) : (
            <EmptyState />
          )
        ) : viewMode === 'topics' && topicGroups ? (
          <TopicsView
            groups={topicGroups}
            archivingIds={archivingIds}
            onArchive={handleArchive}
            onTagsUpdate={handleTagsUpdate}
          />
        ) : (
          <div className="flex flex-col divide-y divide-zinc-100">
            {filteredBeats.map((beat, i) => (
              <PulseCard
                key={beat._id}
                beat={beat as Beat}
                index={i}
                isArchiving={archivingIds.has(beat._id)}
                onArchive={handleArchive}
                onTagsUpdate={handleTagsUpdate}
              />
            ))}
            {canLoadMore && (
              <button
                onClick={() => loadMore(PAGE_SIZE)}
                className="py-4 text-[13px] font-black uppercase tracking-widest text-zinc-300 transition-colors hover:text-zinc-950"
              >
                Carica precedenti
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Topics view ──────────────────────────────────────────────────────────────

function TopicsView({
  groups,
  archivingIds,
  onArchive,
  onTagsUpdate,
}: {
  groups: [string, Beat[]][]
  archivingIds: Set<string>
  onArchive: (id: string) => void
  onTagsUpdate: (id: string, tags: string[]) => void
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const toggle = (kw: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(kw)) next.delete(kw)
      else next.add(kw)
      return next
    })
  }

  return (
    <div className="divide-y divide-zinc-100">
      {groups.map(([keyword, groupBeats], gi) => (
        <div key={keyword}>
          {/* Group header */}
          <button
            onClick={() => toggle(keyword)}
            className="flex w-full items-center justify-between px-5 py-3 hover:bg-zinc-50"
          >
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-black uppercase tracking-[0.2em] text-zinc-950">
                {keyword}
              </span>
              <span className="font-mono text-[12px] font-bold text-zinc-400">{groupBeats.length}</span>
            </div>
            <span className="text-zinc-400 text-[10px]">
              {collapsed.has(keyword) ? '▶' : '▼'}
            </span>
          </button>
          {/* Group cards */}
          {!collapsed.has(keyword) && (
            <div className="divide-y divide-zinc-50 bg-zinc-50/50">
              {groupBeats.map((beat, i) => (
                <PulseCard
                  key={beat._id}
                  beat={beat}
                  index={gi * 10 + i}
                  isArchiving={archivingIds.has(beat._id)}
                  onArchive={onArchive}
                  onTagsUpdate={onTagsUpdate}
                  compact
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Pulse card ───────────────────────────────────────────────────────────────

function PulseCard({
  beat,
  index,
  isArchiving,
  onArchive,
  onTagsUpdate,
  compact = false,
}: {
  beat: Beat
  index: number
  isArchiving: boolean
  onArchive: (id: string) => void
  onTagsUpdate: (id: string, tags: string[]) => void
  compact?: boolean
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const blocks = parseBlocks(beat.content)
  const mainBlock = blocks[0]
  const mergedCount = countMergedBlocks(beat.content)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await navigator.clipboard.writeText(beat.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={[
        'pulse-card-enter',
        isArchiving ? 'pulse-archiving' : '',
        compact ? '' : '',
      ].join(' ')}
      style={{ animationDelay: `${Math.min(index * 25, 150)}ms` }}
    >
      {/* Collapsed row */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className={[
          'flex w-full flex-col gap-2 px-5 text-left transition-colors duration-100',
          compact ? 'py-3 pl-8' : 'py-4',
          isExpanded ? 'bg-zinc-50' : 'hover:bg-zinc-50',
        ].join(' ')}
      >
        {/* Meta */}
        <div className="flex items-center gap-2">
          <TypeDot type={beat.inputType} />
          <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-zinc-400">
            {relativeTime(beat.createdAt)}
          </span>
          {mergedCount > 0 && (
            <span className="border border-zinc-200 px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              +{mergedCount}
            </span>
          )}
          <div className="ml-auto">
            <ChevronIcon isOpen={isExpanded} />
          </div>
        </div>

        {/* Image thumbnail */}
        {beat.inputType === 'attachment' && beat.attachmentType === 'image' && beat.attachmentUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={beat.attachmentUrl} alt="" className="h-24 w-full object-cover" />
        )}

        {/* Content — collapsed shows 2 lines only */}
        <p className={['text-[17px] font-bold leading-[1.65] text-zinc-800', isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-2'].join(' ')}>
          {mainBlock.text}
        </p>

        {/* Tags preview */}
        {beat.tags && beat.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {beat.tags.map((tag) => (
              <span key={tag} className="border border-zinc-200 px-2 py-0.5 text-[12px] font-bold uppercase tracking-wider text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        )}
      </button>

      {/* Expanded detail */}
      <div className="pulse-expand" aria-expanded={String(isExpanded) as 'true' | 'false'}>
        <div>
          <div className={['border-t border-zinc-100 bg-zinc-50', compact ? 'pl-8 pr-5 pb-4' : 'px-5 pb-5'].join(' ')}>

            {/* Merged blocks (no repetition of main text) */}
            <MergedBlocksContent blocks={blocks} />

            {/* Tag editor */}
            <TagEditor
              beatId={beat._id}
              tags={beat.tags ?? []}
              onUpdate={(tags) => onTagsUpdate(beat._id, tags)}
            />

            {/* Footer actions */}
            <div className="mt-4 flex items-center gap-2 border-t border-zinc-200 pt-4">
              <span className="font-mono text-[12px] font-bold uppercase tracking-widest text-zinc-400">
                {beat.inputType === 'voice' ? '🎙 voce' : beat.inputType === 'attachment' ? '📎 allegato' : '✦ testo'}
              </span>
              <div className="flex-1" />
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="border border-zinc-200 px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-950 hover:text-zinc-950"
              >
                {copied ? 'Copiato!' : 'Copia'}
              </button>
              {/* Archive button */}
              <button
                onClick={() => onArchive(beat._id)}
                disabled={isArchiving}
                className="border border-zinc-200 px-3 py-2 text-[13px] font-bold uppercase tracking-wider text-zinc-500 transition-all hover:border-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
              >
                {isArchiving ? 'Archiviando…' : 'Archivia'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Merged blocks (no repetition) ───────────────────────────────────────────

function MergedBlocksContent({ blocks }: { blocks: ReturnType<typeof parseBlocks> }) {
  const mergedBlocks = blocks.slice(1)
  if (mergedBlocks.length === 0) return null

  return (
    <div className="pt-4">
      {mergedBlocks.map((block, i) => (
        <div key={i} className="block-enter" style={{ animationDelay: `${i * 60 + 30}ms` }}>
          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-zinc-200" />
            <span className="border border-zinc-200 px-2.5 py-0.5 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
              {block.label}
            </span>
            <div className="h-px flex-1 bg-zinc-200" />
          </div>
          <p className="whitespace-pre-wrap text-[16px] italic leading-[1.8] text-zinc-500">
            {block.text}
          </p>
        </div>
      ))}
    </div>
  )
}

// ─── Tag editor ───────────────────────────────────────────────────────────────

function TagEditor({
  beatId,
  tags,
  onUpdate,
}: {
  beatId: string
  tags: string[]
  onUpdate: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const tag = input.trim().toLowerCase().replace(/\s+/g, '-')
    if (!tag || tags.includes(tag)) { setInput(''); return }
    onUpdate([...tags, tag])
    setInput('')
  }

  const removeTag = (tag: string) => onUpdate(tags.filter((t) => t !== tag))

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-1.5 items-center">
        {tags.map((tag) => (
          <span key={tag} className="flex items-center gap-1 border border-zinc-200 px-2 py-0.5">
            <span className="text-[12px] font-bold uppercase tracking-wider text-zinc-600">{tag}</span>
            <button onClick={() => removeTag(tag)} className="text-zinc-300 hover:text-zinc-950 transition-colors">
              <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
          placeholder="+ tag"
          className="bg-transparent text-[12px] font-bold uppercase tracking-wider text-zinc-400 placeholder-zinc-300 outline-none w-20"
        />
      </div>
    </div>
  )
}

// ─── Type dot ─────────────────────────────────────────────────────────────────

function TypeDot({ type }: { type: Beat['inputType'] }) {
  if (type === 'voice') return <span className="h-2 w-2 rounded-full bg-amber-400" />
  if (type === 'attachment') return <span className="h-2 w-2 rounded-full bg-blue-400" />
  return <span className="h-2 w-2 text-[10px]" style={{ color: 'var(--neon)' }}>✦</span>
}

// ─── Chevron ──────────────────────────────────────────────────────────────────

function ChevronIcon({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
      className={['text-zinc-400 transition-transform duration-200', isOpen ? 'rotate-180' : ''].join(' ')}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonList() {
  return (
    <div className="divide-y divide-zinc-100">
      {[0.9, 0.6, 0.8, 0.5, 0.7].map((w, i) => (
        <div key={i} className="px-5 py-4">
          <div className="mb-3 h-2 w-20 animate-pulse bg-zinc-100" />
          <div className="space-y-2">
            <div className="h-3.5 animate-pulse bg-zinc-100" style={{ width: `${w * 100}%` }} />
            <div className="h-3.5 animate-pulse bg-zinc-100/70" style={{ width: `${w * 55}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 select-none">
      <span className="star-pulse text-4xl" style={{ color: 'var(--neon)' }}>✦</span>
      <div className="space-y-1.5 text-center">
        <p className="text-[15px] font-black uppercase tracking-widest text-zinc-300">Nessun pulse</p>
        <p className="text-[13px] font-bold text-zinc-400">Torna alla cattura e scrivi il primo pensiero.</p>
      </div>
      <Link
        href="/"
        className="mt-1 border border-zinc-200 px-5 py-2.5 text-[13px] font-black uppercase tracking-wider text-zinc-500 transition-all hover:border-zinc-950 hover:bg-zinc-950 hover:text-white"
      >
        ← Cattura
      </Link>
    </div>
  )
}
