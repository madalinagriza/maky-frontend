export interface CreateProfilePayload {
  sessionId: string
  displayName: string
  genrePreferences: string[]
  skillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface CreateProfileResponse {
  profile: string
}

export interface UpdateDisplayNamePayload {
  sessionId: string
  newDisplayName: string
}

export interface UpdateBioPayload {
  sessionId: string
  newBio?: string
  bio?: string
}

export interface UpdateAvatarPayload {
  sessionId: string
  newAvatarUrl?: string
}

export interface SetGenrePreferencesPayload {
  sessionId: string
  newGenrePreferences: string[]
}

export interface ChangeSkillLevelPayload {
  sessionId: string
  newSkillLevel: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
}

export interface SetTargetSongPayload {
  sessionId: string
  song: string
}

export interface ErrorResponse {
  error: string
}

export interface DisplayNameSearchResult {
  user: string
  displayName: string
}

export type GetProfilePayload =
  | { sessionId: string; user?: string }
  | { user: string }
  | { sessionId: string }

