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
              <input
                v-model="newFriendUsername"
                type="text"
                placeholder="Enter username"
                class="friend-input"
              />
              <button @click="sendFriendRequest" :disabled="!newFriendUsername || loadingRequest" class="add-btn">
                {{ loadingRequest ? 'Sending...' : 'Send Request' }}
              </button>
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
            <div class="post-actions">
              <select v-model="newPostType" class="post-type-select">
                <option value="GENERAL">General</option>
                <option value="PROGRESS">Progress</option>
              </select>
              <button @click="createPost" :disabled="!newPostContent || creatingPost" class="post-btn">
                {{ creatingPost ? 'Posting...' : 'Post' }}
              </button>
            </div>
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
import { ref, computed, onMounted } from 'vue'
import Layout from '@/components/Layout.vue'
import { createPost as createPostAPI } from '@/services/postService'
import { sendFriendRequest as sendFriendRequestAPI, acceptFriendRequest, declineFriendRequest } from '@/services/friendshipService'
import { getNotifications } from '@/services/notificationService'
import { getSessionId } from '@/utils/sessionStorage'

const friendSearchQuery = ref('')
const newFriendUsername = ref('')
const newPostContent = ref('')
const newPostType = ref<'GENERAL' | 'PROGRESS'>('GENERAL')
const friends = ref<string[]>([])
const posts = ref<Array<{ id: string; author: string; content: string; postType: string; hasReaction: boolean }>>([])
const pendingRequests = ref<Array<{ requester: string }>>([])
const notifications = ref<Array<{ id: string; message: string }>>([])
const loadingFriends = ref(false)
const loadingPosts = ref(false)
const loadingRequests = ref(false)
const loadingNotifications = ref(false)
const creatingPost = ref(false)
const loadingRequest = ref(false)

const filteredFriends = computed(() => {
  if (!friendSearchQuery.value.trim()) return friends.value
  const query = friendSearchQuery.value.toLowerCase()
  return friends.value.filter(friend => friend.toLowerCase().includes(query))
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

async function createPost() {
  if (!newPostContent.value.trim() || creatingPost.value) return
  creatingPost.value = true

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await createPostAPI({
      sessionId,
      content: newPostContent.value.trim(),
      postType: newPostType.value,
    })

    newPostContent.value = ''
    await loadPosts()
  } catch (error) {
    console.error('Failed to create post:', error)
  } finally {
    creatingPost.value = false
  }
}

async function sendFriendRequest() {
  if (!newFriendUsername.value.trim() || loadingRequest.value) return
  loadingRequest.value = true

  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await sendFriendRequestAPI({
      sessionId,
      recipient: newFriendUsername.value.trim(),
    })

    newFriendUsername.value = ''
    await loadPendingRequests()
  } catch (error) {
    console.error('Failed to send friend request:', error)
  } finally {
    loadingRequest.value = false
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

onMounted(() => {
  loadPosts()
  loadFriends()
  loadPendingRequests()
  loadNotifications()
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

.post-type-select {
  padding: 0.5rem;
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--contrast-mid);
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

.loading,
.empty-state {
  color: #9ca3af;
  padding: 1rem;
  text-align: center;
}
</style>

