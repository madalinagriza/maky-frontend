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
  PendingFriendshipsPayload,
  PendingFriendship,
  PendingFriendshipsResponse,
  GetFriendsPayload,
  FriendEntry,
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

export async function getPendingFriendships(payload: PendingFriendshipsPayload) {
  const { data } = await apiClient.post<PendingFriendshipsResponse[] | ErrorResponse>(
    `${FRIENDSHIP_BASE}/_getPendingFriendships`,
    payload
  )
  const response = ensureSuccess(data)
  if (!Array.isArray(response) || response.length === 0) return []
  const [first] = response
  if (!first || !Array.isArray(first.pendingFriendships)) return []
  return first.pendingFriendships as PendingFriendship[]
}

export async function getFriends(payload: GetFriendsPayload) {
  const { data } = await apiClient.post<FriendEntry[] | ErrorResponse>(
    `${FRIENDSHIP_BASE}/_getFriends`,
    payload
  )
  const response = ensureSuccess(data)
  if (!Array.isArray(response)) return []
  return response
    .map(entry => entry?.friend)
    .filter((friend): friend is string => Boolean(friend))
}

