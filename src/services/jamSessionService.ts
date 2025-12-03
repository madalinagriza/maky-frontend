import { apiClient } from './apiClient'
import type {
  JamSession,
  StartJamSessionPayload,
  StartJamSessionResponse,
  ScheduleJamSessionPayload,
  JoinSessionPayload,
  EndJamSessionPayload,
  ShareSongInSessionPayload,
  UpdateSharedSongStatusPayload,
  GetJamSessionsForGroupPayload,
  GetJamSessionByIdPayload,
  GetActiveSessionForGroupPayload,
  SuccessResponse,
  ErrorResponse,
} from '@/types/jamSession'

const JAM_SESSION_BASE = '/JamSession'

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

export async function getJamSessionsForGroup(groupId: string) {
  const payload: GetJamSessionsForGroupPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getJamSessionsForGroup`,
    payload
  )
  return ensureSuccess(data)
}

export async function getJamSessionById(sessionId: string) {
  const payload: GetJamSessionByIdPayload = {
    sessionId: '',
    session: sessionId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getJamSessionById`,
    payload
  )
  const response = ensureSuccess(data)
  return response.length > 0 ? response[0] : null
}

export async function getActiveSessionForGroup(groupId: string) {
  const payload: GetActiveSessionForGroupPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getActiveSessionForGroup`,
    payload
  )
  const response = ensureSuccess(data)
  return response.length > 0 ? response[0] : null
}

export async function startJamSession(groupId: string) {
  const payload: StartJamSessionPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<StartJamSessionResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/startJamSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function scheduleJamSession(groupId: string, startTime: string) {
  const payload: ScheduleJamSessionPayload = {
    sessionId: '',
    group: groupId,
    startTime,
  }
  const { data } = await apiClient.post<StartJamSessionResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/scheduleJamSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function joinSession(sessionId: string) {
  const payload: JoinSessionPayload = {
    sessionId: '',
    session: sessionId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/joinSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function endJamSession(sessionId: string) {
  const payload: EndJamSessionPayload = {
    sessionId: '',
    session: sessionId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/endJamSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function shareSongInSession(
  sessionId: string,
  songId: string,
  currentStatus: string
) {
  const payload: ShareSongInSessionPayload = {
    sessionId: '',
    session: sessionId,
    song: songId,
    currentStatus,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/shareSongInSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function updateSharedSongStatus(
  sessionId: string,
  songId: string,
  newStatus: string
) {
  const payload: UpdateSharedSongStatusPayload = {
    sessionId: '',
    session: sessionId,
    song: songId,
    newStatus,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/updateSharedSongStatus`,
    payload
  )
  return ensureSuccess(data)
}

