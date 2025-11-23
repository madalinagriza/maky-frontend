import { apiClient } from './apiClient'
import type {
  CalculateRecommendationPayload,
  CalculateRecommendationResponse,
  RequestChordRecommendationPayload,
  RequestChordRecommendationResponse,
  RequestSongUnlockRecommendationPayload,
  RequestSongUnlockRecommendationResponse,
  GetRecommendationPayload,
  GetRecommendationResponse,
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

export async function calculateRecommendation(payload: CalculateRecommendationPayload) {
  const { data } = await apiClient.post<CalculateRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/calculateRecommendation`,
    payload
  )
  return ensureSuccess(data)
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

export async function getRecommendation(payload: GetRecommendationPayload) {
  const { data } = await apiClient.post<GetRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/_getRecommendation`,
    payload
  )
  return ensureSuccess(data)
}

