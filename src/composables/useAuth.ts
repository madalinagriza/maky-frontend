import { ref, computed } from 'vue'
import {
  getSessionId,
  setSessionId,
  clearSessionId,
  getUserId,
  setUserId,
  clearUserId,
  getUsername,
  setUsername,
  clearUsername,
} from '@/utils/sessionStorage'
import { useUserProfile } from './useUserProfile'

const sessionId = ref<string | null>(getSessionId())
const userId = ref<string | null>(getUserId())
const username = ref<string | null>(getUsername())
const isAuthenticated = computed(() => sessionId.value !== null)

export function useAuth() {
  function login(newSessionId: string, newUserId?: string | null, newUsername?: string | null) {
    sessionId.value = newSessionId
    setSessionId(newSessionId)

    if (newUserId) {
      userId.value = newUserId
      setUserId(newUserId)
    }

    if (newUsername) {
      username.value = newUsername
      setUsername(newUsername)
    }
  }

  function logout() {
    sessionId.value = null
    userId.value = null
    username.value = null
    clearSessionId()
    clearUserId()
    clearUsername()
    // Clear profile data on logout
    const { clearProfile } = useUserProfile()
    clearProfile()
  }

  function getCurrentSessionId(): string | null {
    return sessionId.value
  }

  function getCurrentUserId(): string | null {
    return userId.value
  }

  function getCurrentUsername(): string | null {
    return username.value
  }

  return {
    sessionId: computed(() => sessionId.value),
    userId: computed(() => userId.value),
    username: computed(() => username.value),
    isAuthenticated,
    login,
    logout,
    getCurrentUsername,
    getCurrentUserId,
    getCurrentSessionId,
  }
}

