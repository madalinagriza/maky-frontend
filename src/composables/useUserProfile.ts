import { ref, computed } from 'vue'
import { getSessionId } from '@/utils/sessionStorage'

interface UserProfile {
  displayName: string
  avatarUrl: string | null
}

const PROFILE_STORAGE_KEY = 'userProfile'

function getStoredProfile(): UserProfile | null {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

function setStoredProfile(profile: UserProfile) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile))
  } catch (error) {
    console.error('Failed to store profile:', error)
  }
}

function clearStoredProfile() {
  try {
    localStorage.removeItem(PROFILE_STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear profile:', error)
  }
}

const displayName = ref<string>(getStoredProfile()?.displayName || '')
const avatarUrl = ref<string | null>(getStoredProfile()?.avatarUrl || null)

export function useUserProfile() {
  function setProfile(profile: Partial<UserProfile>) {
    if (profile.displayName !== undefined) {
      displayName.value = profile.displayName
    }
    if (profile.avatarUrl !== undefined) {
      avatarUrl.value = profile.avatarUrl
    }
    
    // Update localStorage
    setStoredProfile({
      displayName: displayName.value,
      avatarUrl: avatarUrl.value,
    })
  }

  function updateDisplayName(newDisplayName: string) {
    displayName.value = newDisplayName
    setStoredProfile({
      displayName: displayName.value,
      avatarUrl: avatarUrl.value,
    })
  }

  function updateAvatar(newAvatarUrl: string | null) {
    avatarUrl.value = newAvatarUrl
    setStoredProfile({
      displayName: displayName.value,
      avatarUrl: avatarUrl.value,
    })
  }

  function clearProfile() {
    displayName.value = ''
    avatarUrl.value = null
    clearStoredProfile()
  }

  function getInitials(name: string): string {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name[0].toUpperCase()
  }

  // Load profile from storage on initialization
  const stored = getStoredProfile()
  if (stored) {
    displayName.value = stored.displayName
    avatarUrl.value = stored.avatarUrl
  }

  return {
    displayName: computed(() => displayName.value),
    avatarUrl: computed(() => avatarUrl.value),
    setProfile,
    updateDisplayName,
    updateAvatar,
    clearProfile,
    getInitials,
  }
}

