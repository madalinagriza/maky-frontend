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
  console.log('[RecommendationService] Starting requestChordRecommendation', {
    knownChordsCount: payload.knownChords.length,
    allSongsCount: payload.allSongs.length,
    knownChords: payload.knownChords
  })
  
  const startTime = Date.now()
  
  try {
    const { data } = await apiClient.post<RawRequestChordRecommendationResponse | ErrorResponse>(
      `${RECOMMENDATION_BASE}/requestChordRecommendation`,
      payload
    )
    
    const elapsed = Date.now() - startTime
    console.log(`[RecommendationService] Received response in ${elapsed}ms`, { data })
    
    const raw = ensureSuccess<RawRequestChordRecommendationResponse>(data)

    if (Array.isArray(raw)) {
      console.log('[RecommendationService] Response is array, length:', raw.length)
      const match = raw.find(
        entry => entry && typeof entry === 'object' && typeof entry.recommendedChord === 'string'
      )

      if (match) {
        console.log('[RecommendationService] Found match in array:', match)
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
      console.log('[RecommendationService] Response is object:', raw)
      return {
        recommendedChord: raw.recommendedChord,
        diagram: raw.diagram ?? null
      }
    }

    console.warn('[RecommendationService] No valid recommendation found, returning empty')
    return { recommendedChord: '', diagram: null }
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[RecommendationService] Request failed after ${elapsed}ms:`, error)
    throw error
  }
}

export async function requestSongUnlockRecommendation(
  payload: RequestSongUnlockRecommendationPayload
) {
  console.log('[RecommendationService] Starting requestSongUnlockRecommendation', {
    knownChordsCount: payload.knownChords.length,
    potentialChord: payload.potentialChord,
    allSongsCount: payload.allSongs.length
  })
  
  const startTime = Date.now()
  
  try {
    const { data } = await apiClient.post<RequestSongUnlockRecommendationResponse | ErrorResponse>(
      `${RECOMMENDATION_BASE}/requestSongUnlockRecommendation`,
      payload
    )
    
    const elapsed = Date.now() - startTime
    console.log(`[RecommendationService] requestSongUnlockRecommendation response in ${elapsed}ms`, { data })
    
    return ensureSuccess(data)
  } catch (error) {
    const elapsed = Date.now() - startTime
    console.error(`[RecommendationService] requestSongUnlockRecommendation failed after ${elapsed}ms:`, error)
    throw error
  }
}

export async function getRecommendation(payload: GetRecommendationPayload) {
  const { data } = await apiClient.post<GetRecommendationResponse | ErrorResponse>(
    `${RECOMMENDATION_BASE}/_getRecommendation`,
    payload
  )
  return ensureSuccess(data)
}

