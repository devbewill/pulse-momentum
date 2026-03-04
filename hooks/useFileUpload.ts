'use client'

import { useState, useCallback } from 'react'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import type { AttachmentType } from '@/types'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export interface UploadedAttachment {
  url: string
  type: AttachmentType
  name: string
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const getFileUrl = useMutation(api.files.getFileUrl)

  const upload = useCallback(
    async (file: File): Promise<UploadedAttachment | null> => {
      setError(null)

      if (file.size > MAX_FILE_SIZE) {
        setError(`File troppo grande. Massimo ${MAX_FILE_SIZE / 1024 / 1024} MB.`)
        return null
      }

      setIsUploading(true)
      try {
        // 1. Get a short-lived upload URL from Convex
        const uploadUrl = await generateUploadUrl()

        // 2. Upload the file directly to Convex storage
        const res = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        })

        if (!res.ok) throw new Error('Upload fallito')

        const { storageId } = await res.json()

        // 3. Get the permanent public URL
        const url = await getFileUrl({ storageId })
        if (!url) throw new Error('URL non disponibile')

        const type: AttachmentType = file.type.startsWith('image/') ? 'image' : 'file'

        return { url, type, name: file.name }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Errore caricamento file')
        return null
      } finally {
        setIsUploading(false)
      }
    },
    [generateUploadUrl, getFileUrl]
  )

  /**
   * Detect if a string looks like a URL and return an attachment descriptor.
   */
  const detectLinkAttachment = useCallback((text: string): UploadedAttachment | null => {
    const urlPattern = /https?:\/\/[^\s]+/
    const match = text.match(urlPattern)
    if (!match) return null
    return { url: match[0], type: 'link', name: match[0] }
  }, [])

  return { upload, detectLinkAttachment, isUploading, error, clearError: () => setError(null) }
}
