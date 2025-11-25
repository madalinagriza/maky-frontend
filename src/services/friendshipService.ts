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
  const { data } = await apiClient.post<any>(
    `${FRIENDSHIP_BASE}/_areFriends`,
    payload
  )
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  const results = Array.isArray(data) ? data : (data.results || [])
  return results as AreFriendsResponse[]
}

export async function getPendingFriendships(payload: PendingFriendshipsPayload) {
  const { data } = await apiClient.post<any>(
    `${FRIENDSHIP_BASE}/_getPendingFriendships`,
    payload
  )
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  const results = Array.isArray(data) ? data : (data.results || [])
  
  if (results.length === 0) return []
  const first = results[0] as PendingFriendshipsResponse
  if (!first || !Array.isArray(first.pendingFriendships)) return []
  return first.pendingFriendships
}

export async function getFriends(payload: GetFriendsPayload) {
  const { data } = await apiClient.post<any>(
    `${FRIENDSHIP_BASE}/_getFriends`,
    payload
  )
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle various response formats:
  // 1. Direct array: [{ friend: 'id' }]
  // 2. Wrapper with results: { results: [{ friend: 'id' }] }
  // 3. Wrapper with friends property (as seen in trace): { friends: [{ friend: 'id' }] }
  let rawList: FriendEntry[] = []
  
  if (Array.isArray(data)) {
    rawList = data
  } else if (Array.isArray(data?.results)) {
    rawList = data.results
  } else if (Array.isArray(data?.friends)) {
    rawList = data.friends
  }

  return rawList
    .map((entry: FriendEntry) => entry?.friend)
    .filter((friend: string | undefined): friend is string => Boolean(friend))
}

