import { apiClient } from './apiClient'
import type { HealthStatusResponse } from '@/types/api'

const HEALTH_ENDPOINT = '/health'

export async function fetchHealthStatus() {
  const response = await apiClient.get<HealthStatusResponse>(HEALTH_ENDPOINT)
  return response.data
}
