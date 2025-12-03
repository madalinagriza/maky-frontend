import { apiClient } from './apiClient'
import type {
  JamGroup,
  CreateJamGroupPayload,
  CreateJamGroupResponse,
  AddMemberPayload,
  RemoveUserPayload,
  DisbandJamGroupPayload,
  GetJamGroupByIdPayload,
  GetCommonChordsPayload,
  GetCommonChordsResponse,
  GetPlayableSongsForGroupPayload,
  SuccessResponse,
  ErrorResponse,
} from '@/types/jamGroup'
import type { Song } from '@/types/song'

const JAM_GROUP_BASE = '/JamGroup'

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

export async function getJamGroupsForUser() {
  const { data } = await apiClient.post<JamGroup[] | ErrorResponse>(
    `${JAM_GROUP_BASE}/_getJamGroupsForUser`,
    {}
  )
  return ensureSuccess(data)
}

export async function getJamGroupById(groupId: string) {
  const payload: GetJamGroupByIdPayload = { sessionId: '', group: groupId }
  const { data } = await apiClient.post<JamGroup[] | ErrorResponse>(
    `${JAM_GROUP_BASE}/_getJamGroupById`,
    payload
  )
  const response = ensureSuccess(data)
  return response.length > 0 ? response[0] : null
}

export async function createJamGroup(name: string, description: string) {
  const payload: CreateJamGroupPayload = {
    sessionId: '',
    name,
    description,
  }
  const { data } = await apiClient.post<CreateJamGroupResponse | ErrorResponse>(
    `${JAM_GROUP_BASE}/createJamGroup`,
    payload
  )
  return ensureSuccess(data)
}

export async function addMemberToGroup(groupId: string, memberId: string) {
  const payload: AddMemberPayload = {
    sessionId: '',
    group: groupId,
    newMember: memberId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_GROUP_BASE}/addMember`,
    payload
  )
  return ensureSuccess(data)
}

export async function removeUserFromGroup(groupId: string, userId: string) {
  const payload: RemoveUserPayload = {
    sessionId: '',
    group: groupId,
    user: userId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_GROUP_BASE}/removeUserFromJamGroup`,
    payload
  )
  return ensureSuccess(data)
}

export async function disbandJamGroup(groupId: string) {
  const payload: DisbandJamGroupPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${JAM_GROUP_BASE}/disbandJamGroup`,
    payload
  )
  return ensureSuccess(data)
}

export async function getCommonChordsForGroup(groupId: string) {
  const payload: GetCommonChordsPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<GetCommonChordsResponse | ErrorResponse>(
    `${JAM_GROUP_BASE}/_getCommonChordsForGroup`,
    payload
  )
  return ensureSuccess(data)
}

export async function getPlayableSongsForGroup(groupId: string) {
  const payload: GetPlayableSongsForGroupPayload = {
    sessionId: '',
    group: groupId,
  }
  const { data } = await apiClient.post<Song[] | ErrorResponse>(
    `${JAM_GROUP_BASE}/_getPlayableSongsForGroup`,
    payload
  )
  return ensureSuccess(data)
}

