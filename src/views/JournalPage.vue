<template>
  <Layout>
    <div class="journal-container">
      <h1>My Journal</h1>

      <div class="journal-layout">
        <!-- Middle Column: Posts -->
        <main class="posts-column">
          <!-- Create Post Section -->
          <div class="create-post-card">
            <h2>Create Post</h2>
            <form @submit.prevent="handleCreatePost">
              <textarea 
                v-model="newPostContent" 
                placeholder="What's on your mind?" 
                required
                class="post-input"
              ></textarea>
              
              <div class="post-options">
                <div class="items-input-group item-search-group">
                  <div class="item-search-toggle" role="tablist" aria-label="Search items by type">
                    <button
                      type="button"
                      class="item-search-tab"
                      :class="{ active: itemSearchType === 'SONG' }"
                      @click="setItemSearchType('SONG')"
                    >
                      Songs
                    </button>
                    <button
                      type="button"
                      class="item-search-tab"
                      :class="{ active: itemSearchType === 'CHORD' }"
                      @click="setItemSearchType('CHORD')"
                    >
                      Chords
                    </button>
                  </div>
                  <div class="item-search-input-wrapper">
                    <input 
                      v-model="itemSearchQuery"
                      @input="handleItemSearchInput"
                      :placeholder="itemSearchType === 'SONG' ? 'Search songs by title or artist' : 'Search chords by name'"
                      class="item-input"
                      type="text"
                      autocomplete="off"
                    />
                    <div v-if="showItemSearchDropdown" class="search-dropdown">
                      <div v-if="isSearchingItems" class="dropdown-item muted">Searching...</div>
                      <div
                        v-else-if="!itemSearchResults.length"
                        class="dropdown-item muted"
                      >
                        No matches yet
                      </div>
                      <button
                        v-else
                        v-for="option in itemSearchResults"
                        :key="option.id"
                        type="button"
                        class="dropdown-item"
                        @click="selectItem(option)"
                      >
                        <span class="item-line-primary">{{ option.label }}</span>
                        <span class="item-line-secondary">{{ option.detail }}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div class="post-type-select">
                  <label>Type:</label>
                  <select v-model="newPostType">
                    <option value="PROGRESS">Progress</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div v-if="newPostItems.length > 0" class="new-items-list">
                <span v-for="(item, index) in newPostItems" :key="index" class="item-badge">
                  {{ item }}
                  <button type="button" @click="removeItem(index)" class="remove-item-btn">&times;</button>
                </span>
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isPosting" class="submit-btn">
                  {{ isPosting ? 'Posting...' : 'Post' }}
                </button>
              </div>
              <div v-if="createPostError" class="error-message">{{ createPostError }}</div>
            </form>
          </div>

          <h2>My Posts</h2>
          <div v-if="visibilityError" class="error-message">{{ visibilityError }}</div>
          <div v-if="loadingPosts" class="loading">Loading posts...</div>
          <div v-else-if="posts.length === 0" class="empty-state">You haven't posted anything yet.</div>
          <div v-else class="posts-list">
            <div v-for="post in posts" :key="post._id" class="post-card">
              <div class="post-header">
                <span class="post-type">{{ post.postType }}</span>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div v-if="post.items && post.items.length > 0" class="post-items">
                <div class="items-label">Linked items:</div>
                <div class="items-list">
                  <span v-for="item in post.items" :key="item" class="item-badge">
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="visibility-controls">
                <span class="visibility-label">
                  Visibility: {{ (post.visibility || 'PRIVATE').toLowerCase() === 'public' ? 'Public' : 'Private' }}
                </span>
                <button
                  v-if="canMakePostsPublic && (post.visibility || 'PRIVATE') === 'PRIVATE'"
                  class="visibility-btn"
                  :disabled="changingVisibilityFor === post._id"
                  @click="handleVisibilityChange(post, 'PUBLIC')"
                >
                  {{ changingVisibilityFor === post._id ? 'Updating…' : 'Make Public' }}
                </button>
              </div>
            </div>
          </div>
        </main>

        <!-- Sidebar: Songs and Chords -->
        <aside class="sidebar">
          <section class="sidebar-section">
            <h2>Songs You Know</h2>
            <div v-if="loadingSongs" class="loading">Loading...</div>
            <div v-else-if="songs.length === 0" class="empty-state">No songs yet</div>
            <ul v-else class="items-list">
              <li
                v-for="(progress, index) in songs"
                :key="progress.song?._id ?? `song-${index}`"
                class="item-card"
              >
                <div class="item-info">
                  <div class="item-name">{{ progress.song?.title ?? 'Unknown Song' }}</div>
                  <div class="item-subtext">{{ progress.song?.artist ?? 'Unknown Artist' }}</div>
                </div>
                <div class="item-mastery">{{ formatMastery(progress.mastery) }}</div>
              </li>
            </ul>
          </section>

          <section class="sidebar-section">
            <h2>Chords You've Learned</h2>
            <div v-if="loadingChords" class="loading">Loading...</div>
            <div v-else-if="chords.length === 0" class="empty-state">No chords yet</div>
            <ul v-else class="items-list">
              <li v-for="chord in chords" :key="chord.chord" class="item-card">
                <div class="item-name">{{ chord.chord }}</div>
                <div class="item-mastery">{{ chord.mastery }}</div>
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import { getSongsInProgress } from '@/services/songLibraryService'
import { getKnownChords } from '@/services/chordLibraryService'
import { createPost, getPersonalPrivatePosts, editPostVisibility } from '@/services/postService'
import { searchByTitleOrArtist } from '@/services/songService'
import { searchChordsByName } from '@/services/chordService'
import { getUserId, getSessionId } from '@/utils/sessionStorage'
import { useAuth } from '@/composables/useAuth'
import type { SongProgress } from '@/types/songLibrary'
import type { Post, PostVisibility } from '@/types/post'
import type { Song } from '@/types/song'
import type { Chord } from '@/types/chord'

type ItemSuggestionType = 'SONG' | 'CHORD'

interface ItemSuggestion {
  id: string
  label: string
  detail?: string
  type: ItemSuggestionType
}

const ITEM_SEARCH_RESULT_LIMIT = 10

const posts = ref<Post[]>([])
const songs = ref<SongProgress[]>([])
const chords = ref<Array<{ chord: string; mastery: string }>>([])
const loadingPosts = ref(false)
const loadingSongs = ref(false)
const loadingChords = ref(false)

// Create Post State
const newPostContent = ref('')
const newPostType = ref<'PROGRESS' | 'GENERAL'>('PROGRESS')
const newPostItems = ref<string[]>([])
const itemSearchType = ref<ItemSuggestionType>('SONG')
const itemSearchQuery = ref('')
const itemSearchResults = ref<ItemSuggestion[]>([])
const isSearchingItems = ref(false)
const isPosting = ref(false)
const createPostError = ref('')
const visibilityError = ref('')
const changingVisibilityFor = ref<string | null>(null)

const { kidOrPrivateStatus, refreshKidOrPrivateStatus } = useAuth()
const canMakePostsPublic = computed(() => kidOrPrivateStatus.value !== true)
const showItemSearchDropdown = computed(() =>
  itemSearchQuery.value.trim().length >= 2 &&
  (isSearchingItems.value || itemSearchResults.value.length > 0)
)

let itemSearchTimer: ReturnType<typeof setTimeout> | null = null

function setItemSearchType(type: ItemSuggestionType) {
  if (itemSearchType.value === type) return
  itemSearchType.value = type
  itemSearchQuery.value = ''
  itemSearchResults.value = []
  if (itemSearchTimer) {
    clearTimeout(itemSearchTimer)
    itemSearchTimer = null
  }
}

function handleItemSearchInput() {
  if (itemSearchTimer) {
    clearTimeout(itemSearchTimer)
    itemSearchTimer = null
  }

  if (itemSearchQuery.value.trim().length < 2) {
    itemSearchResults.value = []
    return
  }

  itemSearchTimer = setTimeout(() => {
    executeItemSearch(itemSearchQuery.value.trim())
  }, 250)
}

async function executeItemSearch(term: string) {
  isSearchingItems.value = true
  try {
    if (itemSearchType.value === 'SONG') {
      const responses = await searchByTitleOrArtist({ query: term })
      const songs = responses
        .map(result => result.song)
        .filter((song): song is Song => Boolean(song && song._id))
      itemSearchResults.value = songs.slice(0, ITEM_SEARCH_RESULT_LIMIT).map(song => ({
        id: song._id,
        label: `${song.title} by ${song.artist}`,
        detail: 'Song',
        type: 'SONG',
      }))
    } else {
      const chords = await searchChordsByName(term)
      itemSearchResults.value = chords.slice(0, ITEM_SEARCH_RESULT_LIMIT).map((chord: Chord) => ({
        id: chord._id,
        label: chord.name,
        detail: chord.notes?.length ? chord.notes.join(', ') : 'Chord',
        type: 'CHORD',
      }))
    }
  } catch (error) {
    console.error('Failed to search items for journal post:', error)
    itemSearchResults.value = []
  } finally {
    isSearchingItems.value = false
  }
}

function selectItem(option: ItemSuggestion) {
  const prefix = option.type === 'SONG' ? 'Song' : 'Chord'
  const label = `${prefix}: ${option.label}`
  if (!newPostItems.value.includes(label)) {
    newPostItems.value.push(label)
  }
  itemSearchQuery.value = ''
  itemSearchResults.value = []
  if (itemSearchTimer) {
    clearTimeout(itemSearchTimer)
    itemSearchTimer = null
  }
}

function removeItem(index: number) {
  newPostItems.value.splice(index, 1)
}

async function handleCreatePost() {
  createPostError.value = ''
  if (!newPostContent.value.trim()) return

  isPosting.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      createPostError.value = 'You must be logged in to post.'
      return
    }

    await createPost({
      sessionId,
      content: newPostContent.value,
      postType: newPostType.value,
      items: newPostItems.value,
      visibility: 'PRIVATE'
    })

    // Reset form
    newPostContent.value = ''
    newPostItems.value = []
    newPostType.value = 'PROGRESS'
    itemSearchQuery.value = ''
    itemSearchResults.value = []
    
    // Reload posts
    await loadPosts()
  } catch (error: any) {
    console.error('Failed to create post:', error)
    createPostError.value = error.message || 'Failed to create post'
  } finally {
    isPosting.value = false
  }
}

async function handleVisibilityChange(post: Post, nextVisibility: PostVisibility) {
  visibilityError.value = ''
  const sessionId = getSessionId()
  if (!sessionId) {
    visibilityError.value = 'You must be logged in to change visibility.'
    return
  }

  changingVisibilityFor.value = post._id
  try {
    await editPostVisibility({
      sessionId,
      postId: post._id,
      newVisibility: nextVisibility,
    })

    await loadPosts()
  } catch (error: any) {
    console.error('Failed to change visibility:', error)
    visibilityError.value = error.message || 'Failed to change visibility'
  } finally {
    changingVisibilityFor.value = null
  }
}

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const postDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
  
  // Check if it's today
  if (postDate.getTime() === today.getTime()) {
    return `Today at ${timeStr}`
  }
  
  // Check if it's yesterday
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (postDate.getTime() === yesterday.getTime()) {
    return `Yesterday at ${timeStr}`
  }
  
  // Check if it's this year
  const isThisYear = date.getFullYear() === now.getFullYear()
  
  if (isThisYear) {
    // Format: "December 25 at 3:45 PM"
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    return `${monthName} ${day} at ${timeStr}`
  } else {
    // Format: "December 25, 2023 at 3:45 PM"
    const monthName = date.toLocaleDateString('en-US', { month: 'long' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${monthName} ${day}, ${year} at ${timeStr}`
  }
}

async function loadPosts() {
  loadingPosts.value = true
  try {
    const userId = getUserId()
    const sessionId = getSessionId()
    if (!userId || !sessionId) {
      posts.value = []
      return
    }

    const response = await getPersonalPrivatePosts({ sessionId, user: userId })
    posts.value = response.map(item => item.post)
  } catch (error) {
    console.error('Failed to load posts:', error)
    posts.value = []
  } finally {
    loadingPosts.value = false
  }
}

async function loadSongs() {
  loadingSongs.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await getSongsInProgress(sessionId)
    songs.value = Array.isArray(response)
      ? response.filter(progress => progress && progress.song)
      : []
  } catch (error) {
    console.error('Failed to load songs:', error)
    songs.value = []
  } finally {
    loadingSongs.value = false
  }
}

function formatMastery(value: string | undefined | null) {
  if (!value) return 'Unknown'
  return value
    .split(' ')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

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

onMounted(() => {
  if (kidOrPrivateStatus.value === null) {
    refreshKidOrPrivateStatus()
  }
  loadPosts()
  loadSongs()
  loadChords()
})
</script>

<style scoped>
.journal-container {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  font-size: 1.75rem;
  margin-bottom: 2rem;
  color: var(--contrast-mid);

}

.journal-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
}

.posts-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  margin: 0 0 1rem;
  color: var(--contrast-mid);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-post-card {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.post-input {
  width: 100%;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  color: #e5e7eb;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.post-input:focus {
  outline: none;
  border-color: var(--main);
}

.post-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.items-input-group {
  display: flex;
  gap: 0.5rem;
  flex: 1;
}

.item-search-group {
  flex-direction: column;
  gap: 0.75rem;
}

.item-search-toggle {
  display: inline-flex;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 0.5rem;
  overflow: hidden;
}

.item-search-tab {
  background: transparent;
  border: none;
  color: #e5e7eb;
  padding: 0.35rem 0.85rem;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 0.2s ease, color 0.2s ease;
}

.item-search-tab.active {
  background: rgba(255, 255, 255, 0.12);
  color: var(--btn-text);
}

.item-search-input-wrapper {
  position: relative;
}

.item-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #e5e7eb;
}

.post-type-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
}

.post-type-select select {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #e5e7eb;
}

.new-items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.remove-item-btn {
  background: none;
  border: none;
  color: currentColor;
  margin-left: 0.25rem;
  cursor: pointer;
  opacity: 0.7;
}

.remove-item-btn:hover {
  opacity: 1;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  max-height: 220px;
  overflow-y: auto;
  z-index: 5;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: none;
  color: var(--contrast-mid);
  padding: 0.5rem 0.75rem;
  cursor: pointer;
}

.dropdown-item:hover:not(.muted) {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-item.muted {
  cursor: default;
  color: #9ca3af;
}

.dropdown-item .item-line-primary {
  display: block;
  font-weight: 600;
  color: #f9fafb;
}

.dropdown-item .item-line-secondary {
  display: block;
  font-size: 0.8rem;
  color: #9ca3af;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: var(--main);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  font-size: 0.875rem;
}

.post-card {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.post-type {
  font-size: 0.875rem;
  color: #9ca3af;
  text-transform: uppercase;
}

.post-date {
  font-size: 0.875rem;
  color: #9ca3af;
}

.post-content {
  margin: 1rem 0;
  color: #e5e7eb;
  line-height: 1.6;
}

.post-items {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.visibility-controls {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.visibility-label {
  font-size: 0.9rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.visibility-btn {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  color: #f9fafb;
}

.visibility-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.items-label {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.post-items .items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-badge {
  padding: 0.25rem 0.75rem;
  background: var(--main);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  font-size: 0.875rem;
  color: #a5b4fc;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.item-card {
  padding: 1rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-info {
  display: flex;
  flex-direction: column;
}

.item-name {
  font-weight: 500;
  color: var(--contrast-mid);
}

.item-subtext {
  font-size: 0.85rem;
  color: #9ca3af;
  margin-top: 0.2rem;
}

.item-mastery {
  font-size: 0.875rem;
  color: #9ca3af;
  text-transform: capitalize;
}

.loading,
.empty-state {
  color: #9ca3af;
  padding: 2rem;
  text-align: center;
}
</style>

