<template>
  <Layout>
    <div class="questionnaire-container">
      <div class="questionnaire-card">
        <header>
          <h1>Welcome to ChordConnect!</h1>
          <p class="subtitle">Let's get to know your current skills</p>
        </header>

        <form @submit.prevent="handleSubmit" class="questionnaire-form">
          <section class="form-section">
            <h2>What chords do you know?</h2>
            <p class="section-description">Select all the chords you're comfortable playing</p>
            <div class="chord-grid">
              <label
                v-for="chord in availableChords"
                :key="chord"
                class="chord-checkbox"
              >
                <input
                  type="checkbox"
                  :value="chord"
                  v-model="selectedChords"
                />
                <span>{{ chord }}</span>
              </label>
            </div>
          </section>

          <section class="form-section">
            <h2>What genres interest you?</h2>
            <p class="section-description">Select your preferred music genres</p>
            <div class="genre-grid">
              <label
                v-for="genre in availableGenres"
                :key="genre"
                class="genre-checkbox"
              >
                <input
                  type="checkbox"
                  :value="genre"
                  v-model="selectedGenres"
                />
                <span>{{ genre }}</span>
              </label>
            </div>
          </section>

          <section class="form-section">
            <h2>What's your skill level?</h2>
            <select v-model="skillLevel" class="skill-select">
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </section>

          <section class="form-section">
            <h2>Display Name</h2>
            <input
              v-model.trim="displayName"
              type="text"
              placeholder="Enter your display name"
              required
              class="display-name-input"
            />
          </section>

          <button type="submit" :disabled="!canSubmit || loading" class="submit-btn">
            {{ loading ? 'Setting up...' : 'Complete Setup' }}
          </button>
        </form>

        <p v-if="feedback" class="feedback" :class="feedback.kind">
          {{ feedback.message }}
        </p>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { createProfile } from '@/services/userProfileService'
import { addUser as addChordLibraryUser, addChordToInventory } from '@/services/chordLibraryService'
import { addUser as addSongLibraryUser } from '@/services/songLibraryService'
import { getSessionId } from '@/utils/sessionStorage'

const router = useRouter()

// Common chords - in a real app, these would come from the API
const availableChords = [
  'C', 'D', 'E', 'F', 'G', 'A', 'B',
  'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Am', 'Bm',
  'C7', 'D7', 'E7', 'F7', 'G7', 'A7', 'B7',
  'C#', 'D#', 'F#', 'G#', 'A#',
  'Em', 'Am', 'Dm', 'Gm',
]

const availableGenres = [
  'Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'Folk', 'Classical', 'Metal', 'R&B', 'Reggae'
]

const selectedChords = ref<string[]>([])
const selectedGenres = ref<string[]>([])
const skillLevel = ref<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'>('BEGINNER')
const displayName = ref('')
const loading = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

const canSubmit = computed(() => {
  return displayName.value.trim() !== '' && selectedChords.value.length > 0
})

async function handleSubmit() {
  if (!canSubmit.value || loading.value) return
  loading.value = true
  feedback.value = null

  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      throw new Error('Not authenticated')
    }

    // Create profile
    await createProfile({
      sessionId,
      displayName: displayName.value.trim(),
      genrePreferences: selectedGenres.value,
      skillLevel: skillLevel.value,
    })

    // Add user to chord library
    await addChordLibraryUser(sessionId)

    // Add selected chords to inventory
    for (const chord of selectedChords.value) {
      await addChordToInventory({
        sessionId,
        chord,
        mastery: 'in progress',
      })
    }

    // Add user to song library
    await addSongLibraryUser(sessionId)

    feedback.value = {
      kind: 'success',
      message: 'Setup complete! Redirecting...',
    }

    setTimeout(() => {
      router.push('/learn')
    }, 1000)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to complete setup'
    feedback.value = { kind: 'error', message }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.questionnaire-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.questionnaire-card {
  background: rgba(17, 24, 39, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1.25rem;
  padding: 2rem;
  box-shadow: 0 25px 65px rgba(0, 0, 0, 0.45);
}

header {
  text-align: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  margin: 0 0 0.5rem;
}

.subtitle {
  color: #9ca3af;
  font-size: 1.1rem;
  margin: 0;
}

.questionnaire-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

h2 {
  font-size: 1.25rem;
  margin: 0;
  color: #e5e7eb;
}

.section-description {
  color: #9ca3af;
  font-size: 0.9rem;
  margin: 0;
}

.chord-grid,
.genre-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.chord-checkbox,
.genre-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chord-checkbox:hover,
.genre-checkbox:hover {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.chord-checkbox input:checked + span,
.genre-checkbox input:checked + span {
  color: #a5b4fc;
  font-weight: 600;
}

.chord-checkbox input[type='checkbox'],
.genre-checkbox input[type='checkbox'] {
  cursor: pointer;
}

.skill-select,
.display-name-input {
  padding: 0.75rem 1rem;
  background: rgba(15, 23, 42, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.65rem;
  color: #f9fafb;
  font-size: 1rem;
}

.skill-select:focus,
.display-name-input:focus {
  outline: 2px solid #818cf8;
  border-color: transparent;
}

.submit-btn {
  border: none;
  border-radius: 0.9rem;
  padding: 1rem 2rem;
  background: linear-gradient(120deg, #6366f1, #8b5cf6);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin-top: 1rem;
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
</style>

