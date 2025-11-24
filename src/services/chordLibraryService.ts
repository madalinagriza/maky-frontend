import { apiClient } from './apiClient'
import type {
  AddChordToInventoryPayload,
  UpdateChordMasteryPayload,
  RemoveChordFromInventoryPayload,
  GetKnownChordsResponse,
  ErrorResponse,
} from '@/types/chordLibrary'

const CHORD_LIBRARY_BASE = '/ChordLibrary'

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
    `${CHORD_LIBRARY_BASE}/addUser`,
    { sessionId }
  )
  ensureSuccess(data)
}

export async function addChordToInventory(payload: AddChordToInventoryPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${CHORD_LIBRARY_BASE}/addChordToInventory`,
    payload
  )
  ensureSuccess(data)
}

export async function updateChordMastery(payload: UpdateChordMasteryPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${CHORD_LIBRARY_BASE}/updateChordMastery`,
    payload
  )
  ensureSuccess(data)
}

export async function removeChordFromInventory(payload: RemoveChordFromInventoryPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${CHORD_LIBRARY_BASE}/removeChordFromInventory`,
    payload
  )
  ensureSuccess(data)
}

export async function removeUser(sessionId: string) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${CHORD_LIBRARY_BASE}/removeUser`,
    { sessionId }
  )
  ensureSuccess(data)
}

export async function getKnownChords(sessionId: string) {
  const { data } = await apiClient.post<GetKnownChordsResponse | ErrorResponse>(
    `${CHORD_LIBRARY_BASE}/_getKnownChords`,
    { sessionId }
  )
  const payload = ensureSuccess<GetKnownChordsResponse>(data)

  if (Array.isArray(payload)) {
    return payload
  }

  if (payload && 'knownChords' in payload && Array.isArray(payload.knownChords)) {
    return payload.knownChords
  }

  return []
}

