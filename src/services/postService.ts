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
  GetReactionsForPostIdPayload,
  GetReactionsForPostIdResponse,
  GetPostsForUserPayload,
  GetPostsForUserResponse,
  GetPostsForUsersPayload,
  GetCommentsForPostIdPayload,
  GetCommentsForPostIdResponse,
  GetReactionOnPostFromUserPayload,
  GetReactionOnPostFromUserResponse,
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
  const { data } = await apiClient.post<any>(
    `${POST_BASE}/_getPostsForUser`,
    payload
  )
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle potential wrapper object from backend (e.g. { results: [...] })
  const results = Array.isArray(data) ? data : (data.results || [])
  return results as GetPostsForUserResponse
}

export async function getPostsForUsers(payload: GetPostsForUsersPayload) {
  const { data } = await apiClient.post<any>(
    `${POST_BASE}/_getPostsForUsers`,
    payload
  )
  
  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle potential wrapper object from backend (e.g. { results: [...] })
  const results = Array.isArray(data) ? data : (data.results || [])
  return results as GetPostsForUserResponse
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

export async function getCommentsForPostId(payload: GetCommentsForPostIdPayload) {
  const { data } = await apiClient.post<any>(
    `${COMMENT_BASE}/_getCommentsForPostId`,
    payload
  )

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle potential wrapper object from backend (e.g. { results: [...] })
  const results = Array.isArray(data) ? data : (data.results || [])
  return results as GetCommentsForPostIdResponse
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

export async function getReactionsForPostId(payload: GetReactionsForPostIdPayload) {
  const { data } = await apiClient.post<any>(
    `${REACTION_BASE}/_getReactionsForPostId`,
    payload
  )

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle potential wrapper object from backend (e.g. { results: [...] })
  const results = Array.isArray(data) ? data : (data.results || [])
  return results as GetReactionsForPostIdResponse
}

export async function getReactionOnPostFromUser(payload: GetReactionOnPostFromUserPayload) {
  console.log('[postService] getReactionOnPostFromUser payload:', payload)
  const { data } = await apiClient.post<any>(
    `${REACTION_BASE}/_getReactionOnPostFromUser`,
    payload
  )

  console.log('[postService] getReactionOnPostFromUser response data:', data)

  if (data && typeof data === 'object' && 'error' in data) {
    throw new Error((data as ErrorResponse).error)
  }

  // Handle potential wrapper object from backend (e.g. { results: [...] })
  // The user trace shows "results" property in the response object
  let results = []
  if (Array.isArray(data)) {
    results = data
  } else if (data && typeof data === 'object') {
    if (Array.isArray(data.results)) {
      results = data.results
    } else if (Array.isArray(data.result)) {
      results = data.result
    }
  }
  
  console.log('[postService] Parsed results:', results)
  return results as GetReactionOnPostFromUserResponse
}

