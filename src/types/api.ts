export interface HealthStatusResponse {
  status: 'ok' | 'degraded' | 'offline' | string
  message?: string
  timestamp?: string
}
