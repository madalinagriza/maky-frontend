import { apiClient } from './apiClient'
import type {
  RequestChordRecommendationPayload,
  RequestChordRecommendationResponse,
  RequestSongUnlockRecommendationPayload,
  RequestSongUnlockRecommendationResponse,
  RequestPersonalizedSongRecommendationPayload,
  RequestPersonalizedSongRecommendationResponse,
  RecommendNextChordsForTargetSongPayload,
  RecommendNextChordsForTargetSongResponse,
  ErrorResponse,
} from '@/types/recommendation'

const RECOMMENDATION_BASE = '/RecommendationEngine'

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

export async function requestChordRecommendation(payload: RequestChordRecommendationPayload) {
  const { data } = await apiClient.post<RequestChordRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/requestChordRecommendation`,
    payload
  )
  return ensureSuccess(data)
}

export async function requestSongUnlockRecommendation(
  payload: RequestSongUnlockRecommendationPayload
) {
  const { data } = await apiClient.post<RequestSongUnlockRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/requestSongUnlockRecommendation`,
    payload
  )
  return ensureSuccess(data)
}

export async function requestPersonalizedSongRecommendation(
  payload: RequestPersonalizedSongRecommendationPayload
) {
  const { data } = await apiClient.post<
    RequestPersonalizedSongRecommendationResponse | ErrorResponse
  >(`${RECOMMENDATION_BASE}/requestPersonalizedSongRecommendation`, payload)
  return ensureSuccess(data)
}

export async function recommendNextChordsForTargetSong(
  payload: RecommendNextChordsForTargetSongPayload
) {
  const { data } = await apiClient.post<RecommendNextChordsForTargetSongResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/recommendNextChordsForTargetSong`,
    payload
  )
  return ensureSuccess(data)
}

