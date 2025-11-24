<template>
  <Layout>
    <div class="feed-container">
      <div class="feed-layout">
        <!-- Left Column: Friends -->
        <aside class="friends-column">
          <div class="friends-panel">
            <h2>Friends</h2>
            <input
              v-model="friendSearchQuery"
              type="text"
              placeholder="Search friends..."
              class="search-input"
            />
            <div v-if="loadingFriends" class="loading">Loading...</div>
            <ul v-else class="friends-list">
              <li v-for="friend in filteredFriends" :key="friend" class="friend-item">
                {{ friend }}
              </li>
            </ul>
            <div class="add-friend-section">
              <h3>Add Friend</h3>
              <div class="add-friend-row">
                <div class="add-friend-input-wrapper">
                  <input
                    v-model="addFriendQuery"
                    type="text"
                    placeholder="Search users by display name"
                    class="friend-input"
                    @keyup.enter.prevent="sendFriendRequest"
                  />
                  <div v-if="showAddFriendDropdown" class="search-dropdown">
                    <div v-if="searchingAddFriends" class="dropdown-item muted">Searching...</div>
                    <button
                      v-else-if="addFriendResults.length === 0"
                      class="dropdown-item muted"
                      disabled
                    >
                      No matches yet
                    </button>
                    <button
                      v-else
                      v-for="result in addFriendResults"
                      :key="result.user"
                      type="button"
                      class="dropdown-item"
                      @click="selectAddFriend(result)"
                    >
                      {{ result.displayName }}
                    </button>
                  </div>
                </div>
                <button
                  @click="sendFriendRequest"
                  :disabled="!addFriendQuery || loadingRequest"
                  class="add-btn add-btn-inline"
                >
                  {{ loadingRequest ? 'Send…' : 'Send' }}
                </button>
              </div>
              <p v-if="addFriendError" class="input-error">{{ addFriendError }}</p>
            </div>
          </div>
        </aside>

        <!-- Middle Column: Posts -->
        <main class="posts-column">
          <div class="create-post-section">
            <textarea
              v-model="newPostContent"
              placeholder="Share your progress..."
              class="post-textarea"
              rows="3"
            ></textarea>
            <div class="item-selection-wrapper">
              <div class="item-input-wrapper">
                <input
                  v-model="itemSearchQuery"
                  type="text"
                  :placeholder="selectedItems.length >= 5 ? 'Maximum 5 items reached' : 'Link songs or chords (optional)'"
                  class="item-input"
                  :disabled="selectedItems.length >= 5"
                  @focus="showItemDropdown = true"
                />
                <div v-if="showItemDropdown && selectedItems.length < 5" class="search-dropdown">
                  <div v-if="loadingSongs || loadingChords" class="dropdown-item muted">Loading...</div>
                  <div v-else-if="filteredItems.length === 0" class="dropdown-item muted" disabled>
                    No songs or chords found
                  </div>
                  <button
                    v-else
                    v-for="item in filteredItems"
                    :key="item.id"
                    type="button"
                    class="dropdown-item"
                    :class="{ 'disabled': isItemSelected(item) }"
                    :disabled="isItemSelected(item)"
                    @click="selectItem(item)"
                  >
                    <span class="item-icon">{{ item.type === 'song' ? '🎵' : '🎸' }}</span>
                    <span class="item-label">{{ item.displayName }}</span>
                    <span v-if="isItemSelected(item)" class="already-selected">✓ Selected</span>
                  </button>
                </div>
              </div>
            </div>
            <div v-if="selectedItems.length > 0" class="selected-items-chips">
              <div
                v-for="(item, index) in selectedItems"
                :key="item.id"
                class="item-chip"
              >
                <span class="item-icon">{{ item.type === 'song' ? '🎵' : '🎸' }}</span>
                <span class="item-name">{{ item.displayName }}</span>
                <button
                  @click="removeItem(index)"
                  class="chip-remove-btn"
                  type="button"
                  aria-label="Remove item"
                >
                  ✕
                </button>
              </div>
            </div>
            <div class="post-actions">
              <button @click="createPost" :disabled="!newPostContent.trim() || creatingPost" class="post-btn">
                {{ creatingPost ? 'Posting...' : 'Post' }}
              </button>
            </div>
            <p v-if="postError" class="input-error">{{ postError }}</p>
          </div>

          <div v-if="loadingPosts" class="loading">Loading posts...</div>
          <div v-else-if="posts.length === 0" class="empty-state">No posts yet. Be the first to post!</div>
          <div v-else class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <span class="post-author">{{ post.author }}</span>
                <span class="post-type">{{ post.postType }}</span>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-actions-bar">
                <button @click="toggleReaction(post.id)" class="reaction-btn">
                  {{ post.hasReaction ? '❤️' : '🤍' }} Like
                </button>
                <button @click="showComments(post.id)" class="comment-btn">💬 Comment</button>
              </div>
            </div>
          </div>
        </main>

        <!-- Right Column: Notifications & Requests -->
        <aside class="notifications-column">
          <div class="notifications-panel">
            <h2>Friend Requests</h2>
            <div v-if="loadingRequests" class="loading">Loading...</div>
            <div v-else-if="pendingRequests.length === 0" class="empty-state">No pending requests</div>
            <ul v-else class="requests-list">
              <li v-for="request in pendingRequests" :key="request.requester" class="request-item">
                <span>{{ request.requester }}</span>
                <div class="request-actions">
                  <button @click="acceptRequest(request.requester)" class="accept-btn">Accept</button>
                  <button @click="declineRequest(request.requester)" class="decline-btn">Decline</button>
                </div>
              </li>
            </ul>
          </div>

          <div class="notifications-panel">
            <h2>Notifications</h2>
            <div v-if="loadingNotifications" class="loading">Loading...</div>
            <div v-else-if="notifications.length === 0" class="empty-state">No notifications</div>
            <ul v-else class="notifications-list">
              <li v-for="notification in notifications" :key="notification.id" class="notification-item">
                {{ notification.message }}
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { createPost as createPostAPI } from '@/services/postService'
import { sendFriendRequest as sendFriendRequestAPI, acceptFriendRequest, declineFriendRequest } from '@/services/friendshipService'
import { getNotifications } from '@/services/notificationService'
import { getSongsInProgress } from '@/services/songLibraryService'
import { getKnownChords } from '@/services/chordLibraryService'
import { getSessionId } from '@/utils/sessionStorage'
import { searchProfilesByDisplayName } from '@/services/userProfileService'
import type { DisplayNameSearchResult } from '@/types/userProfile'
import type { SongProgress } from '@/types/songLibrary'
import type { KnownChord } from '@/types/chordLibrary'

interface SelectableItem {
  id: string
  type: 'song' | 'chord'
  displayName: string
}

const friendSearchQuery = ref('')
const addFriendQuery = ref('')
const newPostContent = ref('')
const itemSearchQuery = ref('')
const friends = ref<string[]>([])
const addFriendResults = ref<DisplayNameSearchResult[]>([])
const selectedAddFriend = ref<DisplayNameSearchResult | null>(null)
const posts = ref<Array<{ id: string; author: string; content: string; postType: string; hasReaction: boolean }>>([])
const pendingRequests = ref<Array<{ requester: string }>>([])
const notifications = ref<Array<{ id: string; message: string }>>([])
const songs = ref<SongProgress[]>([])
const chords = ref<KnownChord[]>([])
const selectedItems = ref<SelectableItem[]>([])
const showItemDropdown = ref(false)
const MAX_ITEMS = 5
const loadingFriends = ref(false)
const searchingAddFriends = ref(false)
const loadingPosts = ref(false)
const loadingRequests = ref(false)
const loadingNotifications = ref(false)
const loadingSongs = ref(false)
const loadingChords = ref(false)
const creatingPost = ref(false)
const loadingRequest = ref(false)
const addFriendError = ref('')
const postError = ref('')

const filteredFriends = computed(() => {
  if (!friendSearchQuery.value.trim()) return friends.value
  const query = friendSearchQuery.value.toLowerCase()
  return friends.value.filter(friend => friend.toLowerCase().includes(query))
})

const showAddFriendDropdown = computed(() =>
  Boolean(addFriendQuery.value.trim() && (searchingAddFriends.value || addFriendResults.value.length))
)

const allItems = computed<SelectableItem[]>(() => {
  const songItems: SelectableItem[] = songs.value.map(sp => ({
    id: sp.song._id,
    type: 'song' as const,
    displayName: `${sp.song.title} - ${sp.song.artist}`,
  }))
  const chordItems: SelectableItem[] = chords.value.map(c => ({
    id: c.chord,
    type: 'chord' as const,
    displayName: c.chord,
  }))
  return [...songItems, ...chordItems]
})

const filteredItems = computed(() => {
  if (!itemSearchQuery.value.trim()) return allItems.value
  const query = itemSearchQuery.value.toLowerCase()
  return allItems.value.filter(item => item.displayName.toLowerCase().includes(query))
})

let addFriendSearchTimer: ReturnType<typeof setTimeout> | null = null
let skipNextAddFriendSearch = false

watch(addFriendQuery, newValue => {
  addFriendError.value = ''
  if (skipNextAddFriendSearch) {
    skipNextAddFriendSearch = false
    return
  }

  if (!newValue.trim()) {
    addFriendResults.value = []
    selectedAddFriend.value = null
    if (addFriendSearchTimer) clearTimeout(addFriendSearchTimer)
    return
  }

  selectedAddFriend.value = null
  if (addFriendSearchTimer) clearTimeout(addFriendSearchTimer)
  addFriendSearchTimer = setTimeout(() => {
    performAddFriendSearch(newValue)
  }, 300)
})

async function loadPosts() {
  loadingPosts.value = true
  try {
    // TODO: Implement post fetching API
    // For now, using mock data
    posts.value = []
  } catch (error) {
    console.error('Failed to load posts:', error)
  } finally {
    loadingPosts.value = false
  }
}

function isItemSelected(item: SelectableItem): boolean {
  return selectedItems.value.some(selected => selected.id === item.id)
}

function selectItem(item: SelectableItem) {
  // Prevent duplicates
  if (isItemSelected(item)) {
    return
  }
  
  // Check max limit
  if (selectedItems.value.length >= MAX_ITEMS) {
    return
  }
  
  selectedItems.value.push(item)
  itemSearchQuery.value = ''
  showItemDropdown.value = false
}

function removeItem(index: number) {
  selectedItems.value.splice(index, 1)
  if (itemSearchQuery.value.trim() && selectedItems.value.length < MAX_ITEMS) {
    showItemDropdown.value = true
  }
}

async function createPost() {
  if (!newPostContent.value.trim() || creatingPost.value) return
  creatingPost.value = true
  postError.value = ''

  try {
    const sessionId = getSessionId()
    if (!sessionId) {
      postError.value = 'Please log in to create a post.'
      return
    }

    const postType = selectedItems.value.length > 0 ? 'PROGRESS' : 'GENERAL'
    const items = selectedItems.value.map(item => item.id)

    await createPostAPI({
      sessionId,
      content: newPostContent.value.trim(),
      postType,
      items: items, // Always send array, even if empty
    })

    newPostContent.value = ''
    selectedItems.value = []
    itemSearchQuery.value = ''
    showItemDropdown.value = false
    await loadPosts()
  } catch (error) {
    console.error('Failed to create post:', error)
    postError.value = error instanceof Error ? error.message : 'Failed to create post. Please try again.'
  } finally {
    creatingPost.value = false
  }
}

async function sendFriendRequest() {
  if (!addFriendQuery.value.trim() || loadingRequest.value) return

  const trimmedQuery = addFriendQuery.value.trim()
  const match =
    (selectedAddFriend.value &&
      selectedAddFriend.value.displayName?.toLowerCase() === trimmedQuery.toLowerCase()
        ? selectedAddFriend.value
        : null) || (await resolveAddFriendQuery(addFriendQuery.value))
  if (!match) {
    addFriendError.value = 'No users found with that display name.'
    return
  }

  await submitFriendRequest(match.user)
  resetAddFriendSelection()
}

function selectAddFriend(result: DisplayNameSearchResult) {
  skipNextAddFriendSearch = true
  addFriendQuery.value = result.displayName
  selectedAddFriend.value = result
  addFriendResults.value = []
}

async function submitFriendRequest(userId: string) {
  loadingRequest.value = true
  addFriendError.value = ''
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await sendFriendRequestAPI({
      sessionId,
      recipient: userId,
    })

    await loadPendingRequests()
  } catch (error) {
    console.error('Failed to send friend request:', error)
    addFriendError.value = 'Could not send request. Please try again.'
  } finally {
    loadingRequest.value = false
  }
}

function resetAddFriendSelection() {
  addFriendQuery.value = ''
  addFriendResults.value = []
  selectedAddFriend.value = null
}

async function resolveAddFriendQuery(query: string) {
  try {
    const results = await searchProfilesByDisplayName(query)
    if (!results.length) return null

    const normalized = query.trim().toLowerCase()
    return (
      results.find(result => result.displayName?.toLowerCase() === normalized) ||
      results[0]
    )
  } catch (error) {
    console.error('Failed to resolve display name:', error)
    return null
  }
}

async function acceptRequest(requester: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await acceptFriendRequest({ sessionId, requester })
    await loadPendingRequests()
    await loadFriends()
  } catch (error) {
    console.error('Failed to accept request:', error)
  }
}

async function declineRequest(requester: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await declineFriendRequest({ sessionId, requester })
    await loadPendingRequests()
  } catch (error) {
    console.error('Failed to decline request:', error)
  }
}

async function loadFriends() {
  loadingFriends.value = true
  try {
    // TODO: Implement friends fetching API
    friends.value = []
  } catch (error) {
    console.error('Failed to load friends:', error)
  } finally {
    loadingFriends.value = false
  }
}

async function loadPendingRequests() {
  loadingRequests.value = true
  try {
    // TODO: Implement pending requests fetching API
    pendingRequests.value = []
  } catch (error) {
    console.error('Failed to load requests:', error)
  } finally {
    loadingRequests.value = false
  }
}

async function performAddFriendSearch(query: string) {
  const trimmedQuery = query.trim()
  if (!trimmedQuery) {
    addFriendResults.value = []
    return
  }

  searchingAddFriends.value = true
  try {
    addFriendResults.value = await searchProfilesByDisplayName(trimmedQuery)
  } catch (error) {
    console.error('Failed to search users:', error)
    addFriendResults.value = []
  } finally {
    searchingAddFriends.value = false
  }
}

async function loadNotifications() {
  loadingNotifications.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const response = await getNotifications({ sessionId })
    notifications.value = response.map((n: any) => ({
      id: n.id || String(Math.random()),
      message: n.message || n.type || 'New notification',
    }))
  } catch (error) {
    console.error('Failed to load notifications:', error)
    notifications.value = []
  } finally {
    loadingNotifications.value = false
  }
}

async function loadSongs() {
  loadingSongs.value = true
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    songs.value = await getSongsInProgress(sessionId)
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

    chords.value = await getKnownChords(sessionId)
  } catch (error) {
    console.error('Failed to load chords:', error)
    chords.value = []
  } finally {
    loadingChords.value = false
  }
}

function toggleReaction(postId: string) {
  // TODO: Implement reaction toggle
  const post = posts.value.find(p => p.id === postId)
  if (post) {
    post.hasReaction = !post.hasReaction
  }
}

function showComments(postId: string) {
  // TODO: Implement comments display
  console.log('Show comments for post:', postId)
}

watch(itemSearchQuery, (newValue) => {
  if (newValue.trim() && selectedItems.value.length < MAX_ITEMS) {
    showItemDropdown.value = true
  } else if (!newValue.trim()) {
    showItemDropdown.value = false
  }
})

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.item-input-wrapper')) {
    showItemDropdown.value = false
  }
}

onMounted(() => {
  loadPosts()
  loadFriends()
  loadPendingRequests()
  loadNotifications()
  loadSongs()
  loadChords()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

onMounted(() => {
  loadPosts()
  loadFriends()
  loadPendingRequests()
  loadNotifications()
  loadSongs()
  loadChords()
})
</script>

<style scoped>
.feed-container {
  max-width: 1400px;
  margin: 0 auto;
}

.feed-layout {
  display: grid;
  grid-template-columns: 250px 1fr 300px;
  gap: 2rem;
}

.friends-column,
.notifications-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.friends-panel,
.notifications-panel {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  margin: 0 0 1rem;
  color: var(--contrast-mid);
}

h3 {
  font-size: 1rem;
  margin: 1rem 0 0.5rem;
  color: var(--contrast-mid);
}

.search-input,
.friend-input {
  width: 100%;
  padding: 0.5rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
  margin-bottom: 1rem;
}

.add-friend-row {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.add-friend-input-wrapper {
  position: relative;
  flex: 1;
}

.add-friend-row .friend-input {
  margin-bottom: 0;
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-top: 0.25rem;
  max-height: 220px;
  overflow-y: auto;
  z-index: 3;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
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

.posts-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.create-post-section {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

.post-textarea {
  width: 100%;
  padding: 0.75rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
  font-family: inherit;
  resize: vertical;
  margin-bottom: 1rem;
}

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-selection-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.item-input-wrapper {
  position: relative;
  flex: 1;
}

.item-input {
  width: 100%;
  padding: 0.75rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: #f9fafb;
  font-family: inherit;
}

.clear-item-btn {
  padding: 0.75rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--contrast-mid);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.clear-item-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.selected-items-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.item-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: rgba(165, 180, 252, 0.1);
  border: 1px solid rgba(165, 180, 252, 0.2);
  border-radius: 0.5rem;
  color: #a5b4fc;
  font-size: 0.9rem;
}

.item-icon {
  font-size: 1rem;
}

.item-name {
  flex: 1;
  white-space: nowrap;
}

.chip-remove-btn {
  background: transparent;
  border: none;
  color: #a5b4fc;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  margin-left: 0.25rem;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.chip-remove-btn:hover {
  opacity: 1;
}

.dropdown-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.already-selected {
  margin-left: auto;
  font-size: 0.85rem;
  color: #9ca3af;
}

.post-btn {
  padding: 0.5rem 1.5rem;
  background: var(--button);
  color: var(--btn-text);
  border: none;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-card {
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.post-author {
  font-weight: 600;
  color: #a5b4fc;
}

.post-type {
  font-size: 0.875rem;
  color: #9ca3af;
}

.post-content {
  margin: 1rem 0;
  color: #e5e7eb;
  line-height: 1.6;
}

.post-actions-bar {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reaction-btn,
.comment-btn {
  background: transparent;
  border: none;
  color: var(--btn-text);
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: background 0.2s ease;
}

.reaction-btn:hover,
.comment-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.friends-list,
.requests-list,
.notifications-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.friend-item,
.request-item,
.notification-item {
  padding: 0.75rem;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.request-actions {
  display: flex;
  gap: 0.5rem;
}

.accept-btn,
.decline-btn,
.add-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--btn-text);
}

.accept-btn {
  background: rgba(16, 185, 129, 0.2);
  color: #6ee7b7;
}

.decline-btn {
  background: rgba(248, 113, 113, 0.2);
  color: #fecaca;
}

.add-btn {
  background: var(--button);
  color: var(--btn-text);
  width: 100%;
  margin-top: 0.5rem;
}

.add-btn-inline {
  width: auto;
  margin-top: 0;
  padding: 0.4rem 0.9rem;
  font-size: 0.85rem;
  white-space: nowrap;
}

.input-error {
  color: #fca5a5;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

.loading,
.empty-state {
  color: #9ca3af;
  padding: 1rem;
  text-align: center;
}
</style>

