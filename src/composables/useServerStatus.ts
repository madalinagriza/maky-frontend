import { ref } from 'vue'
import { fetchHealthStatus } from '@/services/healthService'
import type { HealthStatusResponse } from '@/types/api'

export function useServerStatus() {
  const status = ref<HealthStatusResponse | null>(null)
  const error = ref<string | null>(null)
  const isLoading = ref(false)

  const refresh = async () => {
    isLoading.value = true
    error.value = null

    try {
      status.value = await fetchHealthStatus()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Unable to reach backend'
      status.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    status,
    error,
    isLoading,
    refresh,
  }
}
