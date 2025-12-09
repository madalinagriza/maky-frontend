<template>
  <main class="app-shell">
    <section class="auth-card">
      <header>
        <p class="eyebrow">User Account</p>
        <h1>Welcome to ChordConnect</h1>
        <p class="lead">Sign in to continue your guitar learning journey</p>
      </header>

      <form class="form" @submit.prevent="handleLogin">
        <label>
          <span>Username</span>
          <input
            type="text"
            v-model.trim="loginForm.username"
            name="username"
            autocomplete="username"
            minlength="3"
            pattern="[A-Za-z0-9_-]+"
            title="Only letters, numbers, underscores and hyphens are allowed"
            required
          />
        </label>

        <label>
          <span>Password</span>
          <div class="password-field">
            <input
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              name="current-password"
              autocomplete="current-password"
              required
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility"
              :aria-pressed="showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <span aria-hidden="true">{{ showPassword ? 'Hide' : 'Show' }}</span>
            </button>
          </div>
        </label>

        <button type="submit" :disabled="!canSubmitLogin || loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p v-if="feedback" class="feedback" :class="feedback.kind" role="status" aria-live="polite">
        {{ feedback.message }}
      </p>

      <footer class="footnote">
        <p>
          Don't have an account?
          <router-link to="/register" class="link">Register here</router-link>
        </p>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser } from '@/services/userAccountService'
import { getProfile } from '@/services/userProfileService'
import { useAuth } from '@/composables/useAuth'
import { useUserProfile } from '@/composables/useUserProfile'

const router = useRouter()
const { login } = useAuth()
const { setProfile } = useUserProfile()

const loginForm = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
const showPassword = ref(false)

const canSubmitLogin = computed(() => {
  return loginForm.username.trim().length >= 3 && loginForm.password.trim() !== ''
})

async function handleLogin() {
  if (!canSubmitLogin.value || loading.value) return
  loading.value = true
  feedback.value = null

  try {
    const payload = {
      username: loginForm.username.trim(),
      password: loginForm.password,
    }

    const response = await loginUser(payload)
    login(response.sessionId, response.user, payload.username)
    await hydrateProfile({
      userId: response.user,
      sessionId: response.sessionId,
      fallbackName: payload.username,
    })

    feedback.value = {
      kind: 'success',
      message: 'Successfully logged in!',
    }

    // Redirect to profile page
    setTimeout(() => {
      router.push('/profile')
    }, 500)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to log in'
    feedback.value = { kind: 'error', message }
  } finally {
    loading.value = false
  }
}

async function hydrateProfile({
  userId,
  sessionId,
  fallbackName,
}: {
  userId?: string | null
  sessionId?: string | null
  fallbackName: string
}) {
  const safeFallback = fallbackName?.trim() || 'User'

  try {
    if (!sessionId || !userId) {
      setProfile({ displayName: safeFallback, avatarUrl: null })
      return
    }

    const profileData = await getProfile({ sessionId, user: userId })

    if (profileData) {
      setProfile({
        displayName: profileData.displayName?.trim() || safeFallback,
        avatarUrl: profileData.avatarUrl ?? null,
      })
    } else {
      setProfile({ displayName: safeFallback, avatarUrl: null })
    }
  } catch (error) {
    setProfile({ displayName: safeFallback, avatarUrl: null })
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(
    circle at top,
    var(--contrast-top) 0%,
    var(--contrast-mid) 35%,
    var(--contrast-bottom) 100%
  );
  padding: 1.5rem;
  color: var(--contrast-mid);
}

.auth-card {
  width: min(560px, 100%);
  border-radius: 1.25rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.45);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.eyebrow {
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  margin: 0;
}

h1 {
  margin: 0.35rem 0 0;
  font-size: 1.85rem;
  color: var(--contrast-mid);
  font-family: var(--logo-font);
  font-weight: var(--logo-font-weight);
}

.lead {
  margin: 0.75rem 0 0;
  color: #d1d5db;
  line-height: 1.6;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
  color: #e5e7eb;
}

input[type='text'],
input[type='password'] {
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 0.9rem;
  background: var(--main-top);
  color: #f9fafb;
  font-size: 1rem;
}

.password-field {
  position: relative;
  display: flex;
  align-items: center;
}

.password-field input {
  width: 100%;
  padding-right: 3.25rem;
}

.password-toggle {
  position: absolute;
  right: 0.35rem;
  border: none;
  background: transparent;
  color: var(--accent);
  font-weight: 600;
  cursor: pointer;
  padding: 0.35rem 0.5rem;
}

.password-toggle:focus-visible {
  outline: 2px solid var(--accent);
  border-radius: 0.5rem;
}

input:focus {
  outline: 2px solid #818cf8;
  border-color: transparent;
}

button[type='submit'] {
  border: none;
  border-radius: 0.9rem;
  padding: 0.85rem 1.25rem;
  background: var(--button);
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

button[disabled] {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin: 0;
  padding: 0.9rem 1rem;
  border-radius: 0.9rem;
  font-weight: 600;
  text-align: center;
}

.feedback.success {
  background: rgba(16, 185, 129, 0.15);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.feedback.error {
  background: rgba(248, 113, 113, 0.15);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.35);
}

.footnote {
  margin: 0;
  color: #9ca3af;
  line-height: 1.5;
  text-align: center;
}

.link {
  color: var(--accent);
  text-decoration: none;
}

.link:hover {
  text-decoration: underline;
}
</style>

