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

export interface ErrorResponse {
  error: string
}
