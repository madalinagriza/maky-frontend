import { apiClient } from './apiClient'
import type {
  SendFriendRequestPayload,
  SendFriendRequestResponse,
  AcceptFriendRequestPayload,
  DeclineFriendRequestPayload,
  RemoveFriendPayload,
  AreFriendsPayload,
  AreFriendsResponse,
  ErrorResponse,
} from '@/types/friendship'

const FRIENDSHIP_BASE = '/Friendship'

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

export async function sendFriendRequest(payload: SendFriendRequestPayload) {
  const { data } = await apiClient.post<SendFriendRequestResponse | ErrorResponse>(
    `${FRIENDSHIP_BASE}/sendFriendRequest`,
    payload
  )
  return ensureSuccess(data)
}

export async function acceptFriendRequest(payload: AcceptFriendRequestPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${FRIENDSHIP_BASE}/acceptFriendRequest`,
    payload
  )
  ensureSuccess(data)
}

export async function declineFriendRequest(payload: DeclineFriendRequestPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${FRIENDSHIP_BASE}/declineFriendRequest`,
    payload
  )
  ensureSuccess(data)
}

export async function removeFriend(payload: RemoveFriendPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${FRIENDSHIP_BASE}/removeFriend`,
    payload
  )
  ensureSuccess(data)
}

export async function areFriends(payload: AreFriendsPayload) {
  const { data } = await apiClient.post<AreFriendsResponse[] | ErrorResponse>(
    `${FRIENDSHIP_BASE}/_areFriends`,
    payload
  )
  return ensureSuccess(data)
}

