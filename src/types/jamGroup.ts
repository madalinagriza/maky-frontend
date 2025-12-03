export interface JamGroup {
  _id: string
  name: string
  description: string
  creator: string
  members: string[]
  createdAt: string
}

export interface JamGroupMember {
  username: string
  displayName?: string
  avatarUrl?: string
}

export interface CreateJamGroupPayload {
  sessionId: string
  name: string
  description: string
}

export interface CreateJamGroupResponse {
  group: string
}

export interface AddMemberPayload {
  sessionId: string
  group: string
  newMember: string
}

export interface RemoveUserPayload {
  sessionId: string
  group: string
  user: string
}

export interface DisbandJamGroupPayload {
  sessionId: string
  group: string
}

export interface GetJamGroupByIdPayload {
  sessionId: string
  group: string
}

export interface GetCommonChordsPayload {
  sessionId: string
  group: string
}

export interface GetCommonChordsResponse {
  commonChords: string[]
}

export interface GetPlayableSongsForGroupPayload {
  sessionId: string
  group: string
}

export interface SuccessResponse {
  success: boolean
}

export interface ErrorResponse {
  error: string
}

