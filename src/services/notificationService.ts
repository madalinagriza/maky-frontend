import { apiClient } from './apiClient'
import type {
  GetNotificationsPayload,
  GetNotificationsResponse,
  MarkNotificationReadPayload,
  ErrorResponse,
} from '@/types/notification'

const NOTIFICATION_BASE = '/Notification'

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

// Placeholder implementation - assumes API exists
export async function getNotifications(payload: GetNotificationsPayload) {
  const { data } = await apiClient.post<GetNotificationsResponse | ErrorResponse>(
    `${NOTIFICATION_BASE}/_getNotifications`,
    payload
  )
  return ensureSuccess(data)
}

export async function markNotificationRead(payload: MarkNotificationReadPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${NOTIFICATION_BASE}/markNotificationRead`,
    payload
  )
  ensureSuccess(data)
}

