import { apiClient } from './apiClient'
import type {
  CreateProfilePayload,
  CreateProfileResponse,
  UpdateDisplayNamePayload,
  UpdateBioPayload,
  UpdateAvatarPayload,
  SetGenrePreferencesPayload,
  ChangeSkillLevelPayload,
  SetTargetSongPayload,
  ErrorResponse,
} from '@/types/userProfile'

const USER_PROFILE_BASE = '/UserProfile'

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

export async function createProfile(payload: CreateProfilePayload) {
  const { data } = await apiClient.post<CreateProfileResponse | ErrorResponse>(
    `${USER_PROFILE_BASE}/createProfile`,
    payload
  )
  return ensureSuccess(data)
}

export async function updateDisplayName(payload: UpdateDisplayNamePayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/updateDisplayName`,
    payload
  )
  ensureSuccess(data)
}

export async function updateBio(payload: UpdateBioPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/updateBio`,
    payload
  )
  ensureSuccess(data)
}

export async function updateAvatar(payload: UpdateAvatarPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/updateAvatar`,
    payload
  )
  ensureSuccess(data)
}

export async function setGenrePreferences(payload: SetGenrePreferencesPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/setGenrePreferences`,
    payload
  )
  ensureSuccess(data)
}

export async function changeSkillLevel(payload: ChangeSkillLevelPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/changeSkillLevel`,
    payload
  )
  ensureSuccess(data)
}

export async function setTargetSong(payload: SetTargetSongPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/setTargetSong`,
    payload
  )
  ensureSuccess(data)
}

export async function removeTargetSong(sessionId: string) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/removeTargetSong`,
    { sessionId }
  )
  ensureSuccess(data)
}

export async function deleteProfile(sessionId: string) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_PROFILE_BASE}/deleteProfile`,
    { sessionId }
  )
  ensureSuccess(data)
}

// Query: _getProfile — returns an array (query-style). We return the first profile object or null.
// Accept either a sessionId string or an object with `{ user?: string; sessionId?: string }`.
export async function getProfile(
  identifier: string | { user?: string; sessionId?: string }
) {
  const body =
    typeof identifier === 'string'
      ? { sessionId: identifier }
      : identifier.user
      ? { user: identifier.user }
      : { sessionId: identifier.sessionId }

  const { data } = await apiClient.post<any | ErrorResponse>(
    `${USER_PROFILE_BASE}/_getProfile`,
    body
  )

  const payload = ensureSuccess<any>(data)

  // Query-style response: return first element's `profile` if wrapped, or first item.
  if (Array.isArray(payload) && payload.length > 0) {
    // Some syncs wrap the profile in an object: { profile: {...} }
    const first = payload[0]
    if (first && typeof first === 'object' && 'profile' in first) return first.profile
    return first
  }
  return null
}

