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
                <div class="items-input-group">
                  <input 
                    v-model="newItemInput" 
                    @keydown.enter.prevent="addItem"
                    placeholder="Add an item (e.g. song name)"
                    class="item-input"
                  />
                  <button type="button" @click="addItem" class="add-item-btn">Add</button>
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
import { ref, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { getSongsInProgress } from '@/services/songLibraryService'
import { getKnownChords } from '@/services/chordLibraryService'
import { getPostsForUser, createPost } from '@/services/postService'
import { getUserId, getSessionId } from '@/utils/sessionStorage'
import type { SongProgress } from '@/types/songLibrary'
import type { Post } from '@/types/post'

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
const newItemInput = ref('')
const isPosting = ref(false)
const createPostError = ref('')

function addItem() {
  const trimmed = newItemInput.value.trim()
  if (trimmed) {
    newPostItems.value.push(trimmed)
    newItemInput.value = ''
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
      items: newPostItems.value
    })

    // Reset form
    newPostContent.value = ''
    newPostItems.value = []
    newPostType.value = 'PROGRESS'
    
    // Reload posts
    await loadPosts()
  } catch (error: any) {
    console.error('Failed to create post:', error)
    createPostError.value = error.message || 'Failed to create post'
  } finally {
    isPosting.value = false
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
    if (!userId) {
      posts.value = []
      return
    }

    const response = await getPostsForUser({ user: userId })
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

.item-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: #e5e7eb;
}

.add-item-btn {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 0.5rem;
  color: #e5e7eb;
  cursor: pointer;
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

