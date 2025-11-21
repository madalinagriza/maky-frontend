import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { getSessionId } from '@/utils/sessionStorage'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor to automatically inject sessionId for authenticated requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Skip sessionId injection for login and register endpoints
    const isAuthEndpoint = config.url?.includes('/UserAccount/login') || config.url?.includes('/UserAccount/register')
    
    if (!isAuthEndpoint && config.data && typeof config.data === 'object') {
      const sessionId = getSessionId()
      if (sessionId) {
        config.data = { ...config.data, sessionId }
      }
    }
    
    return config
  },
  (error) => Promise.reject(error)
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const fallbackMessage = 'Unknown API error occurred'
    const normalizedError =
      error.response?.data?.error ?? error.response?.data?.message ?? error.message ?? fallbackMessage

    return Promise.reject(new Error(normalizedError))
  }
)

export { apiClient }
