import { apiClient } from './apiClient'
import type {
  RegisterPayload,
  RegisterResponse,
  LoginPayload,
  LoginResponse,
  ChangePasswordPayload,
  UpdateCredentialsPayload,
  SetKidAccountStatusPayload,
  SetPrivateAccountStatusPayload,
  DeleteAccountPayload,
  SuccessResponse,
  ErrorResponse,
  IsKidOrPrivateAccountPayload,
  IsKidOrPrivateAccountResponse,
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
  // Payload now contains `username` which matches backend expectations.
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

export async function setPrivateAccountStatus(payload: SetPrivateAccountStatusPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${USER_ACCOUNT_BASE}/setPrivateAccountStatus`,
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

export async function getIsKidOrPrivateAccount(
  payload: IsKidOrPrivateAccountPayload
): Promise<IsKidOrPrivateAccountResponse> {
  const { data } = await apiClient.post<any>(
    `${USER_ACCOUNT_BASE}/_isKidOrPrivateAccount`,
    payload
  )

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  const results = Array.isArray(data) ? data : data?.results || []
  return results as IsKidOrPrivateAccountResponse
}
