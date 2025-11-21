export interface RequestChordRecommendationPayload {
  sessionId: string
}

export interface RequestChordRecommendationResponse {
  recommendedChord: string
}

export interface RequestSongUnlockRecommendationPayload {
  sessionId: string
  potentialChord: string
}

export interface RequestSongUnlockRecommendationResponse {
  unlockedSongs: string[]
}

export interface RequestPersonalizedSongRecommendationPayload {
  sessionId: string
}

export interface RequestPersonalizedSongRecommendationResponse {
  recommendedSongs: string[]
}

export interface RecommendNextChordsForTargetSongPayload {
  sessionId: string
  targetSong: string
}

export interface RecommendNextChordsForTargetSongResponse {
  recommendedPath: string[]
}

export interface ErrorResponse {
  error: string
}

