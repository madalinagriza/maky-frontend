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

