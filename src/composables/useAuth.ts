import { ref, computed } from 'vue'
import { getSessionId, setSessionId, clearSessionId } from '@/utils/sessionStorage'
import { useUserProfile } from './useUserProfile'

const sessionId = ref<string | null>(getSessionId())
const isAuthenticated = computed(() => sessionId.value !== null)

export function useAuth() {
  function login(newSessionId: string) {
    sessionId.value = newSessionId
    setSessionId(newSessionId)
  }

  function logout() {
    sessionId.value = null
    clearSessionId()
    // Clear profile data on logout
    const { clearProfile } = useUserProfile()
    clearProfile()
  }

  function getCurrentSessionId(): string | null {
    return sessionId.value
  }

  return {
    sessionId: computed(() => sessionId.value),
    isAuthenticated,
    login,
    logout,
    getCurrentSessionId,
  }
}

