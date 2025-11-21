import { apiClient } from './apiClient'
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
  UpdateCredentialsPayload,
  SetKidAccountStatusPayload,
  DeleteAccountPayload,
  SuccessResponse,
  ErrorResponse,
} from '@/types/userAccount'

const USER_ACCOUNT_BASE = '/UserAccount'

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

export async function registerUser(payload: RegisterPayload) {
  const { data } = await apiClient.post<RegisterResponse | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/register`,
    payload
  )
  return ensureSuccess(data)
}

export async function loginUser(payload: LoginPayload) {
  const { data } = await apiClient.post<LoginResponse | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/login`,
    payload
  )
  return ensureSuccess(data)
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/changePassword`,
    payload
  )
  return ensureSuccess(data)
}

export async function updateCredentials(payload: UpdateCredentialsPayload) {
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/updateCredentials`,
    payload
  )
  return ensureSuccess(data)
}

export async function setKidAccountStatus(payload: SetKidAccountStatusPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/setKidAccountStatus`,
    payload
  )
  ensureSuccess(data)
}

export async function deleteAccount(payload: DeleteAccountPayload) {
  const { data } = await apiClient.post<SuccessResponse | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/deleteAccount`,
    payload
  )
  return ensureSuccess(data)
}
