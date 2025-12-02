<template>
  <Layout>
    <div class="discover-container">
      <header class="discover-header">
        <div>
          <p class="eyebrow">Explore</p>
          <h1>Discover</h1>
        </div>
      </header>

      <section class="discover-section chord-section" id="chord-explorer">
        <div class="section-heading">
          <div>
            <h2>Chord Explorer</h2>
          </div>
        </div>

        <form class="chord-search" @submit.prevent="handleChordSearch">
          <input
            v-model="chordQuery"
            type="text"
            placeholder="Search for a chord (e.g. Am7, Bsus4)"
            class="chord-input"
            :disabled="loadingVocabulary"
          />
          <button type="submit" class="chord-submit" :disabled="!canSearchChord">
            Search
          </button>
        </form>

        <div class="chord-status" v-if="loadingVocabulary">
          Loading chord catalog...
        </div>
        <div class="chord-status error" v-else-if="vocabularyError">
          {{ vocabularyError }}
        </div>

        <div v-if="!loadingVocabulary && !vocabularyError" class="chord-content">
          <div class="chord-meta" v-if="totalChordCount !== null || chordsWithDiagramCount">
            <span v-if="totalChordCount !== null">{{ totalChordCount }} total chords</span>
            <span>{{ chordsWithDiagramCount }} diagrams available</span>
          </div>

          <div class="chord-filters" v-if="chordRoots.length || chordSuffixes.length">
            <label v-if="chordRoots.length" class="filter-field">
              <span>Root</span>
              <select v-model="selectedRoot" class="filter-select">
                <option value="all">All roots</option>
                <option v-for="root in chordRoots" :key="`root-${root}`" :value="root">
                  {{ root }}
                </option>
              </select>
            </label>

            <label v-if="chordSuffixes.length" class="filter-field">
              <span>Suffix</span>
              <select v-model="selectedSuffix" class="filter-select">
                <option value="all">All suffixes</option>
                <option
                  v-for="suffix in chordSuffixes"
                  :key="`suffix-${suffix || 'none'}`"
                  :value="suffix"
                >
                  {{ formatSuffixLabel(suffix) }}
                </option>
              </select>
            </label>

            <label class="filter-checkbox">
              <input type="checkbox" v-model="showOnlyDiagramChords" />
              <span>Only chords with diagrams</span>
            </label>
          </div>

          <template v-if="chordSuggestions.length">
            <div class="chord-suggestions">
              <p class="suggestions-label">Suggestions</p>
              <div class="suggestion-grid">
                <button
                  v-for="suggestion in chordSuggestions"
                  :key="suggestion"
                  type="button"
                  class="suggestion-pill"
                  @click="selectChord(suggestion)"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </template>
          <template v-else>
            <p class="chord-status muted">
              No chords match your filters yet.
            </p>
          </template>

          <div class="chord-diagrams">
            <div v-if="isFetchingChordDiagram" class="chord-status">
              Fetching diagrams...
            </div>
            <div v-else-if="chordDiagramError" class="chord-status error">
              {{ chordDiagramError }}
            </div>
            <div v-else-if="selectedChord && chordDiagrams.length">
              <div class="diagram-header">
                <div>
                  <p class="eyebrow">Selected chord</p>
                  <h3>{{ selectedChord }}</h3>
                </div>
                <span class="diagram-count">{{ chordDiagrams.length }} {{ chordDiagrams.length === 1 ? 'voicing' : 'voicings' }}</span>
              </div>
              <div class="diagram-grid">
                <div v-for="(diagram, index) in chordDiagrams" :key="`${selectedChord}-${index}`" class="diagram-card">
                  <ChordDiagram :diagram="diagram" :width="150" />
                </div>
              </div>
            </div>
            <div v-else-if="selectedChord && !chordSupportsDiagram(selectedChord)">
              <p class="chord-status">
                We do not have a fingering diagram for {{ selectedChord }} yet. Try another chord.
              </p>
            </div>
            <div v-else class="chord-status muted">
              Pick a chord to preview its fingering chart.
            </div>
          </div>
        </div>
      </section>

      <section class="discover-section song-section" id="song-explorer">
        <div class="section-heading">
          <div>
            <h2>Song Explorer</h2>
          </div>
        </div>

        <div class="song-search">
          <input
            v-model="songQuery"
            type="text"
            placeholder="Search by title or artist"
            class="song-input"
          />
        </div>

        <div class="song-status" v-if="loadingSongs">
          Loading songs...
        </div>
        <div class="song-status error" v-else-if="songError">
          {{ songError }}
        </div>
        <div class="song-status" v-else-if="!filteredSongs.length">
          No songs match your search yet.
        </div>
        <div v-else class="song-results">
          <ul class="song-list">
            <li v-for="song in paginatedSongs" :key="song._id" class="song-card">
              <div class="song-card-body">
                <div>
                  <p class="song-artist">{{ song.artist }}</p>
                  <h3 class="song-title">{{ song.title }}</h3>
                  <p class="song-genre">{{ song.genre || 'Unknown genre' }}</p>
                </div>
                <div class="song-chords">
                  <span class="song-chords-label">Chords:</span>
                  <div class="song-chords-list">
                    <span v-for="(chord, idx) in song.chords" :key="song._id + chord + idx" class="song-chord-pill">
                      {{ chord }}
                    </span>
                    <span v-if="!song.chords?.length" class="song-chords-empty">Unavailable</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>

          <div v-if="totalSongPages > 1" class="song-pagination">
            <button type="button" class="song-pagination-btn" @click="goToPreviousSongPage" :disabled="!canGoToPreviousSongPage">
              Previous
            </button>
            <button
              v-for="page in totalSongPages"
              :key="`discover-song-page-${page}`"
              type="button"
              class="song-pagination-page"
              :class="{ 'song-pagination-page--active': page === currentSongPage }"
              @click="goToSongPage(page)"
              :aria-current="page === currentSongPage ? 'page' : undefined"
            >
              {{ page }}
            </button>
            <button type="button" class="song-pagination-btn" @click="goToNextSongPage" :disabled="!canGoToNextSongPage">
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import ChordDiagram from '@/components/ChordDiagram.vue'
import { getChordVocabulary, getChordDiagramByName } from '@/services/chordService'
import { getSongCatalog } from '@/services/songService'
import type { ChordDiagram as ChordDiagramType } from '@/types/recommendation'
import type { Song } from '@/types/song'

const chordQuery = ref('')
const chordVocabulary = ref<string[]>([])
const chordRoots = ref<string[]>([])
const chordSuffixes = ref<string[]>([])
const totalChordCount = ref<number | null>(null)
const chordsWithDiagrams = ref<Set<string>>(new Set())
const loadingVocabulary = ref(false)
const vocabularyError = ref<string | null>(null)
const selectedChord = ref('')
const chordDiagrams = ref<ChordDiagramType[]>([])
const chordDiagramError = ref<string | null>(null)
const isFetchingChordDiagram = ref(false)
const selectedRoot = ref('all')
const selectedSuffix = ref('all')
const showOnlyDiagramChords = ref(false)

const SONGS_PER_PAGE = 10
const allSongs = ref<Song[]>([])
const loadingSongs = ref(false)
const songError = ref<string | null>(null)
const songQuery = ref('')
const currentSongPage = ref(1)

const normalizedChordQuery = computed(() => chordQuery.value.trim().toLowerCase())
const canSearchChord = computed(() => Boolean(normalizedChordQuery.value))

const chordsWithDiagramCount = computed(() => chordsWithDiagrams.value.size)

const chordRootsForParsing = computed(() => [...chordRoots.value].sort((a, b) => b.length - a.length))

const chordNameMap = computed(() => {
  const map = new Map<string, string>()
  chordVocabulary.value.forEach(name => map.set(name.toLowerCase(), name))
  return map
})

const filteredChordVocabulary = computed(() => {
  let entries = chordVocabulary.value

  if (selectedRoot.value !== 'all' && chordRoots.value.length) {
    entries = entries.filter(chord => getChordParts(chord).root === selectedRoot.value)
  }

  if (selectedSuffix.value !== 'all' && chordSuffixes.value.length) {
    entries = entries.filter(chord => getChordParts(chord).suffix === selectedSuffix.value)
  }

  if (showOnlyDiagramChords.value) {
    entries = entries.filter(chord => chordsWithDiagrams.value.has(chord.toLowerCase()))
  }

  if (normalizedChordQuery.value) {
    const query = normalizedChordQuery.value
    entries = entries.filter(name => name.toLowerCase().includes(query))
  }

  return entries
})

const chordSuggestions = computed(() => filteredChordVocabulary.value.slice(0, 12))

const filteredSongs = computed(() => {
  if (!songQuery.value.trim()) {
    return allSongs.value
  }
  const query = songQuery.value.trim().toLowerCase()
  return allSongs.value.filter(song =>
    song.title?.toLowerCase().includes(query) || song.artist?.toLowerCase().includes(query),
  )
})

const totalSongPages = computed(() => Math.max(1, Math.ceil(filteredSongs.value.length / SONGS_PER_PAGE)))
const paginatedSongs = computed(() => {
  const start = (currentSongPage.value - 1) * SONGS_PER_PAGE
  return filteredSongs.value.slice(start, start + SONGS_PER_PAGE)
})
const canGoToPreviousSongPage = computed(() => currentSongPage.value > 1)
const canGoToNextSongPage = computed(() => currentSongPage.value < totalSongPages.value)

watch(songQuery, () => {
  currentSongPage.value = 1
})

watch(filteredSongs, songs => {
  const totalPages = Math.max(1, Math.ceil(songs.length / SONGS_PER_PAGE))
  if (currentSongPage.value > totalPages) {
    currentSongPage.value = totalPages
  }
  if (currentSongPage.value < 1) {
    currentSongPage.value = 1
  }
})

function chordSupportsDiagram(name: string) {
  const normalized = name?.trim().toLowerCase()
  if (!normalized) return false
  return chordsWithDiagrams.value.has(normalized)
}

function getChordParts(name: string) {
  const target = name ?? ''
  const root = chordRootsForParsing.value.find(entry => target.startsWith(entry)) ?? ''
  const suffix = root ? target.slice(root.length) : target
  return { root, suffix }
}

function formatSuffixLabel(value: string) {
  return value?.length ? value : 'No suffix'
}

function selectChord(name: string) {
  chordQuery.value = name
  handleChordSearch()
}

async function handleChordSearch() {
  if (!canSearchChord.value) {
    return
  }

  const name = chordQuery.value.trim()
  const normalizedName = name.toLowerCase()
  const canonicalName = chordNameMap.value.get(normalizedName)

  chordDiagramError.value = null
  chordDiagrams.value = []

  if (!canonicalName) {
    selectedChord.value = name
    chordDiagramError.value = 'That chord is not in the vocabulary yet.'
    return
  }

  selectedChord.value = canonicalName

  if (!chordSupportsDiagram(canonicalName)) {
    return
  }

  try {
    isFetchingChordDiagram.value = true
    const diagrams = await getChordDiagramByName(canonicalName)
    chordDiagrams.value = diagrams
    if (!diagrams.length) {
      chordDiagramError.value = 'Unable to load diagrams for this chord right now.'
    }
  } catch (error) {
    console.error('Failed to load chord diagram:', error)
    chordDiagramError.value = 'Something went wrong loading this diagram.'
  } finally {
    isFetchingChordDiagram.value = false
  }
}

async function loadChordVocabulary() {
  loadingVocabulary.value = true
  vocabularyError.value = null
  try {
    const vocab = await getChordVocabulary()
    chordVocabulary.value = vocab.chords
    chordRoots.value = vocab.roots
    chordSuffixes.value = vocab.suffixes
    totalChordCount.value = vocab.totalCount
    const withDiagrams = (vocab.chordsWithDiagrams ?? []).map(name => name.toLowerCase())
    chordsWithDiagrams.value = new Set(withDiagrams)
  } catch (error) {
    console.error('Failed to load chord vocabulary:', error)
    vocabularyError.value = 'Unable to load chords right now. Please try again later.'
  } finally {
    loadingVocabulary.value = false
  }
}

async function loadSongs() {
  loadingSongs.value = true
  songError.value = null
  try {
    const songs = await getSongCatalog()
    allSongs.value = songs
  } catch (error) {
    console.error('Failed to load songs:', error)
    songError.value = 'Unable to load songs right now.'
  } finally {
    loadingSongs.value = false
  }
}

function goToSongPage(page: number) {
  const safePage = Math.min(Math.max(1, Math.trunc(page)), totalSongPages.value)
  currentSongPage.value = safePage
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

onMounted(() => {
  loadChordVocabulary()
  loadSongs()
})
</script>

<style scoped>
.discover-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.discover-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
}


.eyebrow {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--contrast-bottom);
  margin-bottom: 0.35rem;
}

h1 {
  font-size: 2.75rem;
  margin: 0;
  color: var(--contrast-top);
}

.lead {
  color: var(--contrast-mid);
  max-width: 640px;
}

.discover-section {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.section-heading h2 {
  margin: 0;
  font-size: 1.65rem;
  color: var(--contrast-top);
}

.section-heading p {
  color: var(--contrast-mid);
  margin: 0.25rem 0 0;
}

.chord-search {
  display: flex;
  gap: 0.75rem;
}

.chord-input {
  flex: 1;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.65rem;
  color: #f9fafb;
}

.chord-submit {
  padding: 0.75rem 1.25rem;
  border-radius: 0.65rem;
  border: none;
  background: var(--button);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.chord-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chord-status {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  color: #e5e7eb;
}

.chord-status.error {
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.4);
}

.chord-status.muted {
  color: #9ca3af;
}

.chord-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.chord-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: var(--contrast-mid);
}

.chord-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: flex-end;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 160px;
  flex: 1 1 160px;
}

.filter-field span {
  font-size: 0.85rem;
  color: var(--contrast-mid);
}

.filter-select {
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #f3f4f6;
}

.filter-select option {
  color: #111;
  background: #fff;
}

.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: var(--contrast-mid);
}

.filter-checkbox input[type='checkbox'] {
  accent-color: var(--accent);
}

.chord-suggestions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.suggestions-label {
  font-size: 0.85rem;
  color: var(--contrast-mid);
}

.suggestion-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.suggestion-pill {
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 999px;
  padding: 0.35rem 0.9rem;
  background: rgba(255, 255, 255, 0.04);
  color: #f3f4f6;
  cursor: pointer;
}

.chord-diagrams {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.diagram-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.diagram-header h3 {
  margin: 0;
  font-size: 1.5rem;
}

.diagram-count {
  font-size: 0.85rem;
  color: var(--contrast-mid);
}

.diagram-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 1rem;
}

.diagram-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.75rem;
  padding: 1rem;
  text-align: center;
}

.song-section {
  gap: 1rem;
}

.song-search {
  display: flex;
}

.song-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.65rem;
  color: #f9fafb;
}

.song-status {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 0.75rem;
  color: #e5e7eb;
}

.song-status.error {
  color: #fecaca;
  border: 1px solid rgba(248, 113, 113, 0.4);
}

.song-results {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.song-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.song-card {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0.9rem;
  padding: 1.25rem;
}

.song-card-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-artist {
  color: var(--contrast-mid);
  margin: 0;
}

.song-title {
  margin: 0;
  font-size: 1.35rem;
  color: #f9fafb;
}

.song-genre {
  margin: 0;
  color: var(--contrast-bottom);
}

.song-chords {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.song-chords-label {
  font-size: 0.85rem;
  color: var(--contrast-mid);
}

.song-chords-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.song-chord-pill {
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.65rem;
  padding: 0.2rem 0.6rem;
  font-size: 0.8rem;
  color: #f3f4f6;
}

.song-chords-empty {
  color: #9ca3af;
}

.song-pagination {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.song-pagination-btn,
.song-pagination-page {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.05);
  color: #f3f4f6;
  cursor: pointer;
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

@media (max-width: 768px) {
  .chord-search {
    flex-direction: column;
  }

  .discover-section {
    padding: 1.25rem;
  }

  .chord-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
