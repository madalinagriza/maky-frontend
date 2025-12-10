<template>
  <main class="app-shell">
    <section class="auth-card">
      <header>
        <p class="eyebrow">User Account</p>
        <h1>Join ChordConnect</h1>
        <p class="lead">Start your guitar learning journey today</p>
      </header>

      <form class="form" @submit.prevent="handleRegister">
        <label>
          <span>Username</span>
          <input v-model.trim="registerForm.username" type="text" name="username" autocomplete="username" required />
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

        <div class="checkbox-stack">
          <label class="checkbox">
            <input v-model="registerForm.isPrivateAccount" type="checkbox" />
            <span>Private account?</span>
          </label>
          <details class="helper-collapse">
            <summary>Do I want a private account?</summary>
            <p class="helper-text">
              Private accounts hide your social features (feed posts, friend discovery, recommendations)
              so you can learn in peace.
            </p>
          </details>
        </div>

        <button type="submit" :disabled="!canSubmitRegister || loading">
          {{ loading ? 'Creating account...' : 'Create account' }}
        </button>
      </form>

      <p v-if="feedback" class="feedback" :class="feedback.kind" role="status" aria-live="polite">
        {{ feedback.message }}
      </p>

      <footer class="footnote">
        <p>
          Already have an account?
          <router-link to="/login" class="link">Sign in here</router-link>
        </p>
      </footer>
    </section>
  </main>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser } from '@/services/userAccountService'

const router = useRouter()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  isKidAccount: false,
  isPrivateAccount: false,
})

const loading = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

const canSubmitRegister = computed(() => {
  return (
    registerForm.username.trim() !== '' &&
    registerForm.email.trim() !== '' &&
    registerForm.password.trim().length >= 6
  )
})

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
      isPrivateAccount: registerForm.isPrivateAccount,
    }

    await registerUser(payload)
    feedback.value = {
      kind: 'success',
      message: 'Account created successfully! Redirecting to login...',
    }

    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to register user'
    feedback.value = { kind: 'error', message }
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
  background: 
    radial-gradient(
      circle at top,
      var(--contrast-top) 0%,
      var(--contrast-mid) 35%,
      var(--contrast-bottom) 100%
    ),
    linear-gradient(
      135deg,
      var(--auth-overlay) 0%,
      transparent 50%,
      var(--auth-overlay) 100%
    );
  padding: 1.5rem;
  color: var(--contrast-mid);
}

.auth-card {
  width: min(560px, 100%);
  border-radius: 1.25rem;
  background: var(--main);
  border: 1px solid var(--border);
  box-shadow: 0 25px 65px var(--shadow-strong);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  font-family: var(--main-font);
}

.eyebrow {
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: var(--font-size-xs);
  margin: 0;
}

h1 {
  margin: 0.35rem 0 0;
  font-size: var(--font-size-2xl);
  font-family: var(--logo-font);
  font-weight: var(--logo-font-weight);
}

.lead {
  margin: 0.75rem 0 0;
  color: var(--text-secondary);
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
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.checkbox-stack {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

input[type='text'],
input[type='email'],
input[type='password'] {
  border-radius: 0.65rem;
  border: 1px solid var(--input-border);
  padding: 0.75rem 0.9rem;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: var(--font-size-base);
  border: 1px solid var(--input-border);
  padding: 0.75rem 0.9rem;
  background: var(--input-bg);
  color: var(--input-text);
  font-size: var(--font-size-base);
}

input:focus {
  outline: 2px solid var(--input-focus);
  border-color: transparent;
}

.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  user-select: none;
}

.helper-text {
  font-size: 0.85rem;
  color: #9ca3af;
  margin: 0;
  line-height: 1.4;
  font-style: italic;
}

.helper-collapse {
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 0.75rem 0.9rem;
  background: var(--bg-card);
  color: var(--text-primary);
}

.helper-collapse summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.35rem;
}

button[type='submit'] {
  border: none;
  border-radius: 0.9rem;
  padding: 0.85rem 1.25rem;
  background: var(--button);
  color: var(--btn-text);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
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
  font-weight: var(--font-weight-semibold);
  text-align: center;
}

.feedback.success {
  background: var(--success-bg);
  color: var(--success);
  border: 1px solid var(--success-border);
}

.feedback.error {
  background: var(--error-bg);
  color: var(--error);
  border: 1px solid var(--error-border);
}

.footnote {
  margin: 0;
  color: var(--text-muted);
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

