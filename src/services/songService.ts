import { apiClient } from './apiClient'
import type {
  GetPlayableSongsPayload,
  FilterSongsByGenrePayload,
  SearchSongsPayload,
  SongResponse,
  ErrorResponse,
} from '@/types/song'

const SONG_BASE = '/Song'

function ensureSuccess<T>(payload: T | ErrorResponse): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'error' in payload &&
    payload.error &&
    typeof payload.error === 'string'
  ) {
    throw new Error(payload.error)
  }
  return payload as T
}

export async function getPlayableSongs(payload: GetPlayableSongsPayload) {
  const { data } = await apiClient.post<SongResponse[] | ErrorResponse>(
    `${SONG_BASE}/_getPlayableSongs`,
    payload
  )
  return ensureSuccess(data)
}

export async function filterSongsByGenre(payload: FilterSongsByGenrePayload) {
  const { data } = await apiClient.post<SongResponse[] | ErrorResponse>(
    `${SONG_BASE}/_filterSongsByGenre`,
    payload
  )
  return ensureSuccess(data)
}

export async function searchByTitleOrArtist(payload: SearchSongsPayload) {
  const { data } = await apiClient.post<SongResponse[] | ErrorResponse>(
    `${SONG_BASE}/_searchByTitleOrArtist`,
    payload
  )
  return ensureSuccess(data)
}
