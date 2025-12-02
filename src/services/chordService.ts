import { apiClient } from './apiClient'
import type { Chord, GetAllChordsResponse, ErrorResponse } from '@/types/chord'

const CHORD_BASE = '/Chord'

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

function normalizeChordResponse(payload: GetAllChordsResponse): Chord[] {
  if (Array.isArray(payload)) {
    if (payload.length && 'name' in (payload[0] as any)) {
      return payload as Chord[]
    }

    return payload.flatMap(entry => {
      if (entry && typeof entry === 'object' && 'chords' in entry && Array.isArray(entry.chords)) {
        return entry.chords as Chord[]
      }
      return []
    })
  }

  if (payload && typeof payload === 'object' && 'chords' in payload && Array.isArray(payload.chords)) {
    return payload.chords as Chord[]
  }

  return []
}

let cachedChords: Chord[] | null = null

export async function getAllChords(): Promise<Chord[]> {
  if (cachedChords && cachedChords.length) {
    return cachedChords
  }

  const { data } = await apiClient.post<GetAllChordsResponse | ErrorResponse>(
    `${CHORD_BASE}/_getAllChords`,
    {}
  )
  const chords = normalizeChordResponse(ensureSuccess(data))
  cachedChords = chords
  return chords
}

export async function searchChordsByName(query: string): Promise<Chord[]> {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) {
    return []
  }

  const chords = await getAllChords()
  return chords.filter(chord => chord.name.toLowerCase().includes(normalizedQuery))
}
