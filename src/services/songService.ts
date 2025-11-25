import { apiClient } from './apiClient'
import type {
  GetPlayableSongsPayload,
  FilterSongsByGenrePayload,
  SearchSongsPayload,
  SongResponse,
  PlayableSongsRawResponse,
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
  const { data } = await apiClient.post<PlayableSongsRawResponse | ErrorResponse>(
    `${SONG_BASE}/_getPlayableSongs`,
    payload
  )
  const payloadData = ensureSuccess<PlayableSongsRawResponse>(data)

  if (Array.isArray(payloadData)) {
    return payloadData
  }

  if (payloadData && Array.isArray(payloadData.songs)) {
    return payloadData.songs
  }

  return []
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
