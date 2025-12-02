<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/learn" class="logo">ChordConnect</router-link>
      <div class="nav-right">
        <div class="nav-links">
          <router-link to="/learn" class="nav-link">Learn</router-link>
          <router-link
            v-if="canAccessFeed"
            to="/feed"
            class="nav-link"
          >
            Feed
          </router-link>
          <router-link to="/journal" class="nav-link">Journal</router-link>
          <router-link to="/discover" class="nav-link">Discover</router-link>
        </div>
        
        <div 
        class="user-menu" 
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
      >
        <div class="user-menu-trigger">
          <div class="user-avatar">
            <img 
              v-if="avatarUrl" 
              :src="avatarUrl" 
              :alt="displayLabel"
              class="avatar-img"
            />
            <div v-else class="avatar-placeholder">
              {{ getInitials(displayLabel) }}
            </div>
          </div>
          <span class="user-name">{{ displayLabel }}</span>
          <span class="dropdown-arrow" :class="{ 'arrow-up': isHovered }">▼</span>
        </div>
        
        <div v-if="isHovered" class="user-dropdown-wrapper" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
          <div class="user-dropdown">
            <router-link to="/profile" class="dropdown-item" @click="isHovered = false">
              Profile
            </router-link>
            <router-link to="/account" class="dropdown-item" @click="isHovered = false">
              Account
            </router-link>
            <button @click="handleLogout" class="dropdown-item logout-item">
              Logout
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { useUserProfile } from '@/composables/useUserProfile'

const router = useRouter()
const { logout, username, kidOrPrivateStatus, refreshKidOrPrivateStatus } = useAuth()
const { displayName, avatarUrl, getInitials } = useUserProfile()

const isHovered = ref(false)

onMounted(() => {
  if (kidOrPrivateStatus.value === null) {
    refreshKidOrPrivateStatus()
  }
})

const displayLabel = computed(() => {
  const name = displayName.value?.trim()
  if (name) return name
  const fallbackUsername = username.value?.trim()
  if (fallbackUsername) return fallbackUsername
  return 'User'
})

const canAccessFeed = computed(() => kidOrPrivateStatus.value !== true)

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: var(--main);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.logo {
  font-size: 2rem;
  font-weight: 700;
  color: #f9fafb;
  text-decoration: none;
  background: linear-gradient(120deg, var(--contrast-bottom), var(--contrast-top));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: var(--logo-font);
  font-weight: var(--logo-font-weight);
  letter-spacing: 0.02em;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--contrast-mid);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover{
  background: transparent;
  color: var(--accent);
}

.nav-link.router-link-active {
  background: var(--button);
  color: var(--btn-text);
}

.user-menu {
  position: relative;
}

.user-menu-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.user-menu-trigger:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #a5b4fc;
  font-weight: 600;
  font-size: 0.875rem;
}

.user-name {
  color: var(--contrast-mid);
  font-weight: 500;
  font-size: 0.95rem;
}

.dropdown-arrow {
  color: var(--contrast-bottom);
  font-size: 0.75rem;
  transition: transform 0.2s ease;
  display: inline-block;
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
}

.user-dropdown-wrapper {
  position: absolute;
  top: 100%;
  right: 0;
  padding-top: 0.5rem;
  z-index: 1000;
}

.user-dropdown {
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  color: var(--contrast-mid);
  text-decoration: none;
  font-weight: 500;
  text-align: left;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
  font-size: 0.95rem;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.dropdown-item.logout-item {
  color: #fecaca;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item.logout-item:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>

