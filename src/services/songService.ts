import { apiClient } from './apiClient'
import type {
  GetPlayableSongsPayload,
  FilterSongsByGenrePayload,
  SearchSongsPayload,
  SongResponse,
  PlayableSongsRawResponse,
  ErrorResponse,
  Song,
} from '@/types/song'

const SONG_BASE = '/Song'
const SONG_CATALOG_QUERIES = ['la', 'er', 'an', 'ti', 'on', 'ch', 'st', 'ra']
const MAX_CATALOG_SIZE = 120
let cachedSongCatalog: Song[] | null = null

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
  const { data } = await apiClient.post<SongResponse[] | { songs: SongResponse[] } | ErrorResponse>(
    `${SONG_BASE}/_searchByTitleOrArtist`,
    payload
  )
  const response = ensureSuccess(data)

  if (Array.isArray(response)) {
    return response
  }

  if (response && Array.isArray(response.songs)) {
    return response.songs
  }

  return []
}

const isValidSong = (song: Song | undefined | null): song is Song =>
  Boolean(song && song._id && song.title)

export async function getSongCatalog(options: { refresh?: boolean } = {}) {
  if (!options.refresh && cachedSongCatalog?.length) {
    return cachedSongCatalog
  }

  const songMap = new Map<string, Song>()

  for (const query of SONG_CATALOG_QUERIES) {
    try {
      const results = await searchByTitleOrArtist({ query })
      results
        .map(entry => entry.song)
        .filter(isValidSong)
        .forEach(song => songMap.set(song._id, song))
    } catch (error) {
      console.warn(`Song search failed for query "${query}":`, error)
    }

    if (songMap.size >= MAX_CATALOG_SIZE) {
      break
    }
  }

  cachedSongCatalog = Array.from(songMap.values())
  return cachedSongCatalog
}
