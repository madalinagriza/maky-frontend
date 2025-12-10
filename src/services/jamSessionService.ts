import { apiClient } from './apiClient'
import { getSessionId } from '@/utils/sessionStorage'
import type {
  JamSession,
  JamSessionResultEntry,
  JamSessionResultsResponse,
  StartJamSessionPayload,
  StartJamSessionResponse,
  ScheduleJamSessionPayload,
  JoinSessionPayload,
  EndJamSessionPayload,
  ShareSongInSessionPayload,
  UpdateSongLogFrequencyPayload,
  GetJamSessionsForGroupPayload,
  GetJamSessionByIdPayload,
  GetActiveSessionForGroupPayload,
  SuccessResponse,
  ErrorResponse,
} from '@/types/jamSession'

const JAM_SESSION_BASE = '/JamSession'

function getAuthSessionId(): string {
  const sessionId = getSessionId()
  if (!sessionId) {
    throw new Error('Not authenticated. Please log in.')
  }
  return sessionId
}

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

function normalizeJamSessionList(payload: unknown): JamSession[] {
  if (Array.isArray(payload)) {
    return payload
  }

  if (
    payload &&
    typeof payload === 'object' &&
    'results' in payload &&
    Array.isArray((payload as JamSessionResultsResponse).results)
  ) {
    const entries = (payload as JamSessionResultsResponse).results
    return entries
      .map(entry => extractJamSession(entry))
      .filter((session): session is JamSession => Boolean(session))
  }

  if (!payload) {
    return []
  }

  throw new Error(
    `Unexpected jam sessions response format received from server (received ${describePayload(payload)}).`
  )
}

function extractJamSession(
  entry: JamSession | JamSessionResultEntry | null | undefined
): JamSession | undefined {
  if (!entry) {
    return undefined
  }

  if (isJamSessionResultEntry(entry)) {
    return entry.session ?? entry.sessionData ?? undefined
  }

  return entry as JamSession
}

function isJamSessionResultEntry(entry: unknown): entry is JamSessionResultEntry {
  if (!entry || typeof entry !== 'object') {
    return false
  }

  return 'session' in entry || 'sessionData' in entry
}

function describePayload(payload: unknown): string {
  if (payload === null) {
    return 'null'
  }

  if (Array.isArray(payload)) {
    return `array(length=${payload.length})`
  }

  const payloadType = typeof payload
  if (payloadType !== 'object') {
    return payloadType
  }

  const keys = Object.keys(payload as Record<string, unknown>)
  if (!keys.length) {
    return 'object(with no enumerable keys)'
  }

  const preview = keys.slice(0, 5).join(', ')
  const suffix = keys.length > 5 ? ` +${keys.length - 5} more` : ''
  return `object(keys: ${preview}${suffix})`
}

export async function getJamSessionsForGroup(groupId: string) {
  const payload: GetJamSessionsForGroupPayload = {
    sessionId: getAuthSessionId(),
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getJamSessionsForGroup`,
    payload
  )
  return normalizeJamSessionList(ensureSuccess(data))
}

export async function getJamSessionById(sessionId: string) {
  const payload: GetJamSessionByIdPayload = {
    sessionId: getAuthSessionId(),
    session: sessionId,
  }
  const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getJamSessionById`,
    payload
  )
  const response = normalizeJamSessionList(ensureSuccess(data))
  return response[0] ?? null
}

export async function getActiveSessionForGroup(groupId: string) {
  const payload: GetActiveSessionForGroupPayload = {
    sessionId: getAuthSessionId(),
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/_getActiveSessionForGroup`,
    payload
  )
  const response = normalizeJamSessionList(ensureSuccess(data))
  return response[0] ?? null
}

export async function startJamSession(groupId: string) {
  const payload: StartJamSessionPayload = {
    sessionId: getAuthSessionId(),
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
    sessionId: getAuthSessionId(),
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
    sessionId: getAuthSessionId(),
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
    sessionId: getAuthSessionId(),
    session: sessionId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/endJamSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function shareSongInSession(sessionId: string, songId: string, frequency: number) {
  const payload: ShareSongInSessionPayload = {
    sessionId: getAuthSessionId(),
    session: sessionId,
    song: songId,
    frequency,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/shareSongInSession`,
    payload
  )
  return ensureSuccess(data)
}

export async function updateSongLogFrequency(
  sessionId: string,
  songId: string,
  newFrequency: number
) {
  const payload: UpdateSongLogFrequencyPayload = {
    sessionId: getAuthSessionId(),
    session: sessionId,
    song: songId,
    newFrequency,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_SESSION_BASE}/updateSongLogFrequency`,
    payload
  )
  return ensureSuccess(data)
}

