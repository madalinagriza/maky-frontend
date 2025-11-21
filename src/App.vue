<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { registerUser, loginUser } from '@/services/userAccountService'

type Tab = 'register' | 'login'

const apiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const activeTab = ref<Tab>('register')
const loading = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  isKidAccount: false,
})

const loginForm = reactive({
  username: '',
  password: '',
})

const canSubmitRegister = computed(() => {
  return (
    registerForm.username.trim() !== '' &&
    registerForm.email.trim() !== '' &&
    registerForm.password.trim().length >= 6
  )
})

const canSubmitLogin = computed(() => {
  return loginForm.username.trim() !== '' && loginForm.password.trim() !== ''
})

function switchTab(tab: Tab) {
  activeTab.value = tab
  feedback.value = null
}

function resetRegisterForm() {
  registerForm.username = ''
  registerForm.email = ''
  registerForm.password = ''
  registerForm.isKidAccount = false
}

function resetLoginForm() {
  loginForm.username = ''
  loginForm.password = ''
}

async function handleRegister() {
  if (!canSubmitRegister.value || loading.value) return
  loading.value = true
  feedback.value = null

  try {
    const payload = {
      username: registerForm.username.trim(),
      email: registerForm.email.trim(),
      password: registerForm.password,
      isKidAccount: registerForm.isKidAccount,
    }

    const { user } = await registerUser(payload)
    const userLabel = user ? ` for user "${user}"` : ''
    feedback.value = {
      kind: 'success',
      message: `Yay! Registration complete${userLabel}.`,
    }
    resetRegisterForm()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to register user'
    feedback.value = { kind: 'error', message }
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (!canSubmitLogin.value || loading.value) return
  loading.value = true
  feedback.value = null

  try {
    const payload = {
      username: loginForm.username.trim(),
      password: loginForm.password,
    }

    const { user } = await loginUser(payload)
    const userLabel = user ? ` as "${user}"` : ''
    feedback.value = {
      kind: 'success',
      message: `Yay! Authenticated${userLabel}.`,
    }
    resetLoginForm()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to log in'
    feedback.value = { kind: 'error', message }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="app-shell">
    <section class="auth-card">
      <header>
        <p class="eyebrow">User Account</p>
        <h1>Vue authentication playground</h1>
        <p class="lead">
          This page talks to <code>{{ apiBase }}/UserAccount</code> endpoints so you can register or log in
          against the backend described in <code>API_SPEC.md</code>.
        </p>
      </header>

      <nav class="tab-list" aria-label="Authentication modes">
        <button type="button" :class="{ active: activeTab === 'register' }" @click="switchTab('register')">
          Register
        </button>
        <button type="button" :class="{ active: activeTab === 'login' }" @click="switchTab('login')">
          Log in
        </button>
      </nav>

      <section v-if="activeTab === 'register'">
        <form class="form" @submit.prevent="handleRegister">
          <label>
            <span>Username</span>
            <input v-model.trim="registerForm.username" name="username" autocomplete="username" required />
          </label>

          <label>
            <span>Email</span>
            <input v-model.trim="registerForm.email" type="email" name="email" autocomplete="email" required />
          </label>

          <label>
            <span>Password</span>
            <input
              v-model="registerForm.password"
              type="password"
              name="new-password"
              autocomplete="new-password"
              minlength="6"
              required
            />
          </label>

          <label class="checkbox">
            <input v-model="registerForm.isKidAccount" type="checkbox" />
            <span>Kid account?</span>
          </label>

          <button type="submit" :disabled="!canSubmitRegister || loading">
            {{ loading ? 'Sending...' : 'Create account' }}
          </button>
        </form>
      </section>

      <section v-else>
        <form class="form" @submit.prevent="handleLogin">
          <label>
            <span>Username</span>
            <input v-model.trim="loginForm.username" name="username" autocomplete="username" required />
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
            {{ loading ? 'Sending...' : 'Sign in' }}
          </button>
        </form>
      </section>

      <p v-if="feedback" class="feedback" :class="feedback.kind" role="status" aria-live="polite">
        {{ feedback.message }}
      </p>

      <footer class="footnote">
        <p>Need other account actions? Start in <code>src/services/userAccountService.ts</code>.</p>
        <p>Current API base: <code>{{ apiBase }}</code></p>
      </footer>
    </section>
  </main>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at top, #1f2937 0%, #111827 55%, #030712 100%);
  padding: 1.5rem;
  color: #f9fafb;
}

.auth-card {
  width: min(560px, 100%);
  border-radius: 1.25rem;
  background: rgba(17, 24, 39, 0.95);
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
}

.lead {
  margin: 0.75rem 0 0;
  color: #d1d5db;
  line-height: 1.6;
}

.tab-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.tab-list button {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.65rem 1rem;
  font-size: 0.95rem;
  font-weight: 600;
  background: transparent;
  color: #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-list button.active {
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  border-color: transparent;
  color: #fff;
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
input[type='email'],
input[type='password'] {
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 0.9rem;
  background: rgba(15, 23, 42, 0.8);
  color: #f9fafb;
  font-size: 1rem;
}

input:focus {
  outline: 2px solid #818cf8;
  border-color: transparent;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

button[type='submit'] {
  border: none;
  border-radius: 0.9rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
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
}

code {
  background: rgba(0, 0, 0, 0.35);
  padding: 0.15rem 0.35rem;
  border-radius: 0.3rem;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
