import type { Song } from './song'

/**
 * Represents a chord fingering diagram
 */
export interface ChordDiagram {
  name: string
  frets: number[]      // 6 elements, one per string. -1 = muted, 0 = open
  fingers: number[]    // 6 elements, finger numbers (0 = not pressed)
  baseFret: number     // Starting fret position
  barres?: number[]    // Barre positions if any
  capo?: boolean
}

export interface CalculateRecommendationPayload {
  sessionId: string
  knownChords: string[]
  allSongs: Song[]
}

export interface CalculateRecommendationResponse {
  recommendationId: string
}

export interface RequestChordRecommendationPayload {
  knownChords: string[]
  allSongs: Song[]
}

export interface RequestChordRecommendationResponse {
  recommendedChord: string
  diagram: ChordDiagram[] | null  // Array of voicings, or null if unavailable
}

export type RawRequestChordRecommendationResponse =
  | RequestChordRecommendationResponse
  | Array<RequestChordRecommendationResponse>

export interface RequestSongUnlockRecommendationPayload {
  knownChords: string[]
  potentialChord: string
  allSongs: Song[]
}

export interface RequestSongUnlockRecommendationResponse {
  unlockedSongs: string[]
}

export interface GetRecommendationPayload {
  recommendationId: string
}

export interface Recommendation {
  _id: string
  user: string
  recommendedChord: string
  unlockedSongs: string[]
  score: number
  generatedAt: string
}

export interface GetRecommendationResponse extends Array<Recommendation> {}

export interface ErrorResponse {
  error: string
}

