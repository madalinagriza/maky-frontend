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
import { getIsKidOrPrivateAccount } from '@/services/userAccountService'

const sessionId = ref<string | null>(getSessionId())
const userId = ref<string | null>(getUserId())
const username = ref<string | null>(getUsername())
const isAuthenticated = computed(() => sessionId.value !== null)
const KID_OR_PRIVATE_STORAGE_PREFIX = 'account:isKidOrPrivate'

function getKidOrPrivateStorageKey(targetUserId?: string | null) {
  const effectiveUserId = targetUserId ?? userId.value
  return effectiveUserId ? `${KID_OR_PRIVATE_STORAGE_PREFIX}:${effectiveUserId}` : null
}

function readKidOrPrivateFromStorage(targetUserId?: string | null): boolean | null {
  const key = getKidOrPrivateStorageKey(targetUserId)
  if (!key) return null
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return null
    return raw === 'true'
  } catch (error) {
    console.error('Failed to read kid/private status from storage', error)
    return null
  }
}

function persistKidOrPrivateToStorage(value: boolean | null, targetUserId?: string | null) {
  const key = getKidOrPrivateStorageKey(targetUserId)
  if (!key) return
  try {
    if (value === null) {
      localStorage.removeItem(key)
    } else {
      localStorage.setItem(key, value ? 'true' : 'false')
    }
  } catch (error) {
    console.error('Failed to persist kid/private status', error)
  }
}

const isKidOrPrivateAccount = ref<boolean | null>(readKidOrPrivateFromStorage())

export function useAuth() {
  function login(newSessionId: string, newUserId?: string | null, newUsername?: string | null) {
    sessionId.value = newSessionId
    setSessionId(newSessionId)

    if (newUserId) {
      userId.value = newUserId
      setUserId(newUserId)
      // reset cached kid/private flag for new user until refreshed
      isKidOrPrivateAccount.value = readKidOrPrivateFromStorage(newUserId)
    }

    if (newUsername) {
      username.value = newUsername
      setUsername(newUsername)
    }

    // proactively refresh status if we have user id
    if (userId.value) {
      refreshKidOrPrivateStatus(userId.value).catch(() => {
        // swallow errors here; UI can retry later
      })
    }
  }

  function logout() {
    const previousUserId = userId.value
    sessionId.value = null
    userId.value = null
    username.value = null
    clearSessionId()
    clearUserId()
    clearUsername()
    persistKidOrPrivateToStorage(null, previousUserId)
    isKidOrPrivateAccount.value = null
    // Clear profile data on logout
    const { clearProfile } = useUserProfile()
    clearProfile()
  }

  function updateStoredUsername(newUsername: string | null) {
    username.value = newUsername
    if (newUsername && newUsername.trim()) {
      setUsername(newUsername.trim())
    } else {
      clearUsername()
    }
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

  async function refreshKidOrPrivateStatus(targetUserId?: string | null): Promise<boolean | null> {
    const effectiveUserId = targetUserId ?? userId.value
    if (!effectiveUserId) {
      isKidOrPrivateAccount.value = null
      persistKidOrPrivateToStorage(null, effectiveUserId)
      return null
    }

    const activeSessionId = sessionId.value || getSessionId()
    if (!activeSessionId) {
      isKidOrPrivateAccount.value = null
      persistKidOrPrivateToStorage(null, effectiveUserId)
      return null
    }

    try {
      const response = await getIsKidOrPrivateAccount({ sessionId: activeSessionId, user: effectiveUserId })
      const flag = Array.isArray(response) && response[0] ? Boolean(response[0].isKidOrPrivate) : false
      isKidOrPrivateAccount.value = flag
      persistKidOrPrivateToStorage(flag, effectiveUserId)
      return flag
    } catch (error) {
      console.error('Failed to refresh kid/private status', error)
      // do not override value on failure
      return isKidOrPrivateAccount.value
    }
  }

  function getKidOrPrivateStatus(): boolean | null {
    if (isKidOrPrivateAccount.value === null) {
      isKidOrPrivateAccount.value = readKidOrPrivateFromStorage()
    }
    return isKidOrPrivateAccount.value
  }

  return {
    sessionId: computed(() => sessionId.value),
    userId: computed(() => userId.value),
    username: computed(() => username.value),
    isAuthenticated,
    login,
    logout,
    updateStoredUsername,
    refreshKidOrPrivateStatus,
    kidOrPrivateStatus: computed(() => isKidOrPrivateAccount.value),
    getKidOrPrivateStatus,
    getCurrentUsername,
    getCurrentUserId,
    getCurrentSessionId,
  }
}

