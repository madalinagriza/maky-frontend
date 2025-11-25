import type { Song } from './song'

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

export interface SongProgress {
  song: Song
  mastery: string
}

export interface GetSongsInProgressResponse extends Array<SongProgress> {}

export type RawSongsInProgressResponse =
  | GetSongsInProgressResponse
  | {
      songsInProgress: GetSongsInProgressResponse
    }
  | {
    songs: GetSongsInProgressResponse
  }

export interface ErrorResponse {
  error: string
}

