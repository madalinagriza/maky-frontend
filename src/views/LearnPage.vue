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
            <li v-for="song in filteredPlayableSongs" :key="song._id" class="song-item">
              <div class="song-info">
                <span class="song-title">{{ song.title }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </div>
              <button @click="startLearningSong(song._id)" class="learn-btn">Start Learning</button>
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
import { getPlayableSongs, searchByTitleOrArtist } from '@/services/songService'
import { startLearningSong as startLearningSongAPI } from '@/services/songLibraryService'
import { requestChordRecommendation, requestSongUnlockRecommendation } from '@/services/recommendationService'
import { addChordToInventory, getKnownChords } from '@/services/chordLibraryService'
import { getSessionId } from '@/utils/sessionStorage'
import type { Song } from '@/types/song'

const searchQuery = ref('')
const playableSongs = ref<Song[]>([])
const recommendedChord = ref<string | null>(null)
const unlockedSongs = ref<string[]>([])
const loadingSongs = ref(false)
const loadingChordRec = ref(false)

const filteredPlayableSongs = computed(() => {
  if (!searchQuery.value.trim()) return playableSongs.value
  const query = searchQuery.value.toLowerCase()
  return playableSongs.value.filter(song => 
    song.title.toLowerCase().includes(query) || 
    song.artist.toLowerCase().includes(query)
  )
})

async function loadData() {
  loadingSongs.value = true
  loadingChordRec.value = true
  
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    // 1. Get Known Chords
    const knownChordsResponse = await getKnownChords(sessionId)
    const knownChords = knownChordsResponse.map(kc => kc.chord)

    // 2. Get Playable Songs
    const playableResponse = await getPlayableSongs({ knownChords })
    playableSongs.value = playableResponse.map(r => r.song)

    // 3. Get All Songs (needed for recommendation)
    // Assuming empty query returns a list of songs
    const allSongsResponse = await searchByTitleOrArtist({ query: '' })
    const allSongs = allSongsResponse.map(r => r.song)

    // 4. Get Chord Recommendation
    if (allSongs.length > 0) {
      const recResponse = await requestChordRecommendation({
        knownChords,
        allSongs
      })
      recommendedChord.value = recResponse.recommendedChord

      // 5. Get Unlocked Songs for recommended chord
      if (recommendedChord.value) {
        const unlockResponse = await requestSongUnlockRecommendation({
          knownChords,
          potentialChord: recommendedChord.value,
          allSongs
        })
        unlockedSongs.value = unlockResponse.unlockedSongs
      }
    }

  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loadingSongs.value = false
    loadingChordRec.value = false
  }
}

async function startLearningSong(songId: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await startLearningSongAPI({
      sessionId,
      song: songId,
      mastery: 'in progress',
    })
    // Reload data
    await loadData()
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
    // Reload data
    await loadData()
  } catch (error) {
    console.error('Failed to add chord:', error)
  }
}

onMounted(() => {
  loadData()
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

.song-info {
  display: flex;
  flex-direction: column;
}

.song-title {
  font-weight: 600;
  color: #e5e7eb;
}

.song-artist {
  font-size: 0.875rem;
  color: #9ca3af;
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

