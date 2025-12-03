export type JamSessionStatus = 'ACTIVE' | 'COMPLETED' | 'SCHEDULED'

export interface SharedSong {
  song: string
  participant: string
  currentStatus: string
}

export interface JamSession {
  _id: string
  jamGroup: string
  startTime: string
  endTime?: string
  participants: string[]
  sharedSongs: SharedSong[]
  status: JamSessionStatus
}

export interface StartJamSessionPayload {
  sessionId: string
  group: string
}

export interface StartJamSessionResponse {
  session: string
}

export interface ScheduleJamSessionPayload {
  sessionId: string
  group: string
  startTime: string
}

export interface JoinSessionPayload {
  sessionId: string
  session: string
}

export interface EndJamSessionPayload {
  sessionId: string
  session: string
}

export interface ShareSongInSessionPayload {
  sessionId: string
  session: string
  song: string
  currentStatus: string
}

export interface UpdateSharedSongStatusPayload {
  sessionId: string
  session: string
  song: string
  newStatus: string
}

export interface GetJamSessionsForGroupPayload {
  sessionId: string
  group: string
}

export interface GetJamSessionByIdPayload {
  sessionId: string
  session: string
}

export interface GetActiveSessionForGroupPayload {
  sessionId: string
  group: string
}

export interface SuccessResponse {
  success: boolean
}

export interface ErrorResponse {
  error: string
}

export interface JamSessionResultEntry {
  session?: JamSession
  sessionData?: JamSession
}

export interface JamSessionResultsResponse {
  results: Array<JamSession | JamSessionResultEntry>
}

