export interface Song {
  _id: string
  title: string
  artist: string
  chords: string[]
  genre?: string
  key?: string
  tempo?: number
  difficulty?: number
  tags?: string[]
  source?: string
}

export interface GetPlayableSongsPayload {
  knownChords: string[]
  genres?: string[]
}

export interface FilterSongsByGenrePayload {
  genre: string
}

export interface SearchSongsPayload {
  query: string
}

export interface SongResponse {
  song: Song
}

export type PlayableSongsRawResponse =
  | SongResponse[]
  | {
      songs: SongResponse[]
    }

export interface ErrorResponse {
  error: string
}
