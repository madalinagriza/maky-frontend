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
              <li v-for="friend in filteredFriends" :key="friend.id" class="friend-item">
                <div class="friend-info">
                  <img
                    v-if="friend.avatarUrl"
                    :src="friend.avatarUrl"
                    alt="Friend avatar"
                    class="friend-avatar"
                  />
                  <div v-else class="friend-avatar fallback">
                    {{ (friend.displayName || friend.id).charAt(0).toUpperCase() }}
                  </div>
                  <div class="friend-details">
                    <span class="friend-name">{{ friend.displayName || friend.id }}</span>
                    <!-- <span v-if="friend.displayName && friend.displayName !== friend.id" class="friend-handle">
                      {{ friend.id }}
                    </span> -->
                  </div>
                </div>
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
          <div v-if="loadingPosts" class="loading">Loading posts...</div>
          <div v-else-if="posts.length === 0" class="empty-state">No posts from friends yet. Add friends to see their updates!</div>
          <div v-else class="posts-list">
            <div v-for="post in posts" :key="post.id" class="post-card">
              <div class="post-header">
                <span class="post-author">{{ post.author }}</span>
                <span class="post-type">{{ post.postType }}</span>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div class="post-actions-bar">
                <!-- DEBUG INFO -->
                <div style="font-size: 10px; color: orange;">
                  Reaction: {{ post.userReaction }}
                </div>
                <div class="reactions-group">
                  <button 
                    @click="handleReaction(post, 'LIKE')" 
                    class="reaction-btn" 
                    :class="{ active: post.userReaction === 'LIKE' }"
                    title="Like"
                  >
                    <span class="reaction-icon">👍</span>
                    <span class="reaction-count" v-if="post.reactionCounts.LIKE > 0">{{ post.reactionCounts.LIKE }}</span>
                  </button>
                  <button 
                    @click="handleReaction(post, 'LOVE')" 
                    class="reaction-btn" 
                    :class="{ active: post.userReaction === 'LOVE' }"
                    title="Love"
                  >
                    <span class="reaction-icon">❤️</span>
                    <span class="reaction-count" v-if="post.reactionCounts.LOVE > 0">{{ post.reactionCounts.LOVE }}</span>
                  </button>
                  <button 
                    @click="handleReaction(post, 'CELEBRATE')" 
                    class="reaction-btn" 
                    :class="{ active: post.userReaction === 'CELEBRATE' }"
                    title="Celebrate"
                  >
                    <span class="reaction-icon">🎉</span>
                    <span class="reaction-count" v-if="post.reactionCounts.CELEBRATE > 0">{{ post.reactionCounts.CELEBRATE }}</span>
                  </button>
                </div>
                <button @click="toggleComments(post)" class="comment-btn">
                  💬 Comment
                  <span v-if="post.comments.length > 0" class="reaction-count">{{ post.comments.length }}</span>
                </button>
              </div>
              
              <!-- Comments Section -->
              <div v-if="post.showComments" class="comments-section">
                <div v-if="post.loadingComments" class="loading-comments">Loading comments...</div>
                <ul v-else class="comments-list">
                  <li v-if="post.comments.length === 0" class="no-comments">No comments yet.</li>
                  <li v-for="(comment, index) in post.comments" :key="index" class="comment-item">
                    <span class="comment-author">{{ comment.authorDisplayName || comment.author }}</span>
                    <span class="comment-text">{{ comment.content }}</span>
                  </li>
                </ul>
                <div class="add-comment-box">
                  <input 
                    v-model="post.newCommentText" 
                    type="text" 
                    placeholder="Write a comment..." 
                    class="comment-input"
                    @keyup.enter="submitComment(post)"
                  />
                  <button 
                    @click="submitComment(post)" 
                    :disabled="!post.newCommentText.trim()"
                    class="post-comment-btn"
                  >
                    Post
                  </button>
                </div>
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
                <div class="requester-info">
                  <img
                    v-if="request.avatarUrl"
                    :src="request.avatarUrl"
                    alt="Profile avatar"
                    class="request-avatar"
                  />
                  <div v-else class="request-avatar fallback">
                    {{ (request.displayName || request.requester).charAt(0).toUpperCase() }}
                  </div>
                  <span class="requester-name">{{ request.displayName || request.requester }}</span>
                </div>
                <div class="request-actions">
                  <button
                    @click="acceptRequest(request.requester)"
                    class="accept-btn"
                    aria-label="Accept request"
                  >
                    ✓
                  </button>
                  <button
                    @click="declineRequest(request.requester)"
                    class="decline-btn"
                    aria-label="Decline request"
                  >
                    ✕
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import {
  sendFriendRequest as sendFriendRequestAPI,
  acceptFriendRequest,
  declineFriendRequest,
  getPendingFriendships,
  getFriends,
} from '@/services/friendshipService'
import {
  getPostsForUsers,
  addReactionToPost,
  changeReactionType,
  removeReactionFromPost,
  getReactionsForPostId,
  getReactionOnPostFromUser,
  addCommentToPost,
  getCommentsForPostId,
} from '@/services/postService'
import { getSessionId, getUserId } from '@/utils/sessionStorage'
import { searchProfilesByDisplayName, getProfile } from '@/services/userProfileService'
import type { DisplayNameSearchResult } from '@/types/userProfile'
import type { ReactionType } from '@/types/post'

interface FriendListEntry {
  id: string
  displayName?: string
  avatarUrl?: string
}

const friendSearchQuery = ref('')
const addFriendQuery = ref('')
const friends = ref<FriendListEntry[]>([])
const addFriendResults = ref<DisplayNameSearchResult[]>([])
const selectedAddFriend = ref<DisplayNameSearchResult | null>(null)
const posts = ref<Array<{ 
  id: string; 
  author: string; 
  content: string; 
  postType: string; 
  userReaction: ReactionType | null;
  reactionCounts: Record<ReactionType, number>;
  comments: Array<{ content: string; author: string; authorDisplayName?: string }>;
  showComments: boolean;
  loadingComments: boolean;
  newCommentText: string;
}>>([])
const pendingRequests = ref<Array<{ requester: string; displayName?: string; avatarUrl?: string }>>([])
const loadingFriends = ref(false)
const searchingAddFriends = ref(false)
const loadingPosts = ref(false)
const loadingRequests = ref(false)
const loadingRequest = ref(false)
const addFriendError = ref('')

const filteredFriends = computed(() => {
  const query = friendSearchQuery.value.trim().toLowerCase()
  if (!query) return friends.value
  return friends.value.filter(friend => {
    const name = friend.displayName || friend.id
    return name.toLowerCase().includes(query)
  })
})

const showAddFriendDropdown = computed(() =>
  Boolean(addFriendQuery.value.trim() && (searchingAddFriends.value || addFriendResults.value.length))
)

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
    const userId = getUserId()
    if (!userId) {
      posts.value = []
      return
    }

    // 1. Get friends
    const friendIds = await getFriends({ user: userId })
    
    // 2. Only fetch posts from friends, excluding the current user
    const usersToFetch = [...friendIds]
    
    if (usersToFetch.length === 0) {
      posts.value = []
      return
    }

    // 3. Get posts for these users
    const response = await getPostsForUsers({ users: usersToFetch })
    
    // Map response to component state
    const mappedPosts = await Promise.all(response.map(async item => {
      const postId = item.post._id
      let reactionCounts: Record<ReactionType, number> = { LIKE: 0, LOVE: 0, CELEBRATE: 0 }
      
      try {
        const reactions = await getReactionsForPostId({ post: postId })
        reactions.forEach(r => {
          if (r.type in reactionCounts) {
            reactionCounts[r.type] = r.count
          }
        })
      } catch (e) {
        console.error(`Failed to load reactions for post ${postId}`, e)
      }

      let userReaction: ReactionType | null = null
      try {
        console.log(`[FeedPage] Fetching reaction for user ${userId} on post ${postId}`)
        const myReaction = await getReactionOnPostFromUser({ user: userId, post: postId })
        console.log(`[FeedPage] Reaction response for post ${postId}:`, myReaction)
        
        if (Array.isArray(myReaction)) {
          const active = myReaction.find(r => Number(r.count) > 0)
          if (active) {
            userReaction = active.type as ReactionType
            console.log(`[FeedPage] Found active reaction: ${userReaction}`)
          } else {
            console.log(`[FeedPage] No active reaction found in array`)
          }
        } else {
          console.log(`[FeedPage] Response is not an array`, myReaction)
        }
      } catch (e) {
        console.error(`Failed to load user reaction for post ${postId}`, e)
      }

      let comments: any[] = []
      try {
        if (typeof getCommentsForPostId === 'function') {
          const commentsResponse = await getCommentsForPostId({ post: postId }) as any
          if (commentsResponse && commentsResponse.length > 0 && commentsResponse[0] && 'comments' in commentsResponse[0]) {
            comments = commentsResponse[0].comments.map((c: any) => ({
              ...c,
              authorDisplayName: c.author
            }))
          } else if (Array.isArray(commentsResponse)) {
            comments = commentsResponse.map((c: any) => ({
              ...c,
              authorDisplayName: c.author
            }))
          }
        }
      } catch (e) {
        console.error(`Failed to load comments for post ${postId}`, e)
      }

      return {
        id: postId,
        author: item.post.author,
        content: item.post.content,
        postType: item.post.postType,
        userReaction,
        reactionCounts,
        comments,
        showComments: false,
        loadingComments: false,
        newCommentText: ''
      }
    }))

    posts.value = mappedPosts

  } catch (error) {
    console.error('Failed to load posts:', error)
    posts.value = []
  } finally {
    loadingPosts.value = false
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
    await Promise.all([loadPendingRequests(), loadFriends()])
  } catch (error) {
    console.error('Failed to accept request:', error)
  }
}

async function declineRequest(requester: string) {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    await declineFriendRequest({ sessionId, requester })
    await Promise.all([loadPendingRequests(), loadFriends()])
  } catch (error) {
    console.error('Failed to decline request:', error)
  }
}

async function loadFriends() {
  console.log('loadFriends called')
  loadingFriends.value = true
  try {
    const userId = getUserId()
    console.log('loadFriends userId:', userId)
    if (!userId) {
      console.log('No userId, skipping loadFriends')
      friends.value = []
      return
    }

    console.log('Calling getFriends API...')
    const friendIds = await getFriends({ user: userId })
    console.log('getFriends result:', friendIds)
    const enrichedFriends = await Promise.all(
      friendIds.map(async (friendId: string) => {
        try {
          const profile = await getProfile({ user: friendId })
          return {
            id: friendId,
            displayName: profile?.displayName || friendId,
            avatarUrl: profile?.avatarUrl,
          }
        } catch (profileError) {
          console.error('Failed to load friend profile:', profileError)
          return { id: friendId }
        }
      })
    )

    friends.value = enrichedFriends
  } catch (error) {
    console.error('Failed to load friends:', error)
    friends.value = []
  } finally {
    loadingFriends.value = false
  }
}

async function loadPendingRequests() {
  loadingRequests.value = true
  try {
    const userId = getUserId()
    if (!userId) {
      pendingRequests.value = []
      return
    }

    const pending = await getPendingFriendships({ user: userId })
    const enriched = await Promise.all(
      pending.map(async request => {
        try {
          const profile = await getProfile({ user: request.requester })
          return {
            requester: request.requester,
            displayName: profile?.displayName || request.requester,
            avatarUrl: profile?.avatarUrl,
          }
        } catch (profileError) {
          console.error('Failed to load requester profile:', profileError)
          return { requester: request.requester }
        }
      })
    )

    pendingRequests.value = enriched
  } catch (error) {
    console.error('Failed to load requests:', error)
    pendingRequests.value = []
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

async function handleReaction(post: any, type: ReactionType) {
  const sessionId = getSessionId()
  if (!sessionId) return

  const previousReaction = post.userReaction
  
  try {
    if (previousReaction === type) {
      // Toggle off
      post.userReaction = null // Optimistic update
      post.reactionCounts[type] = Math.max(0, (post.reactionCounts[type] || 0) - 1)
      await removeReactionFromPost({ sessionId, post: post.id })
    } else if (previousReaction) {
      // Change type
      post.userReaction = type // Optimistic update
      post.reactionCounts[previousReaction] = Math.max(0, (post.reactionCounts[previousReaction] || 0) - 1)
      post.reactionCounts[type] = (post.reactionCounts[type] || 0) + 1
      await changeReactionType({ sessionId, post: post.id, newType: type })
    } else {
      // Add new
      post.userReaction = type // Optimistic update
      post.reactionCounts[type] = (post.reactionCounts[type] || 0) + 1
      await addReactionToPost({ sessionId, post: post.id, type })
    }
  } catch (error) {
    console.error('Failed to update reaction:', error)
    // Revert on error (simplified, ideally would revert counts too)
    post.userReaction = previousReaction 
    // Reload reactions to be safe
    try {
      const reactions = await getReactionsForPostId({ post: post.id })
      const newCounts: Record<ReactionType, number> = { LIKE: 0, LOVE: 0, CELEBRATE: 0 }
      reactions.forEach(r => {
        if (r.type in newCounts) {
          newCounts[r.type] = r.count
        }
      })
      post.reactionCounts = newCounts
    } catch (e) { /* ignore */ }
  }
}

function toggleComments(post: any) {
  post.showComments = !post.showComments
  if (post.showComments) {
    loadComments(post)
  }
}

async function loadComments(post: any) {
  post.loadingComments = true
  try {
    const response = await getCommentsForPostId({ post: post.id }) as any
    let rawComments: any[] = []

    if (response && response.length > 0 && response[0] && 'comments' in response[0]) {
      rawComments = response[0].comments
    } else if (Array.isArray(response)) {
      rawComments = response
    }

    if (rawComments.length > 0) {
      // Enrich with display names
      const enrichedComments = await Promise.all(rawComments.map(async (c) => {
        let displayName = c.author
        try {
           const profile = await getProfile({ user: c.author })
           if (profile) displayName = profile.displayName || c.author
        } catch (e) { /* ignore */ }
        return {
          ...c,
          authorDisplayName: displayName
        }
      }))
      
      post.comments = enrichedComments
    } else {
      post.comments = []
    }
  } catch (error) {
    console.error('Failed to load comments', error)
  } finally {
    post.loadingComments = false
  }
}

async function submitComment(post: any) {
  const text = post.newCommentText.trim()
  if (!text) return
  
  const sessionId = getSessionId()
  if (!sessionId) return

  try {
    await addCommentToPost({
      sessionId,
      post: post.id,
      content: text
    })
    
    post.newCommentText = ''
    await loadComments(post)
  } catch (error) {
    console.error('Failed to add comment', error)
  }
}

onMounted(() => {
  console.log('FeedPage mounted')
  const userId = getUserId()
  console.log('Current userId:', userId)
  loadPosts()
  loadFriends()
  loadPendingRequests()
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

.post-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.reactions-group {
  display: flex;
  gap: 0.5rem;
}

.reaction-btn,
.comment-btn {
  background: transparent;
  border: none;
  color: var(--btn-text);
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  border-radius: 0.25rem;
  transition: background 0.2s ease, transform 0.1s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.reaction-icon {
  font-size: 1.2rem;
}

.reaction-count {
  font-size: 0.9rem;
  color: #9ca3af;
  font-weight: 500;
}

.reaction-btn:hover,
.comment-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.reaction-btn.active {
  background: rgba(255, 255, 255, 0.15);
}

.reaction-btn.active .reaction-count {
  color: #e5e7eb;
}

.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.loading-comments,
.no-comments {
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.comments-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
}

.comment-author {
  font-weight: 600;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.comment-text {
  color: #e5e7eb;
  font-size: 0.95rem;
  line-height: 1.4;
}

.add-comment-box {
  display: flex;
  gap: 0.5rem;
}

.comment-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: #f9fafb;
  font-size: 0.95rem;
}

.comment-input:focus {
  outline: none;
  border-color: #a5b4fc;
}

.post-comment-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  border-radius: 0.5rem;
  padding: 0 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.post-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.friend-item {
  display: flex;
  align-items: center;
}

.friend-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.friend-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #f9fafb;
}

.friend-avatar.fallback {
  font-size: 0.95rem;
}

.friend-details {
  display: flex;
  flex-direction: column;
}

.friend-name {
  font-weight: 600;
  color: #e5e7eb;
}

.friend-handle {
  font-size: 0.85rem;
  color: #9ca3af;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.requester-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.request-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #f9fafb;
}

.request-avatar.fallback {
  font-size: 0.95rem;
}

.requester-name {
  font-weight: 600;
  color: #e5e7eb;
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

