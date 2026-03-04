'use client'

import { useRef, useCallback, useState, useEffect, KeyboardEvent, DragEvent } from 'react'
import { useVoice } from '@/hooks/useVoice'
import { MatchingWeightsPanel } from '@/components/ui/MatchingWeightsPanel'
import type { MergedBlock } from '@/types'
import { relativeTime } from '@/lib/utils/time'

interface InputBarProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting?: boolean
  onAttachFile?: (file: File) => void
  mergedBlocks?: MergedBlock[]
  onBlockEdit?: (id: string, content: string) => void
  onBlockRemove?: (id: string) => void
}

export function InputBar({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  onAttachFile,
  mergedBlocks = [],
  onBlockEdit,
  onBlockRemove,
}: InputBarProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [showWeightsPanel, setShowWeightsPanel] = useState(false)

  const handleTranscript = useCallback(
    (transcript: string) => onChange(value ? `${value} ${transcript}` : transcript),
    [value, onChange]
  )

  const { state: voiceState, isSupported: voiceSupported, toggle: toggleVoice } =
    useVoice(handleTranscript)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
      const ta = textareaRef.current
      if (ta) {
        ta.style.height = 'auto'
        ta.style.height = `${Math.min(ta.scrollHeight, 260)}px`
      }
    },
    [onChange]
  )

  const hasContent = value.trim().length > 0 || mergedBlocks.length > 0

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (hasContent) onSubmit()
      }
    },
    [hasContent, onSubmit]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) onAttachFile?.(file)
      e.target.value = ''
    },
    [onAttachFile]
  )

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback(() => setIsDragging(false), [])
  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) onAttachFile?.(file)
    },
    [onAttachFile]
  )

  return (
    <div className="px-4 pb-6 pt-1">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="border-[5px] border-zinc-950 transition-all duration-100 bg-white"
      >
        {/* Scrollable content area */}
        <div className="max-h-[50dvh] overflow-y-auto px-4 pt-4">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isDragging ? 'Drop here…' : 'What are you thinking?'}
            rows={4}
            className="w-full resize-none bg-transparent text-[18px] font-bold leading-[1.75] text-zinc-950 placeholder-zinc-300 outline-none"
            style={{ minHeight: '120px' }}
            disabled={isSubmitting}
          />

          {mergedBlocks.map((block) => (
            <MergedBlockEditor
              key={block.id}
              block={block}
              onEdit={(content) => onBlockEdit?.(block.id, content)}
              onRemove={() => onBlockRemove?.(block.id)}
            />
          ))}
          <div className="h-1" />
        </div>

        {/* Toolbar */}
        <div className="relative flex items-center justify-between border-t border-zinc-100 px-4 py-3">
          <div className="flex items-center gap-0.5">
            {/* Attach */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-8 w-8 items-center justify-center text-zinc-400 transition-colors hover:text-zinc-950"
              title="Attach file"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.txt,.md" className="hidden" onChange={handleFileChange} />

            {/* Voice */}
            <button
              type="button"
              onClick={toggleVoice}
              disabled={!voiceSupported}
              title={voiceState === 'recording' ? 'Stop recording' : 'Start recording'}
              className={[
                'flex h-8 w-8 items-center justify-center transition-colors',
                voiceState === 'recording'
                  ? 'text-red-500'
                  : 'text-zinc-400 hover:text-zinc-950',
                !voiceSupported ? 'cursor-not-allowed opacity-20' : '',
              ].join(' ')}
            >
              {voiceState === 'recording' ? (
                <span className="h-3 w-3 animate-pulse rounded-sm bg-red-500" />
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              )}
            </button>

            {/* Settings — matching weights */}
            <button
              type="button"
              onClick={() => setShowWeightsPanel(!showWeightsPanel)}
              className={[
                'flex h-8 w-8 items-center justify-center transition-colors',
                showWeightsPanel
                  ? 'text-zinc-950'
                  : 'text-zinc-400 hover:text-zinc-950',
              ].join(' ')}
              title="Matching weights settings"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </button>
          </div>

          {/* Send — neon CTA */}
          <button
            type="button"
            onClick={onSubmit}
            disabled={!hasContent || isSubmitting}
            className="send-btn flex h-10 items-center gap-2 px-5 text-[14px] font-black uppercase tracking-wider text-zinc-950 transition-all duration-100 disabled:cursor-not-allowed disabled:opacity-25"
            style={{ background: 'var(--neon)' }}
            title="Invia (Enter)"
          >
            {isSubmitting ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-950/30 border-t-zinc-950" />
            ) : (
              <>
                Invia
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Weights panel popover */}
        {showWeightsPanel && (
          <div className="absolute bottom-full right-0 mb-2 z-50">
            <MatchingWeightsPanel onClose={() => setShowWeightsPanel(false)} />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Merged block editor ──────────────────────────────────────────────────────

function MergedBlockEditor({
  block,
  onEdit,
  onRemove,
}: {
  block: MergedBlock
  onEdit: (content: string) => void
  onRemove: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [])

  useEffect(() => { resize() }, [block.content, resize])

  return (
    <div>
      {/* Divider */}
      <div className="flex items-center gap-3 py-3">
        <div className="h-px flex-1 bg-zinc-100" />
        <div className="flex items-center gap-1.5 border border-zinc-200 px-2.5 py-0.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: 'var(--neon)' }} />
          <span className="font-mono text-[12px] font-bold uppercase tracking-wider text-zinc-500">
            {relativeTime(block.createdAt)}
          </span>
        </div>
        <div className="h-px flex-1 bg-zinc-100" />
        <button
          onClick={onRemove}
          className="flex h-5 w-5 shrink-0 items-center justify-center text-zinc-300 transition-colors hover:text-zinc-950"
          title="Rimuovi"
        >
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Editable content */}
      <textarea
        ref={textareaRef}
        value={block.content}
        onChange={(e) => { onEdit(e.target.value); resize() }}
        className="w-full resize-none bg-transparent text-[16px] italic leading-relaxed text-zinc-400 outline-none transition-colors focus:text-zinc-700"
        style={{ overflow: 'hidden', minHeight: '0' }}
      />
    </div>
  )
}
