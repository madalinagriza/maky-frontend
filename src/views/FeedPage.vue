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
          <div class="feed-tabs">
            <button
              type="button"
              class="feed-tab"
              :class="{ active: activeFeedTab === 'FRIENDS' }"
              @click="activeFeedTab = 'FRIENDS'"
            >
              Friends' Posts
            </button>
            <button
              type="button"
              class="feed-tab"
              :class="{ active: activeFeedTab === 'MY_PUBLIC' }"
              @click="activeFeedTab = 'MY_PUBLIC'"
            >
              My Public Posts
            </button>
          </div>

          <div
            v-if="activeFeedTab === 'MY_PUBLIC'"
            class="create-post-card"
          >
            <h2>Share a Public Update</h2>
            <form @submit.prevent="handleCreatePublicPost">
              <textarea
                v-model="publicPostContent"
                placeholder="What do you want to share?"
                required
                class="post-input"
              ></textarea>

              <div class="post-options">
                <div class="items-input-group item-search-group">
                  <div class="item-search-toggle" role="tablist" aria-label="Search items by type">
                    <button
                      type="button"
                      class="item-search-tab"
                      :class="{ active: publicItemSearchType === 'SONG' }"
                      @click="setPublicItemSearchType('SONG')"
                    >
                      Songs
                    </button>
                    <button
                      type="button"
                      class="item-search-tab"
                      :class="{ active: publicItemSearchType === 'CHORD' }"
                      @click="setPublicItemSearchType('CHORD')"
                    >
                      Chords
                    </button>
                  </div>
                  <div class="item-search-input-wrapper">
                    <input
                      v-model="publicItemSearchQuery"
                      @input="handlePublicItemSearchInput"
                      :placeholder="publicItemSearchType === 'SONG' ? 'Search songs by title or artist' : 'Search chords by name'"
                      class="item-input"
                      type="text"
                      autocomplete="off"
                    />
                    <div v-if="showPublicItemDropdown" class="search-dropdown">
                      <div v-if="isSearchingPublicItems" class="dropdown-item muted">Searching...</div>
                      <div
                        v-else-if="!publicItemSearchResults.length"
                        class="dropdown-item muted"
                      >
                        No matches yet
                      </div>
                      <button
                        v-else
                        v-for="option in publicItemSearchResults"
                        :key="option.id"
                        type="button"
                        class="dropdown-item"
                        @click="selectPublicItem(option)"
                      >
                        <span class="item-line-primary">{{ option.label }}</span>
                        <span class="item-line-secondary">{{ option.detail }}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="post-type-select">
                  <label>Type:</label>
                  <select v-model="publicPostType">
                    <option value="PROGRESS">Progress</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              <div v-if="publicPostItems.length > 0" class="new-items-list">
                <span
                  v-for="(item, index) in publicPostItems"
                  :key="`${item}-${index}`"
                  class="item-badge"
                >
                  {{ item }}
                  <button type="button" @click="removePublicItem(index)" class="remove-item-btn">&times;</button>
                </span>
              </div>

              <div class="form-actions">
                <button type="submit" :disabled="isPostingPublic" class="submit-btn">
                  {{ isPostingPublic ? 'Posting…' : 'Post Publicly' }}
                </button>
              </div>
              <div v-if="publicPostError" class="error-message">{{ publicPostError }}</div>
            </form>
          </div>

          <div v-if="feedVisibilityError && activeFeedTab === 'MY_PUBLIC'" class="error-message">
            {{ feedVisibilityError }}
          </div>

          <div v-if="isLoadingPosts" class="loading">Loading posts...</div>
          <div v-else-if="displayedPosts.length === 0" class="empty-state">{{ emptyPostsMessage }}</div>
          <div v-else class="posts-list">
            <div v-for="post in displayedPosts" :key="post.id" class="post-card">
              <div class="post-header">
                <span class="post-author">{{ post.authorDisplayName }}</span>
                <span class="post-type">{{ post.postType }}</span>
              </div>
              <p class="post-content">{{ post.content }}</p>
              <div v-if="post.items && post.items.length" class="post-items">
                <div class="items-label">Linked items:</div>
                <div class="items-list">
                  <span v-for="item in post.items" :key="item" class="item-badge">
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="post-actions-bar">
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
                  <li v-for="(comment, index) in post.comments" :key="comment.id ?? index" class="comment-item">
                    <div class="comment-header">
                      <span class="comment-author">{{ comment.authorDisplayName || comment.author }}</span>
                      <div v-if="comment.author === currentUserId" class="comment-actions">
                        <button
                          type="button"
                          class="comment-icon-btn"
                          :class="{ active: comment.isEditing }"
                          :disabled="comment.isSaving || comment.isDeleting"
                          @click="comment.isEditing ? cancelEditingComment(comment) : startEditingComment(comment)"
                          :title="comment.isEditing ? 'Cancel editing' : 'Edit comment'"
                          aria-label="Edit comment"
                        >
                          <span v-if="comment.isEditing">✖</span>
                          <span v-else>✏️</span>
                        </button>
                        <button
                          type="button"
                          class="comment-icon-btn delete"
                          :disabled="comment.isSaving || comment.isDeleting"
                          @click="deleteCommentItem(post, comment)"
                          title="Delete comment"
                          aria-label="Delete comment"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div v-if="comment.isEditing" class="comment-edit-form">
                      <input
                        v-model="comment.editDraft"
                        type="text"
                        class="comment-edit-input"
                        placeholder="Update your comment"
                        @keyup.enter.prevent="saveCommentEdit(comment)"
                        @keyup.esc.prevent="cancelEditingComment(comment)"
                      />
                      <div class="comment-edit-actions">
                        <button
                          type="button"
                          class="comment-save-btn"
                          :disabled="comment.isSaving || !(comment.editDraft || '').trim()"
                          @click="saveCommentEdit(comment)"
                        >
                          {{ comment.isSaving ? 'Saving…' : 'Save' }}
                        </button>
                        <button
                          type="button"
                          class="comment-cancel-btn"
                          :disabled="comment.isSaving"
                          @click="cancelEditingComment(comment)"
                        >
                          Discard
                        </button>
                      </div>
                      <p v-if="comment.editError" class="comment-error">{{ comment.editError }}</p>
                    </div>
                    <span v-else class="comment-text">{{ comment.content }}</span>
                    <p
                      v-if="!comment.isEditing && comment.editError"
                      class="comment-error"
                    >
                      {{ comment.editError }}
                    </p>
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
              <div
                v-if="activeFeedTab === 'MY_PUBLIC'"
                class="visibility-controls"
              >
                <span class="visibility-label">
                  Visibility: {{ (post.visibility || 'PUBLIC').toLowerCase() === 'public' ? 'Public' : 'Private' }}
                </span>
                <button
                  class="visibility-btn"
                  :disabled="changingFeedVisibilityFor === post.id"
                  @click="handleFeedVisibilityChange(post, 'PRIVATE')"
                >
                  {{ changingFeedVisibilityFor === post.id ? 'Updating…' : 'Make Private' }}
                </button>
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
  createPost,
  addReactionToPost,
  changeReactionType,
  removeReactionFromPost,
  getReactionsForPostId,
  getReactionOnPostFromUser,
  addCommentToPost,
  editComment,
  deleteComment,
  getCommentsForPostId,
  getPostsViewableToUser,
  editPostVisibility,
} from '@/services/postService'
import { getSessionId, getUserId } from '@/utils/sessionStorage'
import { searchProfilesByDisplayName, getProfile } from '@/services/userProfileService'
import { searchByTitleOrArtist } from '@/services/songService'
import { searchChordsByName } from '@/services/chordService'
import type { DisplayNameSearchResult } from '@/types/userProfile'
import type { ReactionType, PostVisibility } from '@/types/post'
import type { Song } from '@/types/song'
import type { Chord } from '@/types/chord'

interface FriendListEntry {
  id: string
  displayName?: string
  avatarUrl?: string
}

type FeedTab = 'FRIENDS' | 'MY_PUBLIC'
const ITEM_SEARCH_RESULT_LIMIT = 10

interface FeedComment {
  id?: string
  content: string
  author: string
  authorDisplayName?: string
  isEditing?: boolean
  editDraft?: string
  isSaving?: boolean
  editError?: string
  isDeleting?: boolean
  rawSource?: any
}

interface FeedPost {
  id: string
  authorId: string
  authorDisplayName: string
  content: string
  postType: string
  visibility?: PostVisibility
  items: string[]
  userReaction: ReactionType | null
  reactionCounts: Record<ReactionType, number>
  comments: FeedComment[]
  showComments: boolean
  loadingComments: boolean
  newCommentText: string
}

type ItemSuggestionType = 'SONG' | 'CHORD'

interface ItemSuggestion {
  id: string
  label: string
  detail?: string
  type: ItemSuggestionType
}

const friendSearchQuery = ref('')
const addFriendQuery = ref('')
const friends = ref<FriendListEntry[]>([])
const addFriendResults = ref<DisplayNameSearchResult[]>([])
const selectedAddFriend = ref<DisplayNameSearchResult | null>(null)
const currentUserId = ref<string | null>(getUserId() || null)
const feedPosts = ref<FeedPost[]>([])
const activeFeedTab = ref<FeedTab>('FRIENDS')
const pendingRequests = ref<Array<{ requester: string; displayName?: string; avatarUrl?: string }>>([])
const loadingFriends = ref(false)
const searchingAddFriends = ref(false)
const loadingFeedPosts = ref(false)
const loadingRequests = ref(false)
const loadingRequest = ref(false)
const addFriendError = ref('')
const publicPostContent = ref('')
const publicPostType = ref<'PROGRESS' | 'GENERAL'>('PROGRESS')
const publicPostItems = ref<string[]>([])
const publicItemSearchType = ref<ItemSuggestionType>('SONG')
const publicItemSearchQuery = ref('')
const publicItemSearchResults = ref<ItemSuggestion[]>([])
const isSearchingPublicItems = ref(false)
const isPostingPublic = ref(false)
const publicPostError = ref('')
const feedVisibilityError = ref('')
const changingFeedVisibilityFor = ref<string | null>(null)

const filteredFriends = computed(() => {
  const query = friendSearchQuery.value.trim().toLowerCase()
  if (!query) return friends.value
  return friends.value.filter(friend => {
    const name = friend.displayName || friend.id
    return name.toLowerCase().includes(query)
  })
})

const friendFeedPosts = computed(() => {
  const userId = currentUserId.value
  if (!userId) return feedPosts.value
  return feedPosts.value.filter(post => post.authorId !== userId)
})

const myPublicFeedPosts = computed(() => {
  const userId = currentUserId.value
  if (!userId) return []
  return feedPosts.value.filter(post => post.authorId === userId && (post.visibility || 'PUBLIC') === 'PUBLIC')
})

const showAddFriendDropdown = computed(() =>
  Boolean(addFriendQuery.value.trim() && (searchingAddFriends.value || addFriendResults.value.length))
)

const showPublicItemDropdown = computed(() =>
  publicItemSearchQuery.value.trim().length >= 2 &&
  (isSearchingPublicItems.value || publicItemSearchResults.value.length > 0)
)

const displayedPosts = computed(() =>
  activeFeedTab.value === 'FRIENDS' ? friendFeedPosts.value : myPublicFeedPosts.value
)

const isLoadingPosts = computed(() => loadingFeedPosts.value)

const emptyPostsMessage = computed(() =>
  activeFeedTab.value === 'FRIENDS'
    ? 'No posts from friends yet. Add friends to see their updates!'
    : 'You have not written any public posts yet. Share something!'
)

let addFriendSearchTimer: ReturnType<typeof setTimeout> | null = null
let skipNextAddFriendSearch = false
let publicItemSearchTimer: ReturnType<typeof setTimeout> | null = null

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

watch(activeFeedTab, () => {
  if (!feedPosts.value.length && !loadingFeedPosts.value) {
    loadFeedPosts()
  }
})

function extractCommentId(raw: any): string | undefined {
  if (!raw || typeof raw !== 'object') return undefined

  const directId =
    (typeof raw.comment === 'string' && raw.comment) ||
    raw.commentId ||
    raw.commentID ||
    raw.comment_id ||
    raw.commentRef ||
    raw._id ||
    raw.id ||
    raw._docId

  if (directId) return directId

  if (raw.comment && typeof raw.comment === 'object') {
    return (
      raw.comment.comment ||
      raw.comment.commentId ||
      raw.comment.commentID ||
      raw.comment.comment_id ||
      raw.comment._id ||
      raw.comment.id ||
      raw.comment._docId ||
      undefined
    )
  }

  return undefined
}

function resolveCommentIdentifier(comment: FeedComment): string | undefined {
  return (
    comment.id ||
    extractCommentId(comment.rawSource) ||
    (comment as any)?.comment ||
    (comment as any)?.commentId ||
    (comment as any)?.comment_id ||
    (comment as any)?._id ||
    (comment as any)?.id ||
    (comment as any)?._docId ||
    undefined
  )
}

async function enrichComments(rawComments: any[]): Promise<FeedComment[]> {
  const sessionId = getSessionId()
  return Promise.all(
    rawComments.map(async raw => {
      let displayName = raw.author
      if (sessionId) {
        try {
          const profile = await getProfile({ sessionId, user: raw.author })
          if (profile?.displayName) {
            displayName = profile.displayName
          }
        } catch (e) {
          console.error('Failed to load commenter profile:', e)
        }
      }

      const identifier = extractCommentId(raw)
      if (!identifier) {
        console.warn('FeedPage: missing comment identifier for payload', raw)
      }

      return {
        id: identifier,
        content: raw.content,
        author: raw.author,
        authorDisplayName: raw.authorDisplayName || displayName,
        isEditing: false,
        editDraft: '',
        isSaving: false,
        editError: '',
        isDeleting: false,
        rawSource: raw,
      }
    })
  )
}

async function mapPostItem(item: any, currentUserId: string): Promise<FeedPost> {
  const postId = item.post._id
  const authorId = item.post.author
  let authorDisplayName = authorId
  const sessionId = getSessionId()

  if (sessionId) {
    try {
      const profile = await getProfile({ sessionId, user: authorId })
      if (profile && profile.displayName) {
        authorDisplayName = profile.displayName
      }
    } catch (e) {
      console.error(`Failed to load profile for post author ${authorId}`, e)
    }
  }

  const reactionCounts: Record<ReactionType, number> = { LIKE: 0, LOVE: 0, CELEBRATE: 0 }
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
    const myReaction = await getReactionOnPostFromUser({ user: currentUserId, post: postId })
    if (Array.isArray(myReaction)) {
      const active = myReaction.find(r => Number(r.count) > 0)
      if (active) {
        userReaction = active.type as ReactionType
      }
    }
  } catch (e) {
    console.error(`Failed to load user reaction for post ${postId}`, e)
  }

  let comments: FeedComment[] = []
  try {
    const commentsResponse = await getCommentsForPostId({ post: postId }) as any
    let rawComments: any[] = []
    if (commentsResponse && commentsResponse.length > 0 && commentsResponse[0] && 'comments' in commentsResponse[0]) {
      rawComments = commentsResponse[0].comments
    } else if (Array.isArray(commentsResponse)) {
      rawComments = commentsResponse
    }
    if (rawComments.length) {
      comments = await enrichComments(rawComments)
    }
  } catch (e) {
    console.error(`Failed to load comments for post ${postId}`, e)
  }

  return {
    id: postId,
    authorId,
    authorDisplayName,
    content: item.post.content,
    postType: item.post.postType,
    items: Array.isArray(item.post.items) ? item.post.items.filter(Boolean) : [],
    visibility: item.post.visibility,
    userReaction,
    reactionCounts,
    comments,
    showComments: false,
    loadingComments: false,
    newCommentText: '',
  }
}

async function loadFeedPosts() {
  loadingFeedPosts.value = true
  try {
    const userId = getUserId()
    const sessionId = getSessionId()
    if (!userId || !sessionId) {
      feedPosts.value = []
      return
    }

    const response = await getPostsViewableToUser({ sessionId, user: userId })
    const mappedPosts = await Promise.all(response.map(item => mapPostItem(item, userId)))
    feedPosts.value = mappedPosts
  } catch (error) {
    console.error('Failed to load feed posts:', error)
    feedPosts.value = []
  } finally {
    loadingFeedPosts.value = false
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

function removePublicItem(index: number) {
  publicPostItems.value.splice(index, 1)
}

function setPublicItemSearchType(type: ItemSuggestionType) {
  if (publicItemSearchType.value === type) return
  publicItemSearchType.value = type
  publicItemSearchQuery.value = ''
  publicItemSearchResults.value = []
  if (publicItemSearchTimer) {
    clearTimeout(publicItemSearchTimer)
    publicItemSearchTimer = null
  }
}

function handlePublicItemSearchInput() {
  if (publicItemSearchTimer) {
    clearTimeout(publicItemSearchTimer)
    publicItemSearchTimer = null
  }

  if (publicItemSearchQuery.value.trim().length < 2) {
    publicItemSearchResults.value = []
    return
  }

  publicItemSearchTimer = setTimeout(() => {
    executePublicItemSearch(publicItemSearchQuery.value.trim())
  }, 250)
}

async function executePublicItemSearch(term: string) {
  isSearchingPublicItems.value = true
  try {
    if (publicItemSearchType.value === 'SONG') {
      const responses = await searchByTitleOrArtist({ query: term })
      const songs = responses
        .map(result => result.song)
        .filter((song): song is Song => Boolean(song && song._id))
      publicItemSearchResults.value = songs.slice(0, ITEM_SEARCH_RESULT_LIMIT).map(song => ({
        id: song._id,
        label: `${song.title} by ${song.artist}`,
        detail: 'Song',
        type: 'SONG',
      }))
    } else {
      const chords = await searchChordsByName(term)
      publicItemSearchResults.value = chords.slice(0, ITEM_SEARCH_RESULT_LIMIT).map((chord: Chord) => ({
        id: chord._id,
        label: chord.name,
        detail: chord.notes?.length ? chord.notes.join(', ') : 'Chord',
        type: 'CHORD',
      }))
    }
  } catch (error) {
    console.error('Failed to search items for post:', error)
    publicItemSearchResults.value = []
  } finally {
    isSearchingPublicItems.value = false
  }
}

function selectPublicItem(option: ItemSuggestion) {
  const prefix = option.type === 'SONG' ? 'Song' : 'Chord'
  const label = `${prefix}: ${option.label}`
  if (!publicPostItems.value.includes(label)) {
    publicPostItems.value.push(label)
  }
  publicItemSearchQuery.value = ''
  publicItemSearchResults.value = []
  if (publicItemSearchTimer) {
    clearTimeout(publicItemSearchTimer)
    publicItemSearchTimer = null
  }
}

async function handleCreatePublicPost() {
  publicPostError.value = ''
  if (!publicPostContent.value.trim()) return

  const sessionId = getSessionId()
  if (!sessionId) {
    publicPostError.value = 'You must be logged in to post.'
    return
  }

  isPostingPublic.value = true
  try {
    await createPost({
      sessionId,
      content: publicPostContent.value,
      postType: publicPostType.value,
      items: publicPostItems.value,
      visibility: 'PUBLIC',
    })

    publicPostContent.value = ''
    publicPostItems.value = []
    publicPostType.value = 'PROGRESS'
    publicItemSearchQuery.value = ''
    publicItemSearchResults.value = []

    await loadFeedPosts()
  } catch (error: any) {
    console.error('Failed to create public post:', error)
    publicPostError.value = error.message || 'Failed to create post'
  } finally {
    isPostingPublic.value = false
  }
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
    const sessionId = getSessionId()
    console.log('loadFriends userId:', userId)
    if (!userId || !sessionId) {
      console.log('No userId, skipping loadFriends')
      friends.value = []
      return
    }

    console.log('Calling getFriends API...')
    const friendIds = await getFriends({ sessionId, user: userId })
    console.log('getFriends result:', friendIds)
    const enrichedFriends = await Promise.all(
      friendIds.map(async (friendId: string) => {
        try {
          const profile = await getProfile({ sessionId, user: friendId })
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
    const sessionId = getSessionId()
    if (!userId || !sessionId) {
      pendingRequests.value = []
      return
    }

    const pending = await getPendingFriendships({ sessionId, user: userId })
    const enriched = await Promise.all(
      pending.map(async request => {
        try {
          const profile = await getProfile({ sessionId, user: request.requester })
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

async function handleFeedVisibilityChange(post: FeedPost, nextVisibility: PostVisibility) {
  feedVisibilityError.value = ''
  const sessionId = getSessionId()
  if (!sessionId) {
    feedVisibilityError.value = 'You must be logged in to change visibility.'
    return
  }

  changingFeedVisibilityFor.value = post.id
  try {
    await editPostVisibility({
      sessionId,
      postId: post.id,
      newVisibility: nextVisibility,
    })

    await loadFeedPosts()
  } catch (error: any) {
    console.error('Failed to change post visibility:', error)
    feedVisibilityError.value = error.message || 'Failed to change visibility'
  } finally {
    changingFeedVisibilityFor.value = null
  }
}

async function loadComments(post: FeedPost) {
  post.loadingComments = true
  try {
    const response = await getCommentsForPostId({ post: post.id }) as any
    let rawComments: any[] = []

    if (response && response.length > 0 && response[0] && 'comments' in response[0]) {
      rawComments = response[0].comments
    } else if (Array.isArray(response)) {
      rawComments = response
    }

    post.comments = rawComments.length > 0 ? await enrichComments(rawComments) : []
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

function startEditingComment(comment: FeedComment) {
  comment.isEditing = true
  comment.editDraft = comment.content
  comment.editError = ''
}

function cancelEditingComment(comment: FeedComment) {
  comment.isEditing = false
  comment.editDraft = ''
  comment.editError = ''
}

async function saveCommentEdit(comment: FeedComment) {
  comment.editError = ''
  const trimmed = (comment.editDraft || '').trim()
  if (!trimmed) {
    comment.editError = 'Comment cannot be empty.'
    return
  }

  const sessionId = getSessionId()
  if (!sessionId) {
    comment.editError = 'You must be logged in to edit comments.'
    return
  }

  const commentId = resolveCommentIdentifier(comment)
  if (!commentId) {
    comment.editError = 'Unable to edit this comment (missing identifier).'
    return
  }

  comment.isSaving = true
  try {
    await editComment({
      sessionId,
      comment: commentId,
      newContent: trimmed,
    })

    comment.content = trimmed
    comment.isEditing = false
    comment.editDraft = ''
  } catch (error: any) {
    console.error('Failed to edit comment', error)
    comment.editError = error?.message || 'Failed to edit comment.'
  } finally {
    comment.isSaving = false
  }
}

async function deleteCommentItem(post: FeedPost, comment: FeedComment) {
  comment.editError = ''
  if (comment.isDeleting) return

  const commentId = resolveCommentIdentifier(comment)
  if (!commentId) {
    comment.editError = 'Unable to delete this comment (missing identifier).'
    return
  }

  const confirmation = window.confirm('Are you sure you want to delete this comment?')
  if (!confirmation) return

  const sessionId = getSessionId()
  if (!sessionId) {
    comment.editError = 'You must be logged in to delete comments.'
    return
  }

  comment.isDeleting = true
  try {
    await deleteComment({ sessionId, comment: commentId })
    post.comments = post.comments.filter(entry => entry !== comment)
  } catch (error: any) {
    console.error('Failed to delete comment', error)
    comment.editError = error?.message || 'Failed to delete comment.'
  } finally {
    comment.isDeleting = false
    if (comment.isEditing) {
      comment.isEditing = false
      comment.editDraft = ''
    }
  }
}

onMounted(() => {
  console.log('FeedPage mounted')
  const userId = getUserId()
  console.log('Current userId:', userId)
  currentUserId.value = userId || null
  loadFeedPosts()
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

.posts-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.feed-tabs {
  display: inline-flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.feed-tab {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #e5e7eb;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.feed-tab.active {
  background: var(--button);
  border-color: var(--button);
  color: var(--btn-text);
}

.create-post-card {
  background: var(--card);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 1rem;
  padding: 1.5rem;
}

.post-input {
  width: 100%;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  color: #e5e7eb;
  resize: vertical;
  margin-bottom: 1rem;
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

.post-items {
  margin: 0.75rem 0 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.items-label {
  font-size: 0.85rem;
  color: #9ca3af;
}

.items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.item-badge {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  padding: 0.2rem 0.75rem;
  font-size: 0.85rem;
  color: #e5e7eb;
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
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: #fca5a5;
  margin-top: 0.5rem;
  font-size: 0.85rem;
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

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.comment-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.comment-author {
  font-weight: 600;
  font-size: 0.85rem;
  color: #a5b4fc;
}

.comment-icon-btn {
  border: none;
  background: transparent;
  color: #f3f4f6;
  padding: 0.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  cursor: pointer;
  transition: color 0.2s ease, transform 0.1s ease;
}

.comment-icon-btn:hover:not(:disabled) {
  color: #ffffff;
  transform: translateY(-1px);
}

.comment-icon-btn.delete:hover:not(:disabled) {
  color: #fca5a5;
}

.comment-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comment-text {
  color: #e5e7eb;
  font-size: 0.95rem;
  line-height: 1.4;
}

.comment-edit-btn,
.comment-save-btn,
.comment-cancel-btn {
  border: none;
  border-radius: 0.35rem;
  padding: 0.3rem 0.75rem;
  font-size: 0.8rem;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
  color: #f3f4f6;
}

.comment-edit-btn:hover,
.comment-save-btn:hover,
.comment-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

.comment-edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-edit-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.4rem;
  padding: 0.45rem 0.6rem;
  color: #f3f4f6;
}

.comment-edit-input:focus {
  outline: none;
  border-color: #a5b4fc;
}

.comment-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.comment-save-btn {
  background: var(--button);
  color: var(--btn-text);
}

.comment-cancel-btn {
  background: rgba(255, 255, 255, 0.08);
}

.comment-save-btn:disabled,
.comment-cancel-btn:disabled,
.comment-edit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-error {
  color: #fca5a5;
  font-size: 0.8rem;
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

