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
          <input
            v-model="loginForm.password"
            type="password"
            name="current-password"
            autocomplete="current-password"
            required
          />
        </label>

        <button type="submit" :disabled="!canSubmitLogin || loading">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="test-account-section">
        <div class="divider">
          <span>or</span>
        </div>
        <button 
          type="button" 
          @click="loginAsTestUser" 
          :disabled="loading"
          class="test-login-btn"
        >
          {{ loading ? 'Signing in...' : '🔧 Login as Test User' }}
        </button>
        <p class="test-account-info">
          Test credentials: <code>testuser</code> / <code>testpass123</code>
        </p>
      </div>

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
import { loginUser, registerUser } from '@/services/userAccountService'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const loginForm = reactive({
  username: '',
  password: '',
})

const loading = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

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
    login(response.sessionId)

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

async function loginAsTestUser() {
  if (loading.value) return
  loading.value = true
  feedback.value = null

  try {
    // First try to login with test credentials
    const payload = {
      username: 'testuser',
      password: 'testpass123',
    }

    const response = await loginUser(payload)
    login(response.sessionId)

    feedback.value = {
      kind: 'success',
      message: 'Logged in as test user!',
    }

    setTimeout(() => {
      router.push('/profile')
    }, 500)
  } catch (error) {
    // If login fails, try to register the test user first
    try {
      await registerUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'testpass123',
        isKidAccount: false,
      })

      // Then login
      const payload = {
        username: 'testuser',
        password: 'testpass123',
      }
      const response = await loginUser(payload)
      login(response.sessionId)

      feedback.value = {
        kind: 'success',
        message: 'Test account created and logged in!',
      }

      setTimeout(() => {
        router.push('/profile')
      }, 500)
    } catch (registerError) {
      const message = registerError instanceof Error ? registerError.message : 'Unable to create/login test user'
      feedback.value = { kind: 'error', message }
    }
  } finally {
    loading.value = false
  }
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

.test-account-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1rem 0;
  color: #9ca3af;
  font-size: 0.875rem;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.divider span {
  padding: 0 1rem;
}

.test-login-btn {
  width: 100%;
  border: 1px solid rgba(251, 191, 36, 0.3);
  border-radius: 0.9rem;
  padding: 0.85rem 1.25rem;
  background: rgba(251, 191, 36, 0.1);
  color: #fbbf24;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 0.5rem;
}

.test-login-btn:hover:not(:disabled) {
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.5);
}

.test-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-account-info {
  margin: 0;
  font-size: 0.75rem;
  color: #9ca3af;
  text-align: center;
}

.test-account-info code {
  background: rgba(0, 0, 0, 0.35);
  padding: 0.15rem 0.35rem;
  border-radius: 0.3rem;
  font-size: 0.875rem;
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

