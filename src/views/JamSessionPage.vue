<template>
  <Layout>
    <div class="session-container">
      <div v-if="loading" class="loading">Loading session...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="session" class="session-content">
        <div class="session-header">
          <button @click="goBack" class="back-btn">← Back to Group</button>
          <div class="header-info">
            <div>
              <h1>Jam Session</h1>
              <span :class="['status-badge', session.status.toLowerCase()]">
                {{ session.status }}
              </span>
            </div>
            <div class="header-actions">
              <span class="participants-count">
                👥 {{ session.participants.length }} {{ session.participants.length === 1 ? 'participant' : 'participants' }}
              </span>
              <button
                v-if="session.status === 'ACTIVE' && canEndSession"
                @click="confirmEndSession"
                class="end-session-btn"
                :disabled="endingSession"
              >
                {{ endingSession ? 'Ending...' : 'End Session' }}
              </button>
            </div>
          </div>
        </div>

        <div class="session-layout">
          <!-- Common Chords Section -->
          <section class="common-chords-section">
            <h2>Common Chords</h2>
            <div v-if="loadingCommonChords" class="loading-small">Loading...</div>
            <div v-else-if="commonChords.length === 0" class="empty-small">
              No common chords available yet
            </div>
            <div v-else>
              <p class="chord-count">{{ commonChords.length }} chords everyone knows</p>
              <div class="chord-pills">
                <span v-for="chord in commonChords" :key="chord" class="chord-pill">
                  {{ chord }}
                </span>
              </div>
            </div>
          </section>

          <!-- Song Recommendations Section -->
          <section class="recommendations-section">
            <div class="section-header">
              <h2>Song Recommendations</h2>
              <button
                v-if="playableSongs.length > 1"
                @click="nextRecommendation"
                class="next-btn"
              >
                Next Song →
              </button>
            </div>

            <div v-if="loadingPlayableSongs" class="loading-small">Loading recommendations...</div>
            <div v-else-if="playableSongs.length === 0" class="empty-small">
              No song recommendations available. Learn more chords as a group!
            </div>
            <div v-else-if="currentRecommendation" class="recommendation-card">
              <div class="rec-header">
                <div>
                  <h3>{{ currentRecommendation.title }}</h3>
                  <p class="rec-artist">{{ currentRecommendation.artist }}</p>
                </div>
                <span v-if="currentRecommendation.genre" class="genre-tag">
                  {{ currentRecommendation.genre }}
                </span>
              </div>

              <div class="rec-chords">
                <span class="rec-chords-label">Required chords:</span>
                <div class="rec-chord-list">
                  <span
                    v-for="chord in currentRecommendation.chords"
                    :key="chord"
                    class="rec-chord-pill"
                  >
                    {{ chord }}
                  </span>
                </div>
              </div>

              <button
                v-if="session.status === 'ACTIVE'"
                @click="practiceThisSong"
                class="practice-btn"
                :disabled="sharingSong"
              >
                {{ sharingSong ? 'Adding...' : 'Practice This Song' }}
              </button>

              <p class="rec-footer">
                Showing {{ currentRecommendationIndex + 1 }} of {{ playableSongs.length }} songs
              </p>
            </div>
          </section>

          <!-- Shared Songs Section -->
          <section class="shared-songs-section">
            <h2>Shared Songs</h2>
            <div v-if="session.sharedSongs.length === 0" class="empty-small">
              No songs shared yet. Practice a song to get started!
            </div>
            <ul v-else class="shared-songs-list">
              <li v-for="(sharedSong, index) in session.sharedSongs" :key="index" class="shared-song-item">
                <div class="shared-song-info">
                  <div>
                    <span class="shared-song-title">{{ getSongTitle(sharedSong.song) }}</span>
                    <span class="shared-by">shared by {{ sharedSong.participant }}</span>
                  </div>
                  <span :class="['song-status', sharedSong.currentStatus.toLowerCase().replace(' ', '-')]">
                    {{ sharedSong.currentStatus }}
                  </span>
                </div>
                <div v-if="sharedSong.participant === currentUsername && session.status === 'ACTIVE'" class="status-buttons">
                  <button
                    @click="updateSongStatus(sharedSong.song, 'practicing')"
                    :class="['status-btn', sharedSong.currentStatus === 'practicing' ? 'active' : '']"
                  >
                    Practicing
                  </button>
                  <button
                    @click="updateSongStatus(sharedSong.song, 'mastered')"
                    :class="['status-btn', sharedSong.currentStatus === 'mastered' ? 'active' : '']"
                  >
                    Mastered
                  </button>
                  <button
                    @click="updateSongStatus(sharedSong.song, 'need help')"
                    :class="['status-btn', sharedSong.currentStatus === 'need help' ? 'active' : '']"
                  >
                    Need Help
                  </button>
                </div>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { useAuth } from '@/composables/useAuth'
import {
  getCommonChordsForGroup,
  getPlayableSongsForGroup,
  getJamGroupById,
} from '@/services/jamGroupService'
import {
  getJamSessionById,
  endJamSession,
  shareSongInSession,
  updateSharedSongStatus,
} from '@/services/jamSessionService'
import type { JamSession } from '@/types/jamSession'
import type { JamGroup } from '@/types/jamGroup'
import type { Song } from '@/types/song'

const router = useRouter()
const route = useRoute()
const { username, userId } = useAuth()

const session = ref<JamSession | null>(null)
const group = ref<JamGroup | null>(null)
const commonChords = ref<string[]>([])
const playableSongs = ref<Song[]>([])
const currentRecommendationIndex = ref(0)

const loading = ref(true)
const error = ref<string | null>(null)
const loadingCommonChords = ref(false)
const loadingPlayableSongs = ref(false)
const endingSession = ref(false)
const sharingSong = ref(false)

const groupId = computed(() => route.params.groupId as string)
const sessionId = computed(() => route.params.sessionId as string)
const currentUsername = computed(() => username.value || '')
const currentUserId = computed(() => userId.value || '')
const isSessionParticipant = computed(() => {
  if (!session.value) return false
  const identifiers = [currentUserId.value, currentUsername.value].filter(Boolean)
  return identifiers.some(id => session.value?.participants.includes(id))
})

const isGroupCreator = computed(() => {
  if (!group.value) return false
  const identifiers = [currentUserId.value, currentUsername.value].filter(Boolean)
  return identifiers.includes(group.value.creator)
})

const canEndSession = computed(() => {
  if (!session.value) return false
  return isSessionParticipant.value || isGroupCreator.value
})

const currentRecommendation = computed(() => {
  if (playableSongs.value.length === 0) return null
  return playableSongs.value[currentRecommendationIndex.value]
})

async function loadSession() {
  loading.value = true
  error.value = null
  try {
    session.value = await getJamSessionById(sessionId.value)
    if (!session.value) {
      error.value = 'Session not found'
      return
    }
    await Promise.all([loadCommonChords(), loadPlayableSongs()])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load session'
    console.error('Error loading session:', err)
  } finally {
    loading.value = false
  }
}

async function loadCommonChords() {
  loadingCommonChords.value = true
  try {
    const response = await getCommonChordsForGroup(groupId.value)
    commonChords.value = response.commonChords
  } catch (err) {
    console.error('Error loading common chords:', err)
  } finally {
    loadingCommonChords.value = false
  }
}

async function loadPlayableSongs() {
  loadingPlayableSongs.value = true
  try {
    playableSongs.value = await getPlayableSongsForGroup(groupId.value)
  } catch (err) {
    console.error('Error loading playable songs:', err)
  } finally {
    loadingPlayableSongs.value = false
  }
}

async function loadGroupDetails() {
  try {
    group.value = await getJamGroupById(groupId.value)
  } catch (err) {
    console.error('Error loading group details:', err)
  }
}

function nextRecommendation() {
  currentRecommendationIndex.value =
    (currentRecommendationIndex.value + 1) % playableSongs.value.length
}

async function practiceThisSong() {
  if (!currentRecommendation.value || sharingSong.value) return
  sharingSong.value = true
  try {
    await shareSongInSession(sessionId.value, currentRecommendation.value._id, 'practicing')
    await loadSession()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to share song')
  } finally {
    sharingSong.value = false
  }
}

async function updateSongStatus(songId: string, newStatus: string) {
  try {
    await updateSharedSongStatus(sessionId.value, songId, newStatus)
    await loadSession()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to update status')
  }
}

async function confirmEndSession() {
  if (!confirm('End this jam session?')) return
  endingSession.value = true
  try {
    await endJamSession(sessionId.value)
    router.push(`/jam/${groupId.value}`)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to end session')
  } finally {
    endingSession.value = false
  }
}

function goBack() {
  router.push(`/jam/${groupId.value}`)
}

function getSongTitle(songId: string): string {
  const song = playableSongs.value.find(s => s._id === songId)
  return song ? `${song.title} - ${song.artist}` : songId
}

onMounted(() => {
  loadGroupDetails()
  loadSession()
})
</script>

<style scoped>
.session-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem;
  color: var(--contrast-mid);
  font-size: 1.1rem;
}

.error-message {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.session-header {
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--contrast-mid);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--accent);
}

.header-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info h1 {
  display: inline-block;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 1rem 0 0;
  background: linear-gradient(120deg, var(--contrast-top), var(--contrast-mid));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-badge {
  padding: 0.4rem 0.9rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.status-badge.completed {
  background: rgba(156, 163, 175, 0.2);
  color: #d1d5db;
  border: 1px solid rgba(156, 163, 175, 0.4);
}

.status-badge.scheduled {
  background: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.participants-count {
  color: var(--contrast-mid);
  font-weight: 500;
  font-size: 1.05rem;
}

.end-session-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.end-session-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.session-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.common-chords-section,
.recommendations-section,
.shared-songs-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: var(--contrast-top);
  margin: 0 0 1rem 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h2 {
  margin: 0;
}

.next-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.chord-count {
  color: var(--contrast-mid);
  margin: 0 0 1rem 0;
}

.chord-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chord-pill {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: var(--contrast-top);
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.recommendation-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.rec-header h3 {
  font-size: 1.5rem;
  color: var(--contrast-top);
  margin: 0 0 0.25rem 0;
}

.rec-artist {
  color: var(--contrast-mid);
  margin: 0;
  font-size: 1.05rem;
}

.genre-tag {
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
  border: 1px solid rgba(99, 102, 241, 0.5);
  color: var(--contrast-top);
  padding: 0.4rem 0.9rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.rec-chords {
  margin-bottom: 1.5rem;
}

.rec-chords-label {
  display: block;
  color: var(--contrast-bottom);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.rec-chord-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.rec-chord-pill {
  background: rgba(99, 102, 241, 0.25);
  border: 1px solid rgba(99, 102, 241, 0.5);
  color: var(--contrast-top);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 1rem;
}

.practice-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.05rem;
  width: 100%;
  margin-bottom: 1rem;
}

.practice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.rec-footer {
  color: var(--contrast-bottom);
  font-size: 0.9rem;
  text-align: center;
  margin: 0;
}

.shared-songs-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.shared-song-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.shared-song-item:last-child {
  border-bottom: none;
}

.shared-song-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.shared-song-title {
  display: block;
  color: var(--contrast-top);
  font-weight: 500;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

.shared-by {
  color: var(--contrast-bottom);
  font-size: 0.85rem;
}

.song-status {
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.song-status.practicing {
  background: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
}

.song-status.mastered {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.song-status.need-help {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.status-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--contrast-mid);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.status-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.status-btn.active {
  background: var(--button);
  color: var(--btn-text);
  border-color: var(--accent);
}

.loading-small,
.empty-small {
  color: var(--contrast-bottom);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .session-container {
    padding: 1rem;
  }

  .header-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-info h1 {
    font-size: 2rem;
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

