<template>
  <Layout>
    <div class="profile-container">
      <h1>Profile</h1>

      <div class="profile-layout">
        <div class="profile-card">
          <h2>Profile Settings</h2>

          <form @submit.prevent="saveProfile" class="profile-form">
            <div class="form-group">
              <label>Display Name</label>
              <input v-model.trim="profile.displayName" type="text" required class="form-input" />
            </div>

            <div class="form-group">
              <label>Bio</label>
              <textarea
                v-model.trim="profile.bio"
                rows="3"
                placeholder="Tell us about yourself..."
                class="form-textarea"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Avatar URL</label>
              <input v-model.trim="profile.avatarUrl" type="url" class="form-input" />
            </div>

            <div class="form-group">
              <label>Preferred Genres</label>
              <div class="genre-checkboxes">
                <label
                  v-for="genre in availableGenres"
                  :key="genre"
                  class="checkbox-label"
                >
                  <input
                    type="checkbox"
                    :value="genre"
                    v-model="profile.genrePreferences"
                  />
                  <span>{{ genre }}</span>
                </label>
              </div>
            </div>

            <div class="form-group">
              <label>Skill Level</label>
              <select v-model="profile.skillLevel" class="form-select">
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>

            <button type="submit" :disabled="saving" class="save-btn">
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </button>
          </form>

          <p v-if="feedback" class="feedback" :class="feedback.kind">
            {{ feedback.message }}
          </p>
        </div>

        <div class="chords-card">
          <h2>Known Chords</h2>
          <div v-if="loadingChords" class="loading">Loading...</div>
          <div v-else-if="chords.length === 0" class="empty-state">No chords added yet</div>
          <div v-else class="chords-list">
            <div v-for="chord in chords" :key="chord.chord" class="chord-item">
              <div class="chord-info">
                <span class="chord-name">{{ chord.chord }}</span>
                <select
                  :value="chord.mastery"
                  @change="updateChordMastery(chord.chord, ($event.target as HTMLSelectElement).value)"
                  class="mastery-select"
                >
                  <option value="na">Not Started</option>
                  <option value="in progress">In Progress</option>
                  <option value="mastered">Mastered</option>
                </select>
              </div>
              <button @click="removeChord(chord.chord)" class="remove-btn">Remove</button>
            </div>
          </div>

          <div class="add-chord-section">
            <h3>Add New Chord</h3>
            <div class="add-chord-inputs">
              <input
                v-model.trim="newChordName"
                type="text"
                placeholder="Chord name (e.g., C, Dm, G7)"
                class="chord-input"
              />
              <select v-model="newChordMastery" class="mastery-select">
                <option value="na">Not Started</option>
                <option value="in progress">In Progress</option>
                <option value="mastered">Mastered</option>
              </select>
              <button @click="addChord" :disabled="!newChordName || addingChord" class="add-btn">
                {{ addingChord ? 'Adding...' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import {
  updateDisplayName,
  updateBio,
  updateAvatar,
  setGenrePreferences,
  changeSkillLevel,
} from '@/services/userProfileService'
import {
  getKnownChords,
  addChordToInventory,
  updateChordMastery as updateChordMasteryAPI,
  removeChordFromInventory,
} from '@/services/chordLibraryService'
import { getSessionId } from '@/utils/sessionStorage'
import { useUserProfile } from '@/composables/useUserProfile'

const availableGenres = [
  'Rock', 'Pop', 'Country', 'Jazz', 'Blues', 'Folk', 'Classical', 'Metal', 'R&B', 'Reggae'
]

const profile = reactive({
  displayName: '',
  bio: '',
  avatarUrl: '',
  genrePreferences: [] as string[],
  skillLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
})

const chords = ref<Array<{ chord: string; mastery: string }>>([])
const newChordName = ref('')
const newChordMastery = ref<'na' | 'in progress' | 'mastered'>('in progress')
const loadingChords = ref(false)
const saving = ref(false)
const addingChord = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)

async function loadChords() {
  loadingChords.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await getKnownChords(sessionId)
    chords.value = response
  } catch (error) {
    console.error('Failed to load chords:', error)
    chords.value = []
  } finally {
    loadingChords.value = false
  }
}

async function saveProfile() {
  if (saving.value) return
  saving.value = true
  feedback.value = null

  try {
    const sessionId = getSessionId()
    if (!sessionId) throw new Error('Not authenticated')

    // Update all profile fields
    await updateDisplayName({ sessionId, newDisplayName: profile.displayName })
    await updateBio({ sessionId, newBio: profile.bio })
    if (profile.avatarUrl) {
      await updateAvatar({ sessionId, newAvatarUrl: profile.avatarUrl })
    }
    await setGenrePreferences({ sessionId, newGenrePreferences: profile.genrePreferences })
    await changeSkillLevel({ sessionId, newSkillLevel: profile.skillLevel })

    // Sync profile data to composable
    const { setProfile } = useUserProfile()
    setProfile({
      displayName: profile.displayName,
      avatarUrl: profile.avatarUrl || null,
    })

    feedback.value = {
      kind: 'success',
      message: 'Profile updated successfully!',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update profile'
    feedback.value = { kind: 'error', message }
  } finally {
    saving.value = false
  }
}

async function addChord() {
  if (!newChordName.value.trim() || addingChord.value) return
  addingChord.value = true

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await addChordToInventory({
      sessionId,
      chord: newChordName.value.trim(),
      mastery: newChordMastery.value,
    })

    newChordName.value = ''
    await loadChords()
  } catch (error) {
    console.error('Failed to add chord:', error)
  } finally {
    addingChord.value = false
  }
}

async function updateChordMastery(chord: string, mastery: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await updateChordMasteryAPI({
      sessionId,
      chord,
      newMastery: mastery as 'na' | 'in progress' | 'mastered',
    })

    await loadChords()
  } catch (error) {
    console.error('Failed to update chord mastery:', error)
  }
}

async function removeChord(chord: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await removeChordFromInventory({ sessionId, chord })
    await loadChords()
  } catch (error) {
    console.error('Failed to remove chord:', error)
  }
}

onMounted(() => {
  loadChords()
  // TODO: Load existing profile data
})
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

.profile-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.profile-card,
.chords-card {
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 2rem;
}

h2 {
  font-size: 1.5rem;
  margin: 0 0 1.5rem;
  color: #e5e7eb;
}

h3 {
  font-size: 1.25rem;
  margin: 1.5rem 0 1rem;
  color: #d1d5db;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #e5e7eb;
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
  font-family: inherit;
}

.form-textarea {
  resize: vertical;
}

.genre-checkboxes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  cursor: pointer;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: var(--button);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.chords-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.chord-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.chord-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.chord-name {
  font-weight: 600;
  color: #e5e7eb;
  min-width: 80px;
}

.mastery-select {
  padding: 0.5rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  color: #f9fafb;
  font-size: 0.875rem;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: rgba(248, 113, 113, 0.2);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.add-chord-section {
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.add-chord-inputs {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.chord-input {
  flex: 1;
  padding: 0.75rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: var(--button);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.feedback {
  margin-top: 1rem;
  padding: 0.9rem 1rem;
  border-radius: 0.5rem;
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

.loading,
.empty-state {
  color: #9ca3af;
  padding: 2rem;
  text-align: center;
}
</style>

