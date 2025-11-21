import axios from 'axios'
import type { AxiosInstance } from 'axios'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api'

const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

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
