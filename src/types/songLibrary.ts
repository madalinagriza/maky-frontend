export interface StartLearningSongPayload {
  sessionId: string
  song: string
  mastery: 'na' | 'in progress' | 'mastered'
}

export interface UpdateSongMasteryPayload {
  sessionId: string
  song: string
  newMastery: 'na' | 'in progress' | 'mastered'
}

export interface StopLearningSongPayload {
  sessionId: string
  song: string
}

export interface GetPlayableSongsPayload {
  sessionId: string
  genres?: string[]
}

export interface SongProgress {
  song: string
  mastery: string
}

export interface GetSongsInProgressResponse extends Array<SongProgress> {}

export interface FilterSongsByGenrePayload {
  genre: string
}

export interface ErrorResponse {
  error: string
}

