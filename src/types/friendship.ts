export interface SendFriendRequestPayload {
  sessionId: string
  recipient: string
}

export interface SendFriendRequestResponse {
  friendship: string
}

export interface AcceptFriendRequestPayload {
  sessionId: string
  requester: string
}

export interface DeclineFriendRequestPayload {
  sessionId: string
  requester: string
}

export interface RemoveFriendPayload {
  sessionId: string
  otherUser: string
}

export interface AreFriendsPayload {
  sessionId: string
  otherUser: string
}

export interface AreFriendsResponse {
  isFriend: boolean
}

export interface ErrorResponse {
  error: string
}

export interface PendingFriendshipsPayload {
  user: string
}

export interface PendingFriendship {
  requester: string
}

export interface PendingFriendshipsResponse {
  pendingFriendships: PendingFriendship[]
}

export interface GetFriendsPayload {
  user: string
}

export interface FriendEntry {
  friend: string
}

