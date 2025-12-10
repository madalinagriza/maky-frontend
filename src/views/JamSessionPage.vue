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
              <div class="recommendation-nav" v-if="playableSongs.length > 1">
                <button
                  v-if="currentRecommendationIndex > 0"
                  @click="previousRecommendation()"
                  class="next-btn"
                >
                  ← Previous
                </button>
                <button
                  @click="nextRecommendation()"
                  class="next-btn"
                >
                  Next →
                </button>
              </div>
            </div>

            <div v-if="loadingPlayableSongs" class="loading-small">Loading recommendations...</div>
            <div v-else-if="playableSongs.length === 0" class="empty-small">
              No song recommendations available. Learn more chords as a group!
            </div>
            <div
              v-else-if="currentRecommendation"
              class="recommendation-card"
              ref="recommendationCardRef"
            >
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
            <h2>Songs Log</h2>
            <div v-if="session.songsLog.length === 0" class="empty-small">
              No songs logged yet. Practice a song to get started!
            </div>
            <ul v-else class="shared-songs-list">
              <li
                v-for="(logEntry, index) in session.songsLog"
                :key="`${logEntry.song}-${logEntry.participant}-${index}`"
                class="shared-song-item"
              >
                <div class="shared-song-info">
                  <div>
                    <span class="shared-song-title">{{ getSongTitle(logEntry.song) }}</span>
                  </div>
                  <div class="frequency-chip">
                    <span class="frequency-label">Frequency</span>
                    <span class="frequency-value">{{ logEntry.frequency }}</span>
                    <span class="frequency-unit">times</span>
                  </div>
                </div>
                <div
                  v-if="session.status === 'ACTIVE' && isOwnLogEntry(logEntry)"
                  class="frequency-controls"
                >
                  <button
                    class="frequency-btn"
                    @click="changeFrequency(logEntry.song, logEntry.frequency - 1)"
                    :disabled="logEntry.frequency <= 0 || updatingFrequencyFor === logEntry.song"
                    aria-label="Decrease frequency"
                  >
                    -
                  </button>
                  <span class="frequency-readout">{{ logEntry.frequency }} times</span>
                  <button
                    class="frequency-btn"
                    @click="changeFrequency(logEntry.song, logEntry.frequency + 1)"
                    :disabled="updatingFrequencyFor === logEntry.song"
                    aria-label="Increase frequency"
                  >
                    +
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
import { ref, onMounted, computed, nextTick } from 'vue'
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
  updateSongLogFrequency,
} from '@/services/jamSessionService'
import type { JamSession, SongLogEntry } from '@/types/jamSession'
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
const recommendationCardRef = ref<HTMLElement | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)
const loadingCommonChords = ref(false)
const loadingPlayableSongs = ref(false)
const endingSession = ref(false)
const sharingSong = ref(false)
const updatingFrequencyFor = ref<string | null>(null)

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

function isOwnLogEntry(entry: SongLogEntry) {
  const identifiers = [currentUsername.value, currentUserId.value].filter(Boolean)
  return identifiers.includes(entry.participant)
}

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

function scrollRecommendationIntoView() {
  nextTick(() => {
    recommendationCardRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  })
}

function nextRecommendation(scrollAfterAdvance = false) {
  if (!playableSongs.value.length) return
  currentRecommendationIndex.value =
    (currentRecommendationIndex.value + 1) % playableSongs.value.length
  if (scrollAfterAdvance) {
    scrollRecommendationIntoView()
  }
}

function previousRecommendation() {
  if (!playableSongs.value.length) return
  currentRecommendationIndex.value = Math.max(0, currentRecommendationIndex.value - 1)
}

async function practiceThisSong() {
  if (!currentRecommendation.value || sharingSong.value) return
  sharingSong.value = true
  try {
    await shareSongInSession(sessionId.value, currentRecommendation.value._id, 1)
    await loadSession()
    if (playableSongs.value.length > 1) {
      nextRecommendation(true)
    } else {
      scrollRecommendationIntoView()
    }
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to share song')
  } finally {
    sharingSong.value = false
  }
}

async function changeFrequency(songId: string, nextFrequency: number) {
  if (nextFrequency < 0) return
  updatingFrequencyFor.value = songId
  try {
    await updateSongLogFrequency(sessionId.value, songId, nextFrequency)
    await loadSession()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to update frequency')
  } finally {
    updatingFrequencyFor.value = null
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
  font-size: var(--font-size-md);
}

.error-message {
  color: #fca5a5;
  background: var(--error-bg-light);
  border-radius: 0.5rem;
  border: 1px solid var(--error-border-light);
}

.session-header {
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--contrast-mid);
  font-size: var(--font-size-base);
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
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  margin: 0 1rem 0 0;
  background: linear-gradient(120deg, var(--contrast-top), var(--contrast-mid));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.status-badge {
  padding: 0.4rem 0.9rem;
  border-radius: 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
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
  color: var(--text-secondary);
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
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
}

.end-session-btn {
  background: var(--error-bg);
  border: 1px solid var(--error-border);
  color: #fca5a5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
}

.end-session-btn:hover:not(:disabled) {
  background: var(--error-bg);
}

.session-layout {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.common-chords-section,
.recommendations-section,
.shared-songs-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

h2 {
  font-size: var(--font-size-xl);
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

.recommendation-nav {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.next-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
}

.next-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
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
  background: var(--button-bg-medium);
  border: 1px solid var(--button);
  color: var(--contrast-top);
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

.recommendation-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
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
  font-size: var(--font-size-xl);
  color: var(--contrast-top);
  margin: 0 0 0.25rem 0;
}

.rec-artist {
  color: var(--contrast-mid);
  margin: 0;
  font-size: var(--font-size-md);
}

.genre-tag {
  background: linear-gradient(120deg, var(--button-bg-medium), var(--button-bg-light));
  border: 1px solid var(--button);
  color: var(--contrast-top);
  padding: 0.4rem 0.9rem;
  border-radius: 0.75rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  white-space: nowrap;
}

.rec-chords {
  margin-bottom: 1.5rem;
}

.rec-chords-label {
  display: block;
  color: var(--contrast-bottom);
  font-size: var(--font-size-sm);
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
  background: var(--button-bg-medium);
  border: 1px solid var(--button);
  color: var(--contrast-top);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
}

.practice-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.9rem 1.8rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-md);
  width: 100%;
  margin-bottom: 1rem;
}

.practice-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.rec-footer {
  color: var(--contrast-bottom);
  font-size: var(--font-size-sm);
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
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  margin-bottom: 0.25rem;
}

.shared-by {
  color: var(--contrast-bottom);
  font-size: var(--font-size-sm);
}

<<<<<<< HEAD
.song-status {
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
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
  background: var(--error-bg);
  color: #fca5a5;
}

.status-buttons {
||||||| 29b6909
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
}

.status-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.frequency-chip {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  min-width: 110px;
}

.frequency-label {
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}

.frequency-value {
  font-size: 1.4rem;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  line-height: 1.2;
}

.frequency-unit {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.frequency-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.frequency-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.frequency-btn:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--border);
}

.frequency-readout {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.loading-small,
.empty-small {
  color: var(--contrast-bottom);
  font-size: var(--font-size-sm);
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
    font-size: var(--font-size-2xl);
  }

  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

