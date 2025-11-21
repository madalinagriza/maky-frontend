// Placeholder types for future notification API
export interface Notification {
  id: string
  type: 'friend_request' | 'post_reaction' | 'comment' | 'other'
  message: string
  timestamp: string
  read: boolean
}

export interface GetNotificationsPayload {
  sessionId: string
}

export interface GetNotificationsResponse extends Array<Notification> {}

export interface MarkNotificationReadPayload {
  sessionId: string
  notificationId: string
}

export interface ErrorResponse {
  error: string
}

