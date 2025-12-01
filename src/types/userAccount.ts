export interface RegisterPayload {
  username: string
  email: string
  password: string
  isKidAccount: boolean
  isPrivateAccount: boolean
}

export interface RegisterResponse {
  user: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  user: string
  sessionId: string
}

export interface ChangePasswordPayload {
  sessionId: string
  oldPassword: string
  newPassword: string
}

export interface UpdateCredentialsPayload {
  sessionId: string
  newUsername: string
  newEmail: string
}

export interface SetKidAccountStatusPayload {
  sessionId: string
  status: boolean
}

export interface SetPrivateAccountStatusPayload {
  sessionId: string
  status: boolean
}

export interface IsKidOrPrivateAccountPayload {
  user: string
}

export interface IsKidOrPrivateAccountResponseItem {
  isKidOrPrivate: boolean
}

export type IsKidOrPrivateAccountResponse = IsKidOrPrivateAccountResponseItem[]

export interface DeleteAccountPayload {
  sessionId: string
  password: string
}

export interface SuccessResponse {
  success: boolean
}

export interface ErrorResponse {
  error: string
}
