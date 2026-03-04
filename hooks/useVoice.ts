'use client'

import { useState, useRef, useCallback } from 'react'

type VoiceState = 'idle' | 'recording' | 'error'

// Minimal type for the Web Speech API (not always available in @types/web)
type SpeechRecognitionInstance = {
  continuous: boolean
  interimResults: boolean
  lang: string
  maxAlternatives: number
  onstart: (() => void) | null
  onresult: ((event: any) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
}

export function useVoice(onTranscript: (text: string) => void) {
  const [state, setState] = useState<VoiceState>('idle')
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  })
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const start = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition: SpeechRecognitionInstance = new SpeechRecognitionClass()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = navigator.language || 'it-IT'
    recognition.maxAlternatives = 1

    recognition.onstart = () => setState('recording')

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        .map((r: any) => r[0].transcript as string)
        .join('')

      if (event.results[event.results.length - 1].isFinal) {
        onTranscript(transcript)
        setState('idle')
      }
    }

    recognition.onerror = () => setState('error')
    recognition.onend = () => setState((s) => (s === 'recording' ? 'idle' : s))

    recognitionRef.current = recognition
    recognition.start()
  }, [isSupported, onTranscript])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
    setState('idle')
  }, [])

  const toggle = useCallback(() => {
    if (state === 'recording') stop()
    else start()
  }, [state, start, stop])

  return { state, isSupported, toggle }
}
