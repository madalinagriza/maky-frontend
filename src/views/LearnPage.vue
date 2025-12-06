<template>
  <Layout>
    <div class="learn-container">
      <h1>Learn</h1>

      <nav class="section-nav">
        <a href="#section-learn-chord">Learn a New Chord</a>
        <a href="#section-master-chords">Master Your Chords</a>
        <a href="#section-practice-songs">Practice Your Songs</a>
        <a href="#section-learn-song">Learn a New Song</a>
      </nav>

      <div class="sections">
        <section id="section-learn-chord" class="learn-section">
          <h2>Learn a New Chord</h2>
          <div v-if="loadingChordRec" class="loading">Loading recommendation...</div>
          <div v-else-if="recommendedChord" class="chord-recommendation">
            <div class="chord-card">
              <h3>{{ recommendedChord }}</h3>
              <ChordDiagram
                v-if="recommendedChordDiagram"
                :diagram="recommendedChordDiagram"
                :width="140"
                class="chord-diagram-display"
              />
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

        <section id="section-master-chords" class="learn-section">
          <h2>Master Your Chords</h2>
          <div v-if="loadingKnownChords" class="loading">Loading...</div>
          <div v-else-if="knownChords.length === 0" class="empty-state">
            You haven't added any chords yet.
          </div>
          <div v-else class="chord-list">
            <div v-for="entry in knownChords" :key="entry.chord" class="chord-item">
              <div class="chord-info">
                <span class="chord-name">{{ entry.chord }}</span>
                <select
                  v-model="chordMasterySelections[entry.chord]"
                  class="mastery-select"
                >
                  <option value="in progress">In Progress</option>
                  <option value="mastered">Mastered</option>
                </select>
                <button
                  class="learn-btn"
                  @click="updateKnownChordMastery(entry.chord)"
                  :disabled="!canUpdateChordMastery(entry.chord, entry.mastery)"
                >
                  {{
                    updatingChordMastery === entry.chord
                      ? 'Updating...'
                      : 'Update'
                  }}
                </button>
              </div>
              <button
                class="remove-btn"
                @click="removeKnownChord(entry.chord)"
              >
                Remove
              </button>
            </div>
          </div>
        </section>

        <section id="section-practice-songs" class="learn-section">
          <h2>Practice Your Songs</h2>
          <div v-if="loadingPracticeSongs" class="loading">Loading...</div>
          <div v-else-if="practiceSongs.length === 0" class="empty-state">
            You haven't started learning any songs yet.
          </div>
          <ul v-else class="song-list">
            <li
              v-for="entry in practiceSongs"
              :key="entry.song._id"
              class="song-item"
            >
              <div class="song-info">
                <span class="song-title">{{ entry.song.title }}</span>
                <span class="song-artist">{{ entry.song.artist }}</span>
                <span class="song-genre-pill">{{ entry.song.genre || 'Unknown genre' }}</span>
                <div class="song-chords">
                  <span class="song-chords-label">Chords:</span>
                  <div class="song-chords-list">
                    <template v-if="entry.song.chords?.length">
                      <span
                        v-for="chord in entry.song.chords"
                        :key="chord"
                        :class="['song-chord-pill', getChordMasteryClass(chord)]"
                      >
                        {{ chord }}
                      </span>
                    </template>
                    <span v-else class="song-chords-unavailable">Unavailable</span>
                  </div>
                </div>
              </div>
              <div class="practice-actions">
                <select
                  v-model="songMasterySelections[entry.song._id]"
                  class="mastery-select"
                >
                  <option value="in progress">In Progress</option>
                  <option value="mastered">Mastered</option>
                </select>
                <button
                  class="learn-btn"
                  @click="updatePracticeSongMastery(entry.song._id)"
                  :disabled="!canUpdateSong(entry.song._id, entry.mastery)"
                >
                  {{
                    updatingSongMastery === entry.song._id
                      ? 'Updating...'
                      : 'Update'
                  }}
                </button>
              </div>
            </li>
          </ul>
        </section>

        <section id="section-learn-song" class="learn-section">
          <h2>Learn a New Song</h2>
          <div class="search-section">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search songs or artists..."
              class="search-input"
            />
          </div>
          <div class="filter-section">
            <span class="filter-label">Show only:</span>
            <label class="filter-option">
              <input type="checkbox" v-model="showOnlyMasteredSongs" />
              <span>All chords mastered</span>
            </label>
            <label
              class="filter-option"
              :class="{ disabled: preferredGenres.length === 0 }"
            >
              <input
                type="checkbox"
                v-model="showOnlyPreferredGenres"
                :disabled="preferredGenres.length === 0"
              />
              <span>
                Preferred genres
                <small v-if="preferredGenres.length === 0">Set genres in Profile</small>
              </span>
            </label>
          </div>
          <div v-if="loadingSongs" class="loading">Loading...</div>
          <div v-else-if="playableSongs.length === 0" class="empty-state">
            No playable songs yet. Learn some chords to unlock songs!
          </div>
          <div v-else-if="filteredPlayableSongs.length === 0" class="empty-state">
            No songs match your filters yet.
          </div>
          <div v-else class="song-list-wrapper">
            <ul class="song-list">
              <li v-for="song in paginatedPlayableSongs" :key="song._id" class="song-item">
                <div class="song-info">
                  <span class="song-title">{{ song.title }}</span>
                  <span class="song-artist">{{ song.artist }}</span>
                  <span class="song-genre-pill">{{ song.genre || 'Unknown genre' }}</span>
                  <div class="song-chords">
                    <span class="song-chords-label">Chords:</span>
                    <div class="song-chords-list">
                      <template v-if="song.chords?.length">
                        <span
                          v-for="chord in song.chords"
                          :key="song._id + chord"
                          :class="['song-chord-pill', getChordMasteryClass(chord)]"
                        >
                          {{ chord }}
                        </span>
                      </template>
                      <span v-else class="song-chords-unavailable">Unavailable</span>
                    </div>
                  </div>
                </div>
                <button @click="startLearningSong(song._id)" class="learn-btn">Start Learning</button>
              </li>
            </ul>
            <div v-if="totalSongPages > 1" class="song-pagination">
              <button
                class="song-pagination-btn"
                type="button"
                @click="goToPreviousSongPage"
                :disabled="!canGoToPreviousSongPage"
              >
                Previous
              </button>
              <button
                v-for="page in totalSongPages"
                :key="`song-page-${page}`"
                type="button"
                class="song-pagination-page"
                :class="{ 'song-pagination-page--active': page === currentSongPage }"
                @click="goToSongPage(page)"
                :aria-current="page === currentSongPage ? 'page' : undefined"
              >
                {{ page }}
              </button>
              <button
                class="song-pagination-btn"
                type="button"
                @click="goToNextSongPage"
                :disabled="!canGoToNextSongPage"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import ChordDiagram from '@/components/ChordDiagram.vue'
import { getPlayableSongs, getSongCatalog } from '@/services/songService'
import {
  getSongsInProgress,
  startLearningSong as startLearningSongAPI,
  updateSongMastery as updateSongMasteryAPI,
} from '@/services/songLibraryService'
import { requestChordRecommendation, requestSongUnlockRecommendation } from '@/services/recommendationService'
import {
  addChordToInventory,
  getKnownChords,
  updateChordMastery as updateChordMasteryAPI,
  removeChordFromInventory,
} from '@/services/chordLibraryService'
import { resolveChordName } from '@/services/chordService'
import { getSessionId, getUserId } from '@/utils/sessionStorage'
import { getProfile } from '@/services/userProfileService'
import type { Song } from '@/types/song'
import type { SongProgress } from '@/types/songLibrary'
import type { KnownChord } from '@/types/chordLibrary'
import type { ChordDiagram as ChordDiagramType } from '@/types/recommendation'

const searchQuery = ref('')
const playableSongs = ref<Song[]>([])
const recommendedChord = ref<string | null>(null)
const recommendedChordDiagram = ref<ChordDiagramType | null>(null)
const unlockedSongs = ref<string[]>([])
const loadingSongs = ref(false)
const loadingChordRec = ref(false)
const practiceSongs = ref<SongProgress[]>([])
const loadingPracticeSongs = ref(false)
const songMasterySelections = ref<Record<string, SongMasteryLevel>>({})
const updatingSongMastery = ref<string | null>(null)
const knownChords = ref<KnownChord[]>([])
const loadingKnownChords = ref(false)
const chordMasterySelections = ref<Record<string, ChordMasteryLevel>>({})
const updatingChordMastery = ref<string | null>(null)
const preferredGenres = ref<string[]>([])
const showOnlyMasteredSongs = ref(false)
const showOnlyPreferredGenres = ref(false)
const SONGS_PER_PAGE = 10
const currentSongPage = ref(1)
const chordMasteryLookup = computed<Record<string, ChordMasteryLevel>>(() => {
  const lookup: Record<string, ChordMasteryLevel> = {}
  knownChords.value.forEach(entry => {
    const key = entry?.chord?.trim().toLowerCase()
    if (!key) return
    const pending = chordMasterySelections.value[entry.chord]
    lookup[key] = normalizeChordMastery(pending ?? entry.mastery)
  })
  return lookup
})

const preferredGenreSet = computed(() =>
  new Set(preferredGenres.value.map(genre => genre.trim().toLowerCase()).filter(Boolean))
)

watch(preferredGenres, genres => {
  if (!genres.length) {
    showOnlyPreferredGenres.value = false
  }
})


type SongMasteryLevel = 'in progress' | 'mastered'
const allowedSongMasteries: SongMasteryLevel[] = ['in progress', 'mastered']
const fallbackSongMastery: SongMasteryLevel = 'in progress'
type ChordMasteryLevel = 'in progress' | 'mastered'
const allowedChordMasteries: ChordMasteryLevel[] = ['in progress', 'mastered']
const fallbackChordMastery: ChordMasteryLevel = 'in progress'

const isNonEmptyString = (value: string | null | undefined): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isValidSong = (song: Song | undefined | null): song is Song =>
  Boolean(song && song._id && Array.isArray(song.chords))

const isValidSongProgress = (entry: SongProgress | undefined | null): entry is SongProgress =>
  Boolean(entry && entry.song && isValidSong(entry.song))

const practiceSongIds = computed(() =>
  new Set(
    practiceSongs.value
      .map(entry => entry.song?._id)
      .filter((id): id is string => Boolean(id))
  )
)

const availablePlayableSongs = computed(() =>
  playableSongs.value.filter(song => !practiceSongIds.value.has(song._id))
)

const filteredPlayableSongs = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  let songs = availablePlayableSongs.value

  if (showOnlyMasteredSongs.value) {
    songs = songs.filter(areAllChordsMastered)
  }

  if (showOnlyPreferredGenres.value) {
    songs = songs.filter(matchesPreferredGenre)
  }

  if (!query) {
    return songs
  }

  return songs.filter(song =>
    (song.title?.toLowerCase() ?? '').includes(query) ||
    (song.artist?.toLowerCase() ?? '').includes(query)
  )
})

const totalSongPages = computed(() => {
  const total = Math.ceil(filteredPlayableSongs.value.length / SONGS_PER_PAGE)
  return Math.max(total, 1)
})

const paginatedPlayableSongs = computed(() => {
  const start = (currentSongPage.value - 1) * SONGS_PER_PAGE
  return filteredPlayableSongs.value.slice(start, start + SONGS_PER_PAGE)
})

const canGoToPreviousSongPage = computed(() => currentSongPage.value > 1)
const canGoToNextSongPage = computed(() => currentSongPage.value < totalSongPages.value)

watch([searchQuery, showOnlyMasteredSongs, showOnlyPreferredGenres], () => {
  currentSongPage.value = 1
})

watch(filteredPlayableSongs, songs => {
  const totalPages = Math.max(1, Math.ceil(songs.length / SONGS_PER_PAGE))
  if (currentSongPage.value > totalPages) {
    currentSongPage.value = totalPages
  }
  if (currentSongPage.value < 1) {
    currentSongPage.value = 1
  }
})

function normalizeSongMastery(value: string | undefined | null): SongMasteryLevel {
  return allowedSongMasteries.includes(value as SongMasteryLevel)
    ? (value as SongMasteryLevel)
    : fallbackSongMastery
}

function syncSongMasterySelections(entries: SongProgress[]) {
  const nextSelections: Record<string, SongMasteryLevel> = {}
  entries.forEach(entry => {
    if (!entry?.song?._id) return
    nextSelections[entry.song._id] = normalizeSongMastery(entry.mastery)
  })
  songMasterySelections.value = nextSelections
}

function canUpdateSong(songId: string, currentMastery: string) {
  const pending = songMasterySelections.value[songId]
  return (
    Boolean(pending) &&
    pending !== normalizeSongMastery(currentMastery) &&
    updatingSongMastery.value !== songId
  )
}

function normalizeChordMastery(value: string | undefined | null): ChordMasteryLevel {
  return allowedChordMasteries.includes(value as ChordMasteryLevel)
    ? (value as ChordMasteryLevel)
    : fallbackChordMastery
}

function syncChordMasterySelections(entries: KnownChord[]) {
  const nextSelections: Record<string, ChordMasteryLevel> = {}
  entries.forEach(entry => {
    if (!entry?.chord) return
    nextSelections[entry.chord] = normalizeChordMastery(entry.mastery)
  })
  chordMasterySelections.value = nextSelections
}

function canUpdateChordMastery(chordName: string, currentMastery: string) {
  const pending = chordMasterySelections.value[chordName]
  return (
    Boolean(pending) &&
    pending !== normalizeChordMastery(currentMastery) &&
    updatingChordMastery.value !== chordName
  )
}

function getChordMasteryClass(chordName?: string | null) {
  const key = chordName?.trim().toLowerCase()
  if (!key) return 'song-chord-pill--unknown'

  const mastery = chordMasteryLookup.value[key]
  if (mastery === 'mastered') return 'song-chord-pill--mastered'
  if (mastery === 'in progress') return 'song-chord-pill--in-progress'
  return 'song-chord-pill--unknown'
}

function areAllChordsMastered(song: Song) {
  if (!song?.chords?.length) return false
  return song.chords.every(chord => {
    const key = chord?.trim().toLowerCase()
    if (!key) return false
    return chordMasteryLookup.value[key] === 'mastered'
  })
}

function extractSongGenres(song: Song) {
  const genres: string[] = []
  const pushTokens = (value?: string | null) => {
    if (!value) return
    value
      .split(/[,&/|]/)
      .map(token => token.trim().toLowerCase())
      .filter(Boolean)
      .forEach(token => genres.push(token))
  }

  pushTokens(song?.genre)
  if (Array.isArray(song?.tags)) {
    song.tags.forEach(pushTokens)
  }

  return genres
}

function matchesPreferredGenre(song: Song) {
  if (!showOnlyPreferredGenres.value) return true
  if (preferredGenreSet.value.size === 0) return false

  const songGenres = extractSongGenres(song)
  if (songGenres.length === 0) return false

  return songGenres.some(genre => preferredGenreSet.value.has(genre))
}

function goToSongPage(page: number) {
  const totalPages = totalSongPages.value
  if (!Number.isFinite(page)) return
  const clamped = Math.min(Math.max(1, Math.trunc(page)), totalPages)
  currentSongPage.value = clamped
}

function goToPreviousSongPage() {
  if (canGoToPreviousSongPage.value) {
    currentSongPage.value -= 1
  }
}

function goToNextSongPage() {
  if (canGoToNextSongPage.value) {
    currentSongPage.value += 1
  }
}

async function loadPracticeSongs(sessionId: string) {
  loadingPracticeSongs.value = true
  try {
    const response = await getSongsInProgress(sessionId)
    const validEntries = Array.isArray(response)
      ? response.filter(isValidSongProgress)
      : []
    practiceSongs.value = validEntries
    syncSongMasterySelections(validEntries)
  } catch (error) {
    console.error('Failed to load practice songs:', error)
    practiceSongs.value = []
    songMasterySelections.value = {}
  } finally {
    loadingPracticeSongs.value = false
  }
}

async function loadPreferredGenres(sessionId: string) {
  try {
    const userId = getUserId()
    const profile = userId ? await getProfile({ user: userId }) : await getProfile({ sessionId })
    const genres = Array.isArray(profile?.genrePreferences) ? profile?.genrePreferences : []
    preferredGenres.value = (genres ?? []).filter(isNonEmptyString)
  } catch (error) {
    console.error('Failed to load preferred genres:', error)
    preferredGenres.value = []
  }
}

async function loadKnownChords(sessionId: string) {
  loadingKnownChords.value = true
  try {
    const response = await getKnownChords(sessionId)
    const entries = Array.isArray(response)
      ? response.filter((entry): entry is KnownChord => Boolean(entry && entry.chord))
      : []
    knownChords.value = entries
    syncChordMasterySelections(entries)
    return entries.map(entry => entry.chord).filter(isNonEmptyString)
  } catch (error) {
    console.error('Failed to load known chords:', error)
    knownChords.value = []
    chordMasterySelections.value = {}
    return [] as string[]
  } finally {
    loadingKnownChords.value = false
  }
}

async function loadData() {
  loadingSongs.value = true
  loadingChordRec.value = true
  recommendedChord.value = null
  recommendedChordDiagram.value = null
  unlockedSongs.value = []
  
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await loadPreferredGenres(sessionId)
    const knownChordNames = await loadKnownChords(sessionId)
    await loadPracticeSongs(sessionId)

    // 1. Get Playable Songs
    const playableResponse = await getPlayableSongs({ knownChords: knownChordNames })
    playableSongs.value = playableResponse
      .map(r => r.song)
      .filter(isValidSong)

    // 2. Build a broader song catalog for recommendations (fallback to playable songs)
    const catalogSongs = await getSongCatalog()
    const recommendationSource = catalogSongs.length > 0 ? catalogSongs : playableSongs.value

    if (recommendationSource.length === 0) {
      recommendedChord.value = null
      unlockedSongs.value = []
      return
    }

    await populateChordRecommendation({ knownChords: knownChordNames, allSongs: recommendationSource })

  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    loadingSongs.value = false
    loadingChordRec.value = false
  }
}

async function populateChordRecommendation({
  knownChords,
  allSongs,
}: {
  knownChords: string[]
  allSongs: Song[]
}) {
  try {
    const recResponse = await requestChordRecommendation({
      knownChords,
      allSongs,
    })
    const chordCandidate = recResponse.recommendedChord?.trim()
    recommendedChord.value = chordCandidate || null
    // Store the first diagram voicing if available
    recommendedChordDiagram.value = recResponse.diagram?.[0] ?? null
  } catch (error) {
    console.error('Failed to fetch chord recommendation:', error)
    recommendedChord.value = null
    recommendedChordDiagram.value = null
  }

  if (!recommendedChord.value) {
    unlockedSongs.value = []
    return
  }

  try {
    const unlockResponse = await requestSongUnlockRecommendation({
      knownChords,
      potentialChord: recommendedChord.value,
      allSongs,
    })
    unlockedSongs.value = Array.isArray(unlockResponse.unlockedSongs)
      ? unlockResponse.unlockedSongs
      : []
  } catch (error) {
    console.error('Failed to fetch unlock recommendations:', error)
    unlockedSongs.value = []
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

    const canonicalChordName = await resolveChordName(chord)
    if (!canonicalChordName) {
      alert('Unable to find that chord right now. Please try a different name.')
      return
    }

    await addChordToInventory({
      sessionId,
      chord: canonicalChordName,
      mastery: 'in progress',
    })
    // Reload data
    await loadData()
  } catch (error) {
    console.error('Failed to add chord:', error)
  }
}

async function updatePracticeSongMastery(songId: string) {
  const selectedMastery = songMasterySelections.value[songId]
  const current = practiceSongs.value.find(entry => entry.song._id === songId)
  if (!selectedMastery || !current || selectedMastery === normalizeSongMastery(current.mastery)) {
    return
  }

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    updatingSongMastery.value = songId

    await updateSongMasteryAPI({
      sessionId,
      song: songId,
      newMastery: selectedMastery,
    })

    await loadPracticeSongs(sessionId)
  } catch (error) {
    console.error('Failed to update song mastery:', error)
  } finally {
    if (updatingSongMastery.value === songId) {
      updatingSongMastery.value = null
    }
  }
}

async function updateKnownChordMastery(chord: string) {
  const selectedMastery = chordMasterySelections.value[chord]
  const current = knownChords.value.find(entry => entry.chord === chord)
  if (!selectedMastery || !current || selectedMastery === normalizeChordMastery(current.mastery)) {
    return
  }

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    updatingChordMastery.value = chord

    await updateChordMasteryAPI({
      sessionId,
      chord,
      newMastery: selectedMastery,
    })

    await loadKnownChords(sessionId)
  } catch (error) {
    console.error('Failed to update chord mastery:', error)
  } finally {
    if (updatingChordMastery.value === chord) {
      updatingChordMastery.value = null
    }
  }
}

async function removeKnownChord(chord: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await removeChordFromInventory({ sessionId, chord })
    await loadKnownChords(sessionId)
  } catch (error) {
    console.error('Failed to remove chord:', error)
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

:global(html) {
  scroll-behavior: smooth;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  color: var(--contrast-mid);
}

.section-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.section-nav a {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e0e7ff;
  font-size: 0.95rem;
  text-decoration: none;
  background: var(--accent);
  transition: background 0.2s ease, color 0.2s ease;
}

.section-nav a:hover {
  background: var(--button);
  color: #fff;
}

.search-section {
  margin-bottom: 1rem;
}

.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.25rem;
  font-size: 0.9rem;
  color: #cbd5f5;
}

.filter-label {
  font-weight: 600;
  color: var(--contrast-mid);
}

.filter-option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: var(--button);
}

.filter-option input[type='checkbox'] {
  accent-color: var(--accent);
}

.filter-option span {
  color: var(--accent);
}

.filter-option small {
  display: block;
  font-size: 0.7rem;
  color: var(--accent);
}

.filter-option.disabled {
  opacity: 0.6;
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

.song-list-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

.song-genre-pill {
  font-size: 0.8rem;
  color: var(--contrast-mid);
  text-transform: capitalize;
  margin-top: 0.35rem;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(255, 255, 255, 0.05);
  align-self: flex-start;
}

.song-chords {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
  font-size: 0.8rem;
  color: #d1d5db;
}

.song-chords-label {
  color: var(--contrast-mid);
  font-weight: 600;
}

.song-chords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  align-items: center;
  color: #e5e7eb;
}

.song-chord-pill {
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
  font-size: 0.8rem;
}

.song-chord-pill--mastered {
  background: var(--button);
  border-color: var(--accent);
  color: var(--btn-text);

}

.song-chord-pill--in-progress {
  background: var(--contrast-bottom);
  border-color: var(--contrast-top);
  color: var(--main);
}

.song-chord-pill--unknown {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
  color: #d1d5db;
}

.song-chords-unavailable {
  color: #9ca3af;
}

.song-pagination {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

.song-pagination-btn,
.song-pagination-page {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #f3f4f6;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.song-pagination-page--active {
  background: var(--button);
  border-color: var(--accent);
  color: #fff;
}

.song-pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.chord-diagram-display {
  margin: 0 auto 1rem;
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

.practice-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mastery-select {
  padding: 0.5rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
  font-size: 0.9rem;
}

.chord-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.chord-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.chord-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.chord-name {
  font-weight: 600;
  color: #e5e7eb;
  min-width: 60px;
}

.remove-btn {
  padding: 0.5rem 1rem;
  background: rgba(248, 113, 113, 0.2);
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.3);
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
}
</style>

