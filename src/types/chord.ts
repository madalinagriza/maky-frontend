import type { ChordDiagram } from './recommendation'

export interface Chord {
  _id: string
  name: string
  notes: string[]
}

export type GetAllChordsResponse =
  | Chord[]
  | {
      chords: Chord[]
    }
  | Array<{
      chords: Chord[]
    }>

export interface ChordVocabularyResponse {
  chords: string[]
  chordsWithDiagrams?: string[]
  roots?: string[]
  suffixes?: string[]
  totalCount?: number
}

export interface ChordVocabulary {
  chords: string[]
  chordsWithDiagrams: string[]
  roots: string[]
  suffixes: string[]
  totalCount: number
}

export type AvailableChordDiagramsResponse =
  | string[]
  | {
      chordsWithDiagrams: string[]
    }

export type RawChordDiagramResponse =
  | ChordDiagram[]
  | {
      diagrams?: ChordDiagram[]
      diagram?: ChordDiagram[]
      name?: string
      chord?: string
      results?: Array<{
        diagrams?: ChordDiagram[]
        diagram?: ChordDiagram[]
      }>
    }

export interface ErrorResponse {
  error: string
}
