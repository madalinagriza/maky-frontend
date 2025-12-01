<template>
  <Layout>
    <div class="account-page">
      <header class="page-header">
        <div>
          <p class="eyebrow">Account Settings</p>
          <h1>Manage your account</h1>
          <p class="lead">Update login credentials and control visibility preferences.</p>
        </div>
      </header>

      <div class="settings-grid">
        <section class="settings-card">
          <div class="card-header">
            <div>
              <h2>Credentials</h2>
              <p class="card-subtitle">Change username and email used for login.</p>
            </div>
          </div>

          <form class="form" @submit.prevent="handleCredentialsSubmit">
            <label>
              <span>Username</span>
              <input
                v-model.trim="credentialsForm.username"
                type="text"
                placeholder="Enter new username"
                minlength="3"
                required
                :disabled="isCredentialsDisabled"
              />
            </label>

            <label>
              <span>Email</span>
              <input
                v-model.trim="credentialsForm.email"
                type="email"
                placeholder="Enter new email"
                required
                :disabled="isCredentialsDisabled"
              />
            </label>

            <button type="submit" :disabled="!canSubmitCredentials">
              {{ credentialsLoading ? 'Updating…' : 'Save changes' }}
            </button>
          </form>

          <p v-if="credentialsFeedback" class="feedback" :class="credentialsFeedback.kind">
            {{ credentialsFeedback.message }}
          </p>
        </section>

        <section class="settings-card">
          <div class="card-header">
            <div>
              <h2>Account visibility</h2>
              <p class="card-subtitle">Control how your activity appears to others.</p>
            </div>
          </div>

          <div class="toggle-row">
            <div>
              <p class="toggle-label">Kid account</p>
              <p class="toggle-description">Enable safer defaults and restricted sharing.</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="kidStatus" :disabled="isKidDisabled" />
              <span class="slider"></span>
            </label>
          </div>
          <button
            type="button"
            class="toggle-action"
            @click="persistKidStatus"
            :disabled="!canPersistKid"
          >
            {{ kidSaving ? 'Saving…' : 'Save kid account status' }}
          </button>
          <p v-if="kidFeedback" class="feedback" :class="kidFeedback.kind">
            {{ kidFeedback.message }}
          </p>

          <div class="toggle-row">
            <div>
              <p class="toggle-label">Private account</p>
              <p class="toggle-description">Hide posts from non-followers and tighten visibility.</p>
            </div>
            <label class="switch">
              <input type="checkbox" v-model="privateStatus" :disabled="isPrivateDisabled" />
              <span class="slider"></span>
            </label>
          </div>
          <button
            type="button"
            class="toggle-action"
            @click="persistPrivateStatus"
            :disabled="!canPersistPrivate"
          >
            {{ privateSaving ? 'Saving…' : 'Save private account status' }}
          </button>
          <p v-if="privateFeedback" class="feedback" :class="privateFeedback.kind">
            {{ privateFeedback.message }}
          </p>

          <p class="note">
            These toggles reflect the last values saved from this device. If you changed them elsewhere, update them again here.
          </p>
        </section>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { useAuth } from '@/composables/useAuth'
import {
  updateCredentials,
  setKidAccountStatus,
  setPrivateAccountStatus,
} from '@/services/userAccountService'

const { sessionId, username, userId, updateStoredUsername, refreshKidOrPrivateStatus } = useAuth()

const credentialsForm = reactive({
  username: username.value ?? '',
  email: '',
})
const credentialsLoading = ref(false)
const credentialsFeedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

watch(
  () => username.value,
  next => {
    if (next && !credentialsForm.username) {
      credentialsForm.username = next
    }
  }
)

const isCredentialsDisabled = computed(() => credentialsLoading.value)
const canSubmitCredentials = computed(() => {
  if (credentialsLoading.value) return false
  const usernameValid = credentialsForm.username.trim().length >= 3
  const emailValid = /.+@.+\..+/.test(credentialsForm.email.trim())
  return usernameValid && emailValid
})

async function handleCredentialsSubmit() {
  if (!canSubmitCredentials.value || !sessionId.value) return
  credentialsLoading.value = true
  credentialsFeedback.value = null

  try {
    await updateCredentials({
      sessionId: sessionId.value,
      newUsername: credentialsForm.username.trim(),
      newEmail: credentialsForm.email.trim(),
    })
    updateStoredUsername?.(credentialsForm.username.trim())
    credentialsFeedback.value = { kind: 'success', message: 'Credentials updated successfully.' }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update credentials.'
    credentialsFeedback.value = { kind: 'error', message }
  } finally {
    credentialsLoading.value = false
  }
}

// Local persistence keeps toggle states consistent between visits even without a reader API.
function flagKey(prefix: string) {
  return userId.value ? `${prefix}:${userId.value}` : null
}

function readFlag(prefix: string, fallback: boolean) {
  const key = flagKey(prefix)
  if (!key) return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored === null ? fallback : stored === 'true'
  } catch {
    return fallback
  }
}

function writeFlag(prefix: string, value: boolean) {
  const key = flagKey(prefix)
  if (!key) return
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // ignore storage failures
  }
}

const kidStatus = ref(readFlag('account:kid', false))
const privateStatus = ref(readFlag('account:private', false))
const kidSavedStatus = ref(kidStatus.value)
const privateSavedStatus = ref(privateStatus.value)

watch(
  () => userId.value,
  () => {
    kidStatus.value = readFlag('account:kid', false)
    privateStatus.value = readFlag('account:private', false)
    kidSavedStatus.value = kidStatus.value
    privateSavedStatus.value = privateStatus.value
  }
)

const kidSaving = ref(false)
const privateSaving = ref(false)
const kidFeedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
const privateFeedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

const isKidDisabled = computed(() => kidSaving.value)
const isPrivateDisabled = computed(() => privateSaving.value)
const canPersistKid = computed(() => !kidSaving.value && kidStatus.value !== kidSavedStatus.value)
const canPersistPrivate = computed(
  () => !privateSaving.value && privateStatus.value !== privateSavedStatus.value
)

async function persistKidStatus() {
  if (!sessionId.value || !canPersistKid.value) return
  kidSaving.value = true
  kidFeedback.value = null
  try {
    await setKidAccountStatus({ sessionId: sessionId.value, status: kidStatus.value })
    kidSavedStatus.value = kidStatus.value
    writeFlag('account:kid', kidStatus.value)
    await refreshKidOrPrivateStatus()
    kidFeedback.value = { kind: 'success', message: 'Kid account status updated.' }
  } catch (error) {
    kidStatus.value = kidSavedStatus.value
    const message = error instanceof Error ? error.message : 'Unable to update kid status.'
    kidFeedback.value = { kind: 'error', message }
  } finally {
    kidSaving.value = false
  }
}

async function persistPrivateStatus() {
  if (!sessionId.value || !canPersistPrivate.value) return
  privateSaving.value = true
  privateFeedback.value = null
  try {
    await setPrivateAccountStatus({ sessionId: sessionId.value, status: privateStatus.value })
    privateSavedStatus.value = privateStatus.value
    writeFlag('account:private', privateStatus.value)
    await refreshKidOrPrivateStatus()
    privateFeedback.value = { kind: 'success', message: 'Private account status updated.' }
  } catch (error) {
    privateStatus.value = privateSavedStatus.value
    const message = error instanceof Error ? error.message : 'Unable to update private status.'
    privateFeedback.value = { kind: 'error', message }
  } finally {
    privateSaving.value = false
  }
}
</script>

<style scoped>
.account-page {
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: #9ca3af;
}

h1 {
  margin: 0.25rem 0;
  font-size: 2.25rem;
  color: var(--contrast-mid);
}

.lead {
  color: #d1d5db;
  margin: 0;
}

.session-warning {
  background: rgba(248, 113, 113, 0.1);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #fecaca;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.settings-card {
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.35rem;
}

.card-subtitle {
  margin: 0.25rem 0 0;
  color: #9ca3af;
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
  color: var(--contrast-mid);
}

input {
  border-radius: 0.65rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.75rem 0.9rem;
  background: var(--main-top);
  color: #f9fafb;
  font-size: 1rem;
}

button[type='submit'],
.toggle-action {
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

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin: 0;
  padding: 0.85rem 1rem;
  border-radius: 0.75rem;
  font-weight: 600;
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

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.toggle-label {
  margin: 0;
  font-weight: 600;
}

.toggle-description {
  margin: 0.25rem 0 0;
  color: #9ca3af;
  font-size: 0.9rem;
}

.switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.2);
  transition: 0.2s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.2s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--accent);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.note {
  margin: 0.5rem 0 0;
  color: #9ca3af;
  font-size: 0.85rem;
}

@media (max-width: 640px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
