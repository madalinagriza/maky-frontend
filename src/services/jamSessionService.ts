import { apiClient } from './apiClient'
import type {
  JamSession,
  StartJamSessionPayload,
  import type {
    JamSession,
    JamSessionResultsResponse,
    JamSessionResultEntry,
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
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    payload
  )
  return ensureSuccess(data)
    return normalizeJamSessionList(ensureSuccess(data))

export async function getJamSessionById(sessionId: string) {
  const payload: GetJamSessionByIdPayload = {
    sessionId: '',
    session: sessionId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    payload
  )
  const response = ensureSuccess(data)
    const response = normalizeJamSessionList(ensureSuccess(data))
    return response[0] ?? null

export async function getActiveSessionForGroup(groupId: string) {
  const payload: GetActiveSessionForGroupPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<JamSession[] | ErrorResponse>(
    const { data } = await apiClient.post<JamSession[] | JamSessionResultsResponse | ErrorResponse>(
    payload
  )
  const response = ensureSuccess(data)
    const response = normalizeJamSessionList(ensureSuccess(data))
    return response[0] ?? null

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

