import type { Song } from './song'

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

