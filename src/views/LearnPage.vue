<template>
  <Layout>
    <div class="learn-container">
      <h1>Learn</h1>

      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search songs or artists..."
          class="search-input"
        />
      </div>

      <div class="sections">
        <section class="learn-section">
          <h2>Practice Your Songs</h2>
          <div v-if="loadingSongs" class="loading">Loading...</div>
          <div v-else-if="playableSongs.length === 0" class="empty-state">
            No playable songs yet. Learn some chords to unlock songs!
          </div>
          <ul v-else class="song-list">
            <li v-for="song in filteredPlayableSongs" :key="song" class="song-item">
              {{ song }}
            </li>
          </ul>
        </section>

        <section class="learn-section">
          <h2>Learn a New Song</h2>
          <div v-if="loadingRecommendations" class="loading">Loading recommendations...</div>
          <div v-else-if="recommendedSongs.length === 0" class="empty-state">
            No song recommendations available.
          </div>
          <ul v-else class="song-list">
            <li v-for="song in recommendedSongs" :key="song" class="song-item">
              {{ song }}
              <button @click="startLearningSong(song)" class="learn-btn">Start Learning</button>
            </li>
          </ul>
        </section>

        <section class="learn-section">
          <h2>Learn a New Chord</h2>
          <div v-if="loadingChordRec" class="loading">Loading recommendation...</div>
          <div v-else-if="recommendedChord" class="chord-recommendation">
            <div class="chord-card">
              <h3>{{ recommendedChord }}</h3>
              <p v-if="unlockedSongs.length > 0">
                Learning this chord will unlock {{ unlockedSongs.length }} new songs!
              </p>
              <button @click="startLearningChord(recommendedChord)" class="learn-btn">
                Add to My Chords
              </button>
            </div>
          </div>
          <div v-else class="empty-state">No chord recommendations available.</div>
        </section>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { getPlayableSongs, startLearningSong as startLearningSongAPI } from '@/services/songLibraryService'
import { requestPersonalizedSongRecommendation, requestChordRecommendation, requestSongUnlockRecommendation } from '@/services/recommendationService'
import { addChordToInventory } from '@/services/chordLibraryService'
import { getSessionId } from '@/utils/sessionStorage'

const searchQuery = ref('')
const playableSongs = ref<string[]>([])
const recommendedSongs = ref<string[]>([])
const recommendedChord = ref<string | null>(null)
const unlockedSongs = ref<string[]>([])
const loadingSongs = ref(false)
const loadingRecommendations = ref(false)
const loadingChordRec = ref(false)

const filteredPlayableSongs = computed(() => {
  if (!searchQuery.value.trim()) return playableSongs.value
  const query = searchQuery.value.toLowerCase()
  return playableSongs.value.filter(song => song.toLowerCase().includes(query))
})

async function loadPlayableSongs() {
  loadingSongs.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await getPlayableSongs({ sessionId })
    // Response is an array of objects with songs property
    if (Array.isArray(response) && response.length > 0) {
      playableSongs.value = response[0]?.songs ?? []
    } else {
      playableSongs.value = []
    }
  } catch (error) {
    console.error('Failed to load playable songs:', error)
    playableSongs.value = []
  } finally {
    loadingSongs.value = false
  }
}

async function loadSongRecommendations() {
  loadingRecommendations.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await requestPersonalizedSongRecommendation({ sessionId })
    recommendedSongs.value = response?.recommendedSongs ?? []
  } catch (error) {
    console.error('Failed to load song recommendations:', error)
    recommendedSongs.value = []
  } finally {
    loadingRecommendations.value = false
  }
}

async function loadChordRecommendation() {
  loadingChordRec.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await requestChordRecommendation({ sessionId })
    recommendedChord.value = response.recommendedChord

    // Get unlocked songs for this chord
    if (recommendedChord.value) {
      try {
        const unlockResponse = await requestSongUnlockRecommendation({
          sessionId,
          potentialChord: recommendedChord.value,
        })
        unlockedSongs.value = unlockResponse?.unlockedSongs ?? []
      } catch (error) {
        console.error('Failed to load unlocked songs:', error)
      }
    }
  } catch (error) {
    console.error('Failed to load chord recommendation:', error)
    recommendedChord.value = null
  } finally {
    loadingChordRec.value = false
  }
}

async function startLearningSong(song: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await startLearningSongAPI({
      sessionId,
      song,
      mastery: 'in progress',
    })
    // Reload data
    await loadPlayableSongs()
    await loadSongRecommendations()
  } catch (error) {
    console.error('Failed to start learning song:', error)
  }
}

async function startLearningChord(chord: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await addChordToInventory({
      sessionId,
      chord,
      mastery: 'in progress',
    })
    // Reload recommendations
    await loadChordRecommendation()
    await loadPlayableSongs()
  } catch (error) {
    console.error('Failed to add chord:', error)
  }
}

onMounted(() => {
  loadPlayableSongs()
  loadSongRecommendations()
  loadChordRecommendation()
})
</script>

<style scoped>
.learn-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--contrast-mid);
}

.search-section {
  margin-bottom: 2rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.65rem;
  color: #f9fafb;
  font-size: 1rem;
}

.search-input:focus {
  outline: 2px solid #818cf8;
  border-color: transparent;
}

.sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.learn-section {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: var(--contrast-mid);
}

.loading,
.empty-state {
  color: #9ca3af;
  padding: 2rem;
  text-align: center;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.song-item {
  padding: 1rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chord-recommendation {
  display: flex;
  justify-content: center;
}

.chord-card {
  background: var(--card);
  border: 2px solid rgba(99, 102, 241, 0.3);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  max-width: 400px;
}

.chord-card h3 {
  font-size: 2rem;
  margin: 0 0 1rem;
  color: var(--contrast-top);
}

.learn-btn {
  padding: 0.5rem 1rem;
  background: var(--button);
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.learn-btn:hover {
  opacity: 0.9;
}
</style>

