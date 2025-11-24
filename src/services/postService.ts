import { apiClient } from './apiClient'
import type {
  CreatePostPayload,
  CreatePostResponse,
  DeletePostPayload,
  EditPostPayload,
  AddCommentToPostPayload,
  AddCommentToPostResponse,
  DeleteCommentPayload,
  EditCommentPayload,
  AddReactionToPostPayload,
  AddReactionToPostResponse,
  ChangeReactionTypePayload,
  RemoveReactionFromPostPayload,
  GetPostsForUserPayload,
  GetPostsForUserResponse,
  ErrorResponse,
} from '@/types/post'

const POST_BASE = '/Post'
const COMMENT_BASE = '/Comment'
const REACTION_BASE = '/Reaction'

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

// Post endpoints
export async function createPost(payload: CreatePostPayload) {
  const { data } = await apiClient.post<CreatePostResponse | ErrorResponse>(
    `${POST_BASE}/createPost`,
    payload
  )
  return ensureSuccess(data)
}

export async function deletePost(payload: DeletePostPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${POST_BASE}/deletePost`,
    payload
  )
  ensureSuccess(data)
}

export async function editPost(payload: EditPostPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${POST_BASE}/editPost`,
    payload
  )
  ensureSuccess(data)
}

export async function getPostsForUser(payload: GetPostsForUserPayload) {
  const { data } = await apiClient.post<GetPostsForUserResponse | ErrorResponse>(
    `${POST_BASE}/_getPostsForUser`,
    payload
  )
  return ensureSuccess(data)
}

// Comment endpoints
export async function addCommentToPost(payload: AddCommentToPostPayload) {
  const { data } = await apiClient.post<AddCommentToPostResponse | ErrorResponse>(
    `${COMMENT_BASE}/addCommentToPost`,
    payload
  )
  return ensureSuccess(data)
}

export async function deleteComment(payload: DeleteCommentPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${COMMENT_BASE}/deleteComment`,
    payload
  )
  ensureSuccess(data)
}

export async function editComment(payload: EditCommentPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${COMMENT_BASE}/editComment`,
    payload
  )
  ensureSuccess(data)
}

// Reaction endpoints
export async function addReactionToPost(payload: AddReactionToPostPayload) {
  const { data } = await apiClient.post<AddReactionToPostResponse | ErrorResponse>(
    `${REACTION_BASE}/addReactionToPost`,
    payload
  )
  return ensureSuccess(data)
}

export async function changeReactionType(payload: ChangeReactionTypePayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${REACTION_BASE}/changeReactionType`,
    payload
  )
  ensureSuccess(data)
}

export async function removeReactionFromPost(payload: RemoveReactionFromPostPayload) {
  const { data } = await apiClient.post<Record<string, never> | ErrorResponse>(
    `${REACTION_BASE}/removeReactionFromPost`,
    payload
  )
  ensureSuccess(data)
}

