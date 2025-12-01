import { apiClient } from './apiClient'
import type {
  CalculateRecommendationPayload,
  CalculateRecommendationResponse,
  RequestChordRecommendationPayload,
  RequestChordRecommendationResponse,
  RawRequestChordRecommendationResponse,
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

export async function requestChordRecommendation(
  payload: RequestChordRecommendationPayload
): Promise<RequestChordRecommendationResponse> {
  const { data } = await apiClient.post<RawRequestChordRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/requestChordRecommendation`,
    payload
  )
  const raw = ensureSuccess<RawRequestChordRecommendationResponse>(data)

  if (Array.isArray(raw)) {
    const match = raw.find(
      entry => entry && typeof entry === 'object' && typeof entry.recommendedChord === 'string'
    )

    if (match) {
      return { 
        recommendedChord: match.recommendedChord,
        diagram: match.diagram ?? null
      }
    }
  } else if (
    raw &&
    typeof raw === 'object' &&
    'recommendedChord' in raw &&
    typeof raw.recommendedChord === 'string'
  ) {
    return {
      recommendedChord: raw.recommendedChord,
      diagram: raw.diagram ?? null
    }
  }

  return { recommendedChord: '', diagram: null }
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

