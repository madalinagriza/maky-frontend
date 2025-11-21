import { apiClient } from './apiClient'
import type {
  StartLearningSongPayload,
  UpdateSongMasteryPayload,
  StopLearningSongPayload,
  GetPlayableSongsPayload,
  GetSongsInProgressResponse,
  FilterSongsByGenrePayload,
  ErrorResponse,
} from '@/types/songLibrary'

const SONG_LIBRARY_BASE = '/SongLibrary'

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

export async function addUser(sessionId: string) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/addUser`,
    { sessionId }
  )
  ensureSuccess(data)
}

export async function startLearningSong(payload: StartLearningSongPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/startLearningSong`,
    payload
  )
  ensureSuccess(data)
}

export async function updateSongMastery(payload: UpdateSongMasteryPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/updateSongMastery`,
    payload
  )
  ensureSuccess(data)
}

export async function stopLearningSong(payload: StopLearningSongPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/stopLearningSong`,
    payload
  )
  ensureSuccess(data)
}

export async function removeUser(sessionId: string) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/removeUser`,
    { sessionId }
  )
  ensureSuccess(data)
}

export async function getPlayableSongs(payload: GetPlayableSongsPayload) {
  const { data } = await apiClient.post<{ songs: string[] }[] | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/_getPlayableSongs`,
    payload
  )
  return ensureSuccess(data)
}

export async function getSongsInProgress(sessionId: string) {
  const { data } = await apiClient.post<GetSongsInProgressResponse | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/_getSongsInProgress`,
    { sessionId }
  )
  return ensureSuccess(data)
}

export async function filterSongsByGenre(payload: FilterSongsByGenrePayload) {
  const { data } = await apiClient.post<{ songs: string[] }[] | ErrorResponse>(
    `${SONG_LIBRARY_BASE}/_filterSongsByGenre`,
    payload
  )
  return ensureSuccess(data)
}

