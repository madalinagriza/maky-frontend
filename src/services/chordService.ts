import { apiClient } from './apiClient'
import type {
  Chord,
  GetAllChordsResponse,
  ErrorResponse,
  ChordVocabularyResponse,
  AvailableChordDiagramsResponse,
  RawChordDiagramResponse,
  ChordVocabulary,
  ChordSearchResponse,
  ChordSearchEntry,
} from '@/types/chord'
import type { ChordDiagram } from '@/types/recommendation'

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

function extractChord(entry: ChordSearchEntry | null | undefined): Chord | undefined {
  if (!entry) {
    return undefined
  }

  if ('name' in entry && 'notes' in entry) {
    return entry as Chord
  }

  if ('chord' in entry && entry.chord) {
    return entry.chord as Chord
  }

  return undefined
}

function normalizeChordSearchResponse(payload: ChordSearchResponse): Chord[] {
  if (Array.isArray(payload)) {
    return payload.map(extractChord).filter(Boolean) as Chord[]
  }

  if (payload && typeof payload === 'object' && 'results' in payload && Array.isArray(payload.results)) {
    return payload.results.map(extractChord).filter(Boolean) as Chord[]
  }

  return []
}

let cachedChords: Chord[] | null = null
let cachedVocabulary: ChordVocabulary | null = null

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
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    return []
  }

  try {
    const { data } = await apiClient.post<ChordSearchResponse | ErrorResponse>(
      `${CHORD_BASE}/_searchByName`,
      { query: trimmedQuery },
    )
    const payload = ensureSuccess(data)
    const matches = normalizeChordSearchResponse(payload)
    if (matches.length) {
      return matches
    }
  } catch (error) {
    console.warn('Chord search fallback to cached list due to error:', error)
  }

  const localChords = await getAllChords()
  const normalizedQuery = trimmedQuery.toLowerCase()
  return localChords.filter(chord => chord.name.toLowerCase().includes(normalizedQuery))
}

export async function resolveChordName(chordName: string): Promise<string | null> {
  const trimmedName = chordName?.trim()
  if (!trimmedName) {
    return null
  }

  const matches = await searchChordsByName(trimmedName)
  if (!matches.length) {
    return null
  }

  const normalized = trimmedName.toLowerCase()
  const exactMatch = matches.find(chord => chord.name.toLowerCase() === normalized)
  const fallback = exactMatch ?? matches[0]
  return fallback ? fallback.name : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }
  return value
    .map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
}

function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  return fallback
}

function extractDiagrams(payload: RawChordDiagramResponse): ChordDiagram[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (payload?.diagrams && Array.isArray(payload.diagrams)) {
    return payload.diagrams
  }

  if (payload?.diagram && Array.isArray(payload.diagram)) {
    return payload.diagram
  }

  if (Array.isArray(payload?.results) && payload.results.length > 0) {
    const entry = payload.results.find(item => Array.isArray(item?.diagrams) || Array.isArray(item?.diagram))
    if (entry?.diagrams && Array.isArray(entry.diagrams)) {
      return entry.diagrams
    }
    if (entry?.diagram && Array.isArray(entry.diagram)) {
      return entry.diagram
    }
  }

  return []
}

export async function getChordVocabulary(options: { refresh?: boolean } = {}) {
  if (!options.refresh && cachedVocabulary) {
    return cachedVocabulary
  }

  const { data } = await apiClient.post<ChordVocabularyResponse | ErrorResponse>(
    `${CHORD_BASE}/_getChordVocabulary`,
    {}
  )

  const payload = ensureSuccess(data)
  const chords = normalizeStringArray((payload as ChordVocabularyResponse)?.chords)
  const chordsWithDiagrams = normalizeStringArray(
    (payload as ChordVocabularyResponse)?.chordsWithDiagrams ?? []
  )
  const roots = normalizeStringArray((payload as ChordVocabularyResponse)?.roots)
  const suffixes = normalizeStringArray((payload as ChordVocabularyResponse)?.suffixes)
  const totalCount = normalizeNumber((payload as ChordVocabularyResponse)?.totalCount, chords.length)

  cachedVocabulary = {
    chords,
    chordsWithDiagrams,
    roots,
    suffixes,
    totalCount,
  }

  return cachedVocabulary
}

export async function getAvailableChordDiagrams(options: { refresh?: boolean } = {}) {
  if (!options.refresh && cachedVocabulary?.chordsWithDiagrams.length) {
    return cachedVocabulary.chordsWithDiagrams
  }

  const { data } = await apiClient.post<AvailableChordDiagramsResponse | ErrorResponse>(
    `${CHORD_BASE}/_getAvailableChordDiagrams`,
    {}
  )
  const payload = ensureSuccess(data)
  if (Array.isArray(payload)) {
    return normalizeStringArray(payload)
  }
  return normalizeStringArray((payload as { chordsWithDiagrams?: string[] })?.chordsWithDiagrams ?? [])
}

export async function getChordDiagramByName(name: string) {
  const trimmed = name?.trim()
  if (!trimmed) {
    return [] as ChordDiagram[]
  }

  const { data } = await apiClient.post<RawChordDiagramResponse | ErrorResponse>(
    `${CHORD_BASE}/_getChordDiagram`,
    { name: trimmed },
  )
  const payload = ensureSuccess(data)
  return extractDiagrams(payload)
}
