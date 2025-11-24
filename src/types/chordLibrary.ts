export interface AddChordToInventoryPayload {
  sessionId: string
  chord: string
  mastery: 'na' | 'in progress' | 'mastered'
}

export interface UpdateChordMasteryPayload {
  sessionId: string
  chord: string
  newMastery: 'na' | 'in progress' | 'mastered'
}

export interface RemoveChordFromInventoryPayload {
  sessionId: string
  chord: string
}

export interface KnownChord {
  chord: string
  mastery: string
}

export type GetKnownChordsResponse =
  | KnownChord[]
  | {
      knownChords: KnownChord[]
    }

export interface ErrorResponse {
  error: string
}

