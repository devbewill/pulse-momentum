export type InputType = 'text' | 'voice' | 'attachment'

export type AttachmentType = 'image' | 'file' | 'link' | null

export type MatchStrength = 'strong' | 'conceptual'

export interface Beat {
  _id: string
  _creationTime: number
  content: string
  embedding?: number[]
  inputType: InputType
  attachmentUrl?: string
  attachmentType?: AttachmentType
  attachmentName?: string
  isArchived: boolean
  lastViewedAt?: number
  interactionCount: number
  createdAt: number
  updatedAt: number
  tags?: string[]
}

export interface ScoreBreakdown {
  similarity: number   // raw cosine similarity [0,1]
  recency: number      // exponential decay score [0,1]
  interaction: number  // log-scaled interaction score [0,1]
  keyword: number      // keyword overlap boost [0,1]
}

export interface BeatSuggestion {
  beat: Beat
  score: number        // composite rank score [0,1]
  matchStrength: MatchStrength
  breakdown: ScoreBreakdown
}

export interface MergedBlock {
  id: string
  content: string
  createdAt: number
  sourceId: string // original beat ID to archive on submit
}
