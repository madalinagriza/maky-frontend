export interface RegisterPayload {
  username: string
  email: string
  password: string
  isKidAccount: boolean
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
}

export interface ChangePasswordPayload {
  user: string
  oldPassword: string
  newPassword: string
}

export interface UpdateCredentialsPayload {
  user: string
  newUsername: string
  newEmail: string
}

export interface SetKidAccountStatusPayload {
  user: string
  status: boolean
}

export interface DeleteAccountPayload {
  user: string
  password: string
}

export interface SuccessResponse {
  success: boolean
}

export interface ErrorResponse {
  error: string
}
