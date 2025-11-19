<script setup lang="ts">
import { computed } from 'vue'
import { useServerStatus } from './composables/useServerStatus'

const { status, error, isLoading, refresh } = useServerStatus()

const statusLabel = computed(() => {
  if (error.value) return 'offline'
  return status.value?.status ?? 'unknown'
})

const statusMessage = computed(() => {
  if (error.value) return error.value
  return status.value?.message ?? 'Run a health check to see the backend state.'
})
</script>

<template>
  <main class="app-shell">
    <section class="card">
      <header>
        <p class="eyebrow">Backend status</p>
        <h1>Vue + API skeleton</h1>
      </header>

      <div class="status-row" :data-status="statusLabel">
        <span class="status-dot" aria-hidden="true"></span>
        <div>
          <p class="status-label">{{ statusLabel }}</p>
          <p class="status-message">{{ statusMessage }}</p>
        </div>
      </div>

      <div class="actions">
        <button type="button" :disabled="isLoading" @click="refresh">
          {{ isLoading ? 'Checking...' : 'Check backend' }}
        </button>
        <p class="hint">
          Uses <code>VITE_API_BASE_URL</code> (default: /api proxied to http://localhost:8000/api) via Axios
          inside <code>src/services</code>.
        </p>
      </div>
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

.card {
  width: min(480px, 100%);
  border-radius: 1rem;
  background: rgba(17, 24, 39, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.2rem;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

h1 {
  font-size: 1.75rem;
  margin: 0;
}

.status-row {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(31, 41, 55, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.status-row[data-status='ok'] {
  border-color: rgba(16, 185, 129, 0.4);
}

.status-row[data-status='offline'] {
  border-color: rgba(248, 113, 113, 0.4);
}

.status-dot {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  margin-top: 0.3rem;
  background: #fbbf24;
  position: relative;
}

.status-row[data-status='ok'] .status-dot {
  background: #10b981;
}

.status-row[data-status='offline'] .status-dot {
  background: #f87171;
}

.status-label {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-message {
  margin: 0.25rem 0 0;
  color: #d1d5db;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

button {
  border: none;
  border-radius: 999px;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  color: #ffffff;
  padding: 0.85rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.hint {
  font-size: 0.9rem;
  color: #9ca3af;
  margin: 0;
}

code {
  background: rgba(0, 0, 0, 0.3);
  padding: 0.15rem 0.35rem;
  border-radius: 0.25rem;
}
</style>
