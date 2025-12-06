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
              <label>Learning Goals</label>
              <textarea
                v-model.trim="profile.learningGoals"
                rows="3"
                placeholder="Describe where you want to grow next..."
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

            <div class="form-group">
              <label>Target Song</label>
              <div v-if="profile.targetSong" class="target-song-display">
                <span>{{ targetSongDisplay }}</span>
                <button
                  type="button"
                  @click="removeTarget"
                  class="remove-btn"
                  aria-label="Remove target song"
                >
                  ✕
                </button>
              </div>
              <div v-else class="song-search">
                <input 
                  v-model="songSearchQuery" 
                  @input="searchSongs"
                  type="text" 
                  placeholder="Search for a target song..." 
                  class="form-input"
                />
                <ul v-if="searchResults.length > 0" class="search-results">
                  <li 
                    v-for="song in searchResults" 
                    :key="song._id" 
                    @click="selectTargetSong(song)"
                    class="search-result-item"
                  >
                    {{ song.title }} by {{ song.artist }}
                  </li>
                </ul>
              </div>
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
                  v-model="chordMasterySelections[chord.chord]"
                  class="mastery-select"
                >
                  <option value="in progress">In Progress</option>
                  <option value="mastered">Mastered</option>
                </select>
                <button
                  class="update-btn"
                  @click="updateChordMastery(chord.chord)"
                  :disabled="!canUpdateChord(chord.chord, chord.mastery)"
                >
                  {{ updatingChord === chord.chord ? 'Updating...' : 'Update' }}
                </button>
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
import { ref, reactive, onMounted, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import {
  updateDisplayName,
  updateLearningGoals,
  updateAvatar,
  setGenrePreferences,
  changeSkillLevel,
  setTargetSong,
  removeTargetSong,
  getProfile,
} from '@/services/userProfileService'
import {
  getKnownChords,
  addChordToInventory,
  updateChordMastery as updateChordMasteryAPI,
  removeChordFromInventory,
} from '@/services/chordLibraryService'
import { resolveChordName } from '@/services/chordService'
import { searchByTitleOrArtist } from '@/services/songService'
import { getSessionId, getUserId } from '@/utils/sessionStorage'
import { useUserProfile } from '@/composables/useUserProfile'
import { GENRE_OPTIONS } from '@/constants/genres'
import type { Song } from '@/types/song'
import type { KnownChord } from '@/types/chordLibrary'

const availableGenres = [...GENRE_OPTIONS]

const profile = reactive({
  displayName: '',
  learningGoals: '',
  avatarUrl: '',
  genrePreferences: [] as string[],
  skillLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
  targetSong: '' as string,
})

const chords = ref<KnownChord[]>([])
type MasteryLevel = 'in progress' | 'mastered'
type InventoryMasteryLevel = MasteryLevel | 'na'
const newChordName = ref('')
const newChordMastery = ref<InventoryMasteryLevel>('in progress')
const loadingChords = ref(false)
const saving = ref(false)
const addingChord = ref(false)
const feedback = ref<{ kind: 'success' | 'error'; message: string } | null>(null)
const chordMasterySelections = ref<Record<string, MasteryLevel>>({})
const updatingChord = ref<string | null>(null)

const songSearchQuery = ref('')
const searchResults = ref<Song[]>([])
const targetSongDetails = ref<Song | null>(null)

const targetSongDisplay = computed(() => {
  if (targetSongDetails.value) {
    return `${targetSongDetails.value.title} by ${targetSongDetails.value.artist}`
  }
  return profile.targetSong || 'Unknown Song'
})

async function searchSongs() {
  if (songSearchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  try {
    const response = await searchByTitleOrArtist({ query: songSearchQuery.value })
    searchResults.value = response.map(r => r.song)
  } catch (error) {
    console.error('Failed to search songs:', error)
  }
}

async function selectTargetSong(song: Song) {
  profile.targetSong = song._id
  targetSongDetails.value = song
  songSearchQuery.value = ''
  searchResults.value = []
}

async function removeTarget() {
  profile.targetSong = ''
  targetSongDetails.value = null
  try {
    const sessionId = getSessionId()
    if (sessionId) {
      await removeTargetSong(sessionId)
    }
  } catch (error) {
    console.error('Failed to remove target song:', error)
  }
}

async function loadChords() {
  loadingChords.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await getKnownChords(sessionId)
    chords.value = Array.isArray(response)
      ? response
          .filter((entry): entry is KnownChord => Boolean(entry && entry.chord))
      : []
    syncChordMasterySelections(chords.value)
  } catch (error) {
    console.error('Failed to load chords:', error)
    chords.value = []
    chordMasterySelections.value = {}
  } finally {
    loadingChords.value = false
  }
}

function syncChordMasterySelections(entries: KnownChord[]) {
  const nextSelections: Record<string, MasteryLevel> = {}
  entries.forEach(entry => {
    if (!entry?.chord) return
    nextSelections[entry.chord] = normalizeMastery(entry.mastery)
  })
  chordMasterySelections.value = nextSelections
}

const allowedMasteries: MasteryLevel[] = ['in progress', 'mastered']
const fallbackMastery: MasteryLevel = 'in progress'

function normalizeMastery(value: string): MasteryLevel {
  return allowedMasteries.includes(value as MasteryLevel)
    ? (value as MasteryLevel)
    : fallbackMastery
}

function canUpdateChord(chordName: string, currentMastery: string) {
  const pending = chordMasterySelections.value[chordName]
  return (
    Boolean(pending) &&
    pending !== normalizeMastery(currentMastery) &&
    updatingChord.value !== chordName
  )
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
    await updateLearningGoals({ sessionId, newLearningGoals: profile.learningGoals })
    if (profile.avatarUrl) {
      await updateAvatar({ sessionId, newAvatarUrl: profile.avatarUrl })
    }
    await setGenrePreferences({ sessionId, newGenrePreferences: profile.genrePreferences })
    await changeSkillLevel({ sessionId, newSkillLevel: profile.skillLevel })
    
    if (profile.targetSong) {
      await setTargetSong({ sessionId, song: profile.targetSong })
    }

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

    const canonicalChordName = await resolveChordName(newChordName.value)
    if (!canonicalChordName) {
      alert('No chord found with that name. Please double-check your spelling.')
      return
    }

    await addChordToInventory({
      sessionId,
      chord: canonicalChordName,
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

async function updateChordMastery(chord: string) {
  const selectedMastery = chordMasterySelections.value[chord]
  const current = chords.value.find(entry => entry.chord === chord)
  if (!selectedMastery || !current || selectedMastery === normalizeMastery(current.mastery)) {
    return
  }

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    updatingChord.value = chord

    await updateChordMasteryAPI({
      sessionId,
      chord,
      newMastery: selectedMastery,
    })

    await loadChords()
  } catch (error) {
    console.error('Failed to update chord mastery:', error)
  } finally {
    updatingChord.value = updatingChord.value === chord ? null : updatingChord.value
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
  loadProfile()
})

async function loadProfile() {
  try {
    const userId = getUserId()
    const sessionId = getSessionId()

    if (!sessionId) return

    // Prefer calling the new getter by `user` id when available
    const existing = await getProfile({ sessionId, user: userId || undefined })
    if (!existing) return

    // Defensive mapping: only set fields that exist
    profile.displayName = existing.displayName ?? profile.displayName
    profile.learningGoals =
      existing.learningGoals ?? profile.learningGoals
    profile.avatarUrl = existing.avatarUrl ?? profile.avatarUrl
    profile.genrePreferences = Array.isArray(existing.genrePreferences)
      ? existing.genrePreferences
      : profile.genrePreferences
    profile.skillLevel = (existing.skillLevel as typeof profile.skillLevel) ?? profile.skillLevel
    profile.targetSong = existing.targetSong ?? profile.targetSong

    // If we have a target song ID, try to fetch details to display title
    if (profile.targetSong) {
      // We don't have getSongById, so we might not be able to show the title immediately
      // unless we search for it or have a cache. 
      // For now, we'll just leave it as ID or try to search if it looks like a title.
      // If it's an ID, searchByTitleOrArtist won't find it unless we support ID search.
      // Let's assume for now we can't easily get the title if we only have ID on load.
    }
  } catch (error) {
    console.error('Failed to load profile:', error)
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--contrast-mid);
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
  color: var(--contrast-mid);
}

h3 {
  font-size: 1.25rem;
  margin: 1.5rem 0 1rem;
  color: var(--contrast-mid);
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
  color: var(--contrast-mid);
  font-weight: 500;
}

.form-input,
.form-textarea,
.form-select {
  padding: 0.75rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--contrast-mid);
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

.update-btn {
  padding: 0.5rem 1rem;
  background: var(--accent);
  color: #c7d2fe;
  border: 1px solid rgba(129, 140, 248, 0.35);
  border-radius: 0.25rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: opacity 0.2s ease;
}

.update-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.target-song-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.song-search {
  position: relative;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
}

.search-result-item {
  padding: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.search-result-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>

