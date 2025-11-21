<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link to="/learn" class="logo">ChordConnect</router-link>
      <div class="nav-links">
        <router-link to="/learn" class="nav-link">Learn</router-link>
        <router-link to="/feed" class="nav-link">Feed</router-link>
        <router-link to="/journal" class="nav-link">Journal</router-link>
        <router-link to="/profile" class="nav-link">Profile</router-link>
        <button @click="handleLogout" class="nav-link logout-btn">Logout</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { logout } = useAuth()

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
.navbar {
  background: rgba(17, 24, 39, 0.95);
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
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f9fafb;
  text-decoration: none;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: #e5e7eb;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
}

.logout-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.4);
}
</style>

