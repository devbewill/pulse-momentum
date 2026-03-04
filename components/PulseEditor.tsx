'use client'

import { useState, useCallback, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { ContextSuggestions } from './suggestions/ContextSuggestions'
import { InputBar } from './input/InputBar'
import type { BeatSuggestion, MergedBlock } from '@/types'
import { useCreateBeat, useArchiveBeat } from '@/hooks/useBeats'
import { useSemanticSearch } from '@/hooks/useSemanticSearch'
import { useFileUpload, type UploadedAttachment } from '@/hooks/useFileUpload'
import { useOfflineSync } from '@/hooks/useOfflineSync'
import { saveDraftOffline } from '@/lib/offline/indexedDb'
import { StatusBar } from './ui/StatusBar'
import { warmupEmbeddingModel } from '@/lib/embeddings'
import { relativeTime } from '@/lib/utils/time'

const STARTER_PROMPTS = [
  { emoji: '📌', label: 'A monthly goal', text: 'My main goal this month is ' },
  { emoji: '💡', label: "An idea on my mind", text: "I have an idea on my mind: " },
  { emoji: '🎯', label: 'A problem to solve', text: 'I\'m trying to figure out how to solve ' },
]

export function PulseEditor() {
  const [inputText, setInputText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingAttachment, setPendingAttachment] = useState<UploadedAttachment | null>(null)
  const [mergedBlocks, setMergedBlocks] = useState<MergedBlock[]>([])
  const [pendingUndo, setPendingUndo] = useState<{ newBeatId: string; sourceIds: string[]; count: number } | null>(null)

  const stats = useQuery(api.beats.getStats)
  const createBeat = useCreateBeat()
  const archiveBeat = useArchiveBeat()
  const { upload, detectLinkAttachment, isUploading, error: uploadError } = useFileUpload()
  const { isOnline } = useOfflineSync()
  const { suggestions, isSearching } = useSemanticSearch(inputText)

  useEffect(() => { warmupEmbeddingModel() }, [])

  // Auto-dismiss undo toast after 8s
  useEffect(() => {
    if (!pendingUndo) return
    const t = setTimeout(() => setPendingUndo(null), 8000)
    return () => clearTimeout(t)
  }, [pendingUndo])

  const handleInputChange = useCallback(
    (text: string) => {
      setInputText(text)
      if (!pendingAttachment) {
        const link = detectLinkAttachment(text)
        if (link) setPendingAttachment(link)
      }
    },
    [pendingAttachment, detectLinkAttachment]
  )

  const handleFileAttach = useCallback(
    async (file: File) => {
      const attachment = await upload(file)
      if (attachment) setPendingAttachment(attachment)
    },
    [upload]
  )

  const buildContent = useCallback(() => {
    const parts: string[] = []
    if (inputText.trim()) parts.push(inputText.trim())
    if (mergedBlocks.length > 0) {
      const sorted = [...mergedBlocks].sort((a, b) => b.createdAt - a.createdAt)
      parts.push(...sorted.map((b) => `— ${relativeTime(b.createdAt)} —\n${b.content.trim()}`))
    }
    return parts.join('\n\n')
  }, [inputText, mergedBlocks])

  const handleSubmit = useCallback(async () => {
    const content = buildContent()
    if (!content || isSubmitting) return

    setIsSubmitting(true)
    const archiveIds = mergedBlocks.map((b) => b.sourceId)

    try {
      const inputType = pendingAttachment ? 'attachment' : 'text'

      if (!isOnline) {
        await saveDraftOffline({
          id: `draft-${Date.now()}`,
          content,
          inputType,
          attachmentUrl: pendingAttachment?.url,
          attachmentType: pendingAttachment?.type ?? undefined,
          attachmentName: pendingAttachment?.name,
          createdAt: Date.now(),
        })
      } else {
        const newBeatId = await createBeat({
          content,
          inputType,
          attachmentUrl: pendingAttachment?.url,
          attachmentType: pendingAttachment?.type ?? undefined,
          attachmentName: pendingAttachment?.name,
        })
        if (archiveIds.length > 0) {
          await Promise.all(archiveIds.map((id) => archiveBeat(id)))
          setPendingUndo({ newBeatId: String(newBeatId), sourceIds: archiveIds, count: archiveIds.length })
        }
      }

      setInputText('')
      setPendingAttachment(null)
      setMergedBlocks([])
      const ta = document.querySelector<HTMLTextAreaElement>('textarea')
      if (ta) ta.style.height = 'auto'
    } finally {
      setIsSubmitting(false)
    }
  }, [buildContent, isSubmitting, pendingAttachment, mergedBlocks, createBeat, archiveBeat, isOnline])

  const handleUndo = useCallback(async () => {
    if (!pendingUndo) return
    setIsSubmitting(true)
    try {
      await archiveBeat(pendingUndo.newBeatId, true)
      await Promise.all(pendingUndo.sourceIds.map((id) => archiveBeat(id, false)))
      setPendingUndo(null)
    } finally {
      setIsSubmitting(false)
    }
  }, [pendingUndo, archiveBeat])

  const handleMerge = useCallback((selected: BeatSuggestion[]) => {
    setMergedBlocks((prev) => {
      const existingSourceIds = new Set(prev.map((b) => b.sourceId))
      const fresh: MergedBlock[] = selected
        .filter((s) => !existingSourceIds.has(s.beat._id))
        .map((s) => ({
          id: `block-${s.beat._id}`,
          content: s.beat.content,
          createdAt: s.beat.createdAt,
          sourceId: s.beat._id,
        }))
      return [...prev, ...fresh].sort((a, b) => b.createdAt - a.createdAt)
    })
  }, [])

  const handleBlockEdit = useCallback((id: string, content: string) => {
    setMergedBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content } : b)))
  }, [])

  const handleBlockRemove = useCallback((id: string) => {
    setMergedBlocks((prev) => prev.filter((b) => b.id !== id))
  }, [])

  const handleArchiveSelected = useCallback(
    async (ids: string[]) => {
      await Promise.all(ids.map((id) => archiveBeat(id)))
    },
    [archiveBeat]
  )

  const isIdle = inputText.length === 0 && mergedBlocks.length === 0
  const showSuggestions = suggestions.length > 0 || isSearching
  const showOnboarding = stats !== undefined && stats.total === 0 && isIdle

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <StatusBar />

      {/* ── Undo toast ── */}
      {pendingUndo && (
        <div className="toast-enter relative z-20 flex shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-950 px-5 py-2.5">
          <span className="text-[13px] font-bold uppercase tracking-wider text-white">
            Pulse saved · {pendingUndo.count} {pendingUndo.count === 1 ? 'note merged' : 'notes merged'}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleUndo}
              className="text-[13px] font-black uppercase tracking-widest transition-colors"
              style={{ color: 'var(--neon)' }}
            >
              Undo
            </button>
            <button
              onClick={() => setPendingUndo(null)}
              className="text-zinc-600 transition-colors hover:text-white"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ── Middle: onboarding / suggestions / tagline ── */}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        {showOnboarding ? (
          <OnboardingPrompts onSelect={setInputText} />
        ) : showSuggestions ? (
          <ContextSuggestions
            suggestions={suggestions}
            isSearching={isSearching}
            onMerge={handleMerge}
            onArchive={handleArchiveSelected}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8">
            <p
              className={[
                'tagline-enter select-none text-[11px] font-black uppercase tracking-[0.25em] text-zinc-200 transition-all duration-300',
                isIdle ? 'opacity-100' : 'opacity-0',
              ].join(' ')}
            >
              Write · Connect · Remember
            </p>
          </div>
        )}
      </div>

      {/* ── Error toast ── */}
      {uploadError && (
        <div className="relative z-10 mx-4 mb-2 border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] text-red-600">
          {uploadError}
        </div>
      )}

      {/* ── Attachment preview ── */}
      {pendingAttachment && (
        <div className="relative z-10 mx-4 mb-2 flex items-center gap-3 border border-zinc-200 bg-white px-3 py-2.5">
          {pendingAttachment.type === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={pendingAttachment.url} alt="" className="h-10 w-10 object-cover" />
          ) : (
            <span className="text-lg">{pendingAttachment.type === 'link' ? '🔗' : '📄'}</span>
          )}
          <span className="flex-1 truncate font-mono text-[12px] text-zinc-600">{pendingAttachment.name}</span>
          <button
            onClick={() => setPendingAttachment(null)}
            className="text-zinc-400 transition-colors hover:text-zinc-950"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Input card ── */}
      <div className="relative z-10">
        <InputBar
          value={inputText}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting || isUploading}
          onAttachFile={handleFileAttach}
          mergedBlocks={mergedBlocks}
          onBlockEdit={handleBlockEdit}
          onBlockRemove={handleBlockRemove}
        />
      </div>
    </div>
  )
}

// ─── Onboarding prompts ────────────────────────────────────────────────────────

function OnboardingPrompts({ onSelect }: { onSelect: (text: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6">
      <div className="text-center">
        <div className="mb-2 text-[13px] font-black uppercase tracking-[0.25em] text-zinc-300">
          First note
        </div>
        <p className="text-[16px] font-bold text-zinc-500">
          Start with a thought, a goal, or an idea.
        </p>
      </div>
      <div className="flex w-full max-w-sm flex-col gap-2">
        {STARTER_PROMPTS.map(({ emoji, label, text }) => (
          <button
            key={label}
            onClick={() => onSelect(text)}
            className="flex items-center gap-3 border border-zinc-200 px-4 py-3.5 text-left transition-all duration-100 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white group"
          >
            <span className="text-lg">{emoji}</span>
            <span className="text-[15px] font-bold text-zinc-700 group-hover:text-white transition-colors">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
