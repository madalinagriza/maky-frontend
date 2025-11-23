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
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <span class="post-type">{{ post.postType }}</span>
                <span class="post-date">{{ formatDate(post.createdAt) }}</span>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-reactions">
                <div v-if="post.reactions && post.reactions.length > 0" class="reactions-list">
                  <span v-for="reaction in post.reactions" :key="reaction.id" class="reaction-badge">
                    {{ getReactionEmoji(reaction.type) }} {{ reaction.type }}
                  </span>
                </div>
                <div v-else class="no-reactions">No reactions yet</div>
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
              <li v-for="progress in songs" :key="progress.song._id" class="item-card">
                <div class="item-name">{{ progress.song.title }}</div>
                <div class="item-mastery">{{ progress.mastery }}</div>
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
import { getSessionId } from '@/utils/sessionStorage'
import type { SongProgress } from '@/types/songLibrary'

const posts = ref<Array<{
  id: string
  content: string
  postType: string
  createdAt: string
  reactions: Array<{ id: string; type: string }>
}>>([])
const songs = ref<SongProgress[]>([])
const chords = ref<Array<{ chord: string; mastery: string }>>([])
const loadingPosts = ref(false)
const loadingSongs = ref(false)
const loadingChords = ref(false)

function formatDate(dateString: string): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

function getReactionEmoji(type: string): string {
  switch (type) {
    case 'LIKE':
      return '👍'
    case 'LOVE':
      return '❤️'
    case 'CELEBRATE':
      return '🎉'
    default:
      return '👍'
  }
}

async function loadPosts() {
  loadingPosts.value = true
  try {
    // TODO: Implement user posts fetching API
    posts.value = []
  } catch (error) {
    console.error('Failed to load posts:', error)
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
    songs.value = response
  } catch (error) {
    console.error('Failed to load songs:', error)
    songs.value = []
  } finally {
    loadingSongs.value = false
  }
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

.post-reactions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reactions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.reaction-badge {
  padding: 0.25rem 0.75rem;
  background: var(--main);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 999px;
  font-size: 0.875rem;
  color: #a5b4fc;
}

.no-reactions {
  color: #9ca3af;
  font-size: 0.875rem;
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

.item-name {
  font-weight: 500;
  color: var(--contrast-mid);
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

