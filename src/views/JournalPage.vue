<template>
  <Layout>
    <div class="journal-container">
      <h1>My Journal</h1>

      <div class="journal-layout">
        <!-- Middle Column: Posts -->
        <main class="posts-column">
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
import { getPostsForUser } from '@/services/postService'
import { getUserId, getSessionId } from '@/utils/sessionStorage'
import type { SongProgress } from '@/types/songLibrary'
import type { Post } from '@/types/post'

const posts = ref<Post[]>([])
const songs = ref<SongProgress[]>([])
const chords = ref<Array<{ chord: string; mastery: string }>>([])
const loadingPosts = ref(false)
const loadingSongs = ref(false)
const loadingChords = ref(false)

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

