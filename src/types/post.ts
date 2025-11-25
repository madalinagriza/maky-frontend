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

export type ReactionType = 'LIKE' | 'LOVE' | 'CELEBRATE'

export interface AddReactionToPostPayload {
  sessionId: string
  post: string
  type: ReactionType
}

export interface AddReactionToPostResponse {
  reaction: string
}

export interface ChangeReactionTypePayload {
  sessionId: string
  post: string
  newType: ReactionType
}

export interface RemoveReactionFromPostPayload {
  sessionId: string
  post: string
}

export interface GetReactionsForPostIdPayload {
  post: string
}

export interface ReactionCount {
  type: ReactionType
  count: number
}

export type GetReactionsForPostIdResponse = ReactionCount[]

export interface GetPostsForUserPayload {
  user: string
}

export interface GetPostsForUsersPayload {
  users: string[]
}

export interface Post {
  _id: string
  author: string
  content: string
  items: string[]
  postType: string
  createdAt: string
  editedAt?: string
}

export interface GetPostsForUserResponseItem {
  post: Post
}

export type GetPostsForUserResponse = GetPostsForUserResponseItem[]

export interface GetCommentsForPostIdPayload {
  post: string
}

export interface CommentSimple {
  content: string
  author: string
}

export interface GetCommentsForPostIdResponseItem {
  comments: CommentSimple[]
}

export type GetCommentsForPostIdResponse = GetCommentsForPostIdResponseItem[]

export interface GetReactionOnPostFromUserPayload {
  user: string
  post: string
}

export type GetReactionOnPostFromUserResponse = ReactionCount[]

export interface ErrorResponse {
  error: string
}

