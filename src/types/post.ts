export interface CreatePostPayload {
  sessionId: string
  content: string
  postType: 'PROGRESS' | 'GENERAL'
  items: string[]
}

export interface CreatePostResponse {
  postId: string
}

export interface DeletePostPayload {
  sessionId: string
  postId: string
}

export interface EditPostPayload {
  sessionId: string
  postId: string
  newContent: string
  newItem?: string
  newPostType?: 'PROGRESS' | 'GENERAL'
}

export interface AddCommentToPostPayload {
  sessionId: string
  post: string
  content: string
}

export interface AddCommentToPostResponse {
  comment: string
}

export interface DeleteCommentPayload {
  sessionId: string
  comment: string
}

export interface EditCommentPayload {
  sessionId: string
  comment: string
  newContent: string
}

export interface AddReactionToPostPayload {
  sessionId: string
  post: string
  type: 'LIKE' | 'LOVE' | 'CELEBRATE'
}

export interface AddReactionToPostResponse {
  reaction: string
}

export interface ChangeReactionTypePayload {
  sessionId: string
  post: string
  newType: 'LIKE' | 'LOVE' | 'CELEBRATE'
}

export interface RemoveReactionFromPostPayload {
  sessionId: string
  post: string
}

export interface ErrorResponse {
  error: string
}

