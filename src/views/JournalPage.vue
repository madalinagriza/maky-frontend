<template>
  <Layout>
    <div class="journal-container">
      <p class="eyebrow">Personal</p>
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

                <div class="post-visibility-toggle">
                  <label>Visibility:</label>
                  <div class="visibility-toggle-group" role="group" aria-label="Choose post visibility">
                    <button
                      type="button"
                      class="visibility-toggle-btn"
                      :class="{ active: newPostVisibility === 'PRIVATE' }"
                      @click="setNewPostVisibility('PRIVATE')"
                    >
                      Private
                    </button>
                    <button
                      type="button"
                      class="visibility-toggle-btn"
                      :class="{ active: newPostVisibility === 'PUBLIC' }"
                      :disabled="!canMakePostsPublic"
                      @click="setNewPostVisibility('PUBLIC')"
                      :title="!canMakePostsPublic ? 'Your account type only allows private posts' : 'Share this post publicly'"
                    >
                      Public
                    </button>
                  </div>
                </div>
              </div>

              <p v-if="!canMakePostsPublic" class="visibility-hint">
                Public posts are disabled for your account type.
              </p>

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

          <div class="posts-section-header">
            <h2>My Posts</h2>
            <div class="post-filter-toggle" role="group" aria-label="Filter journal posts">
              <button
                type="button"
                class="filter-btn"
                :class="{ active: postFilterMode === 'ALL' }"
                :aria-pressed="postFilterMode === 'ALL'"
                @click="setPostFilterMode('ALL')"
              >
                All posts
              </button>
              <button
                type="button"
                class="filter-btn"
                :class="{ active: postFilterMode === 'PRIVATE' }"
                :aria-pressed="postFilterMode === 'PRIVATE'"
                @click="setPostFilterMode('PRIVATE')"
              >
                Private only
              </button>
            </div>
          </div>
          <div v-if="visibilityError" class="error-message">{{ visibilityError }}</div>
          <div v-if="loadingPosts" class="loading">Loading posts...</div>
          <div v-else-if="posts.length === 0" class="empty-state">You haven't posted anything yet.</div>
          <div v-else class="posts-list">
            <div v-for="post in posts" :key="post._id" class="post-card">
              <div class="post-header">
                <div class="post-meta">
                  <span
                    :class="['post-type', post.postType?.toUpperCase() === 'GENERAL' ? 'general' : 'progress']"
                  >
                    {{ formatPostTypeLabel(post.postType) }}
                  </span>
                  <span class="post-date">{{ formatDate(post.createdAt) }}</span>
                </div>
                <div class="post-owner-actions">
                  <button
                    type="button"
                    class="post-icon-btn"
                    :class="{ active: post.isEditing }"
                    :disabled="post.isSavingEdit || post.isDeleting"
                    @click="post.isEditing ? cancelEditingPost(post) : startEditingPost(post)"
                    :title="post.isEditing ? 'Cancel editing' : 'Edit post'"
                    aria-label="Edit post"
                  >
                    <span v-if="post.isEditing">✖</span>
                    <span v-else>✏️</span>
                  </button>
                  <button
                    type="button"
                    class="post-icon-btn delete"
                    :disabled="post.isSavingEdit || post.isDeleting"
                    @click="deletePostItem(post)"
                    title="Delete post"
                    aria-label="Delete post"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div v-if="post.isEditing" class="post-edit-form">
                <textarea
                  v-model="post.editDraft"
                  class="post-edit-textarea"
                  placeholder="Update your post"
                ></textarea>
                <div class="post-edit-items">
                  <div class="items-input-group item-search-group">
                    <div class="item-search-toggle" role="tablist" aria-label="Search edit items by type">
                      <button
                        type="button"
                        class="item-search-tab"
                        :class="{ active: post.editItemSearchType === 'SONG' }"
                        @click="setEditItemSearchTypeForPost(post, 'SONG')"
                      >
                        Songs
                      </button>
                      <button
                        type="button"
                        class="item-search-tab"
                        :class="{ active: post.editItemSearchType === 'CHORD' }"
                        @click="setEditItemSearchTypeForPost(post, 'CHORD')"
                      >
                        Chords
                      </button>
                    </div>
                    <div class="item-search-input-wrapper">
                      <input
                        v-model="post.editItemSearchQuery"
                        @input="handleEditItemSearchInputForPost(post)"
                        :placeholder="post.editItemSearchType === 'SONG' ? 'Search songs by title or artist' : 'Search chords by name'"
                        class="item-input"
                        type="text"
                        autocomplete="off"
                      />
                      <div
                        v-if="post.editItemSearchQuery.trim().length >= 2 && (post.isSearchingEditItems || post.editItemSearchResults.length > 0)"
                        class="search-dropdown"
                      >
                        <div v-if="post.isSearchingEditItems" class="dropdown-item muted">Searching...</div>
                        <div v-else-if="!post.editItemSearchResults.length" class="dropdown-item muted">No matches yet</div>
                        <button
                          v-else
                          v-for="option in post.editItemSearchResults"
                          :key="option.id"
                          type="button"
                          class="dropdown-item"
                          @click="selectEditItem(post, option)"
                        >
                          <span class="item-line-primary">{{ option.label }}</span>
                          <span class="item-line-secondary">{{ option.detail }}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div v-if="post.editItems.length" class="new-items-list">
                    <span
                      v-for="(item, index) in post.editItems"
                      :key="`${item}-${index}`"
                      class="item-badge"
                    >
                      {{ item }}
                      <button type="button" class="remove-item-btn" @click="removeEditItem(post, index)">
                        &times;
                      </button>
                    </span>
                  </div>
                </div>
                <div class="post-edit-actions">
                  <button
                    type="button"
                    class="post-edit-save-btn"
                    :disabled="post.isSavingEdit || !(post.editDraft || '').trim()"
                    @click="savePostEdit(post)"
                  >
                    {{ post.isSavingEdit ? 'Saving…' : 'Save' }}
                  </button>
                  <button
                    type="button"
                    class="post-edit-cancel-btn"
                    :disabled="post.isSavingEdit"
                    @click="cancelEditingPost(post)"
                  >
                    Discard
                  </button>
                </div>
                <p v-if="post.editError" class="post-error">{{ post.editError }}</p>
              </div>
              <p v-else class="post-content">{{ post.content }}</p>
              <p v-if="!post.isEditing && post.editError" class="post-error">{{ post.editError }}</p>
              <div v-if="post.items && post.items.length > 0" class="post-items">
                <div class="items-label">Linked items:</div>
                <div class="items-list">
                  <span v-for="item in post.items" :key="item" class="item-badge">
                    {{ item }}
                  </span>
                </div>
              </div>
              <div class="post-actions">
                <button @click="toggleComments(post)" class="comment-btn">
                  💬 Comments
                  <span v-if="post.comments.length > 0" class="reaction-count">{{ post.comments.length }}</span>
                </button>
              </div>
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
                    <p v-if="!comment.isEditing && comment.editError" class="comment-error">
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
                <button
                  v-else-if="(post.visibility || 'PRIVATE') === 'PUBLIC'"
                  class="visibility-btn"
                  :disabled="changingVisibilityFor === post._id"
                  @click="handleVisibilityChange(post, 'PRIVATE')"
                >
                  {{ changingVisibilityFor === post._id ? 'Updating…' : 'Make Private' }}
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
import { ref, onMounted, computed, watch } from 'vue'
import Layout from '@/components/Layout.vue'
import { getSongsInProgress } from '@/services/songLibraryService'
import { getKnownChords } from '@/services/chordLibraryService'
import {
  createPost,
  getPersonalPrivatePosts,
  getAllPersonalPosts,
  editPostVisibility,
  addCommentToPost,
  getCommentsForPostId,
  editComment,
  deleteComment,
  editPost,
  deletePost,
} from '@/services/postService'
import { searchByTitleOrArtist } from '@/services/songService'
import { searchChordsByName } from '@/services/chordService'
import { getUserId, getSessionId } from '@/utils/sessionStorage'
import { useAuth } from '@/composables/useAuth'
import { getProfile } from '@/services/userProfileService'
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

interface JournalComment {
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

interface JournalPost extends Post {
  comments: JournalComment[]
  showComments: boolean
  loadingComments: boolean
  newCommentText: string
  isEditing: boolean
  editDraft: string
  editItems: string[]
  editError: string
  isSavingEdit: boolean
  isDeleting: boolean
  editItemSearchType: ItemSuggestionType
  editItemSearchQuery: string
  editItemSearchResults: ItemSuggestion[]
  isSearchingEditItems: boolean
}

const ITEM_SEARCH_RESULT_LIMIT = 10

const posts = ref<JournalPost[]>([])
const songs = ref<SongProgress[]>([])
const chords = ref<Array<{ chord: string; mastery: string }>>([])
const loadingPosts = ref(false)
const loadingSongs = ref(false)
const loadingChords = ref(false)
const postFilterMode = ref<'ALL' | 'PRIVATE'>('ALL')

// Create Post State
const newPostContent = ref('')
const newPostType = ref<'PROGRESS' | 'GENERAL'>('PROGRESS')
const newPostItems = ref<string[]>([])
const newPostVisibility = ref<PostVisibility>('PRIVATE')
const itemSearchType = ref<ItemSuggestionType>('SONG')
const itemSearchQuery = ref('')
const itemSearchResults = ref<ItemSuggestion[]>([])
const isSearchingItems = ref(false)
const isPosting = ref(false)
const createPostError = ref('')
const visibilityError = ref('')
const changingVisibilityFor = ref<string | null>(null)
const currentUserId = ref<string | null>(getUserId() || null)
const editItemSearchTimers: Record<string, ReturnType<typeof setTimeout> | null> = {}

const { kidOrPrivateStatus, refreshKidOrPrivateStatus } = useAuth()
const canMakePostsPublic = computed(() => kidOrPrivateStatus.value !== true)
const showItemSearchDropdown = computed(() =>
  itemSearchQuery.value.trim().length >= 2 &&
  (isSearchingItems.value || itemSearchResults.value.length > 0)
)

watch(canMakePostsPublic, allowed => {
  if (!allowed && newPostVisibility.value === 'PUBLIC') {
    newPostVisibility.value = 'PRIVATE'
  }
})

let itemSearchTimer: ReturnType<typeof setTimeout> | null = null

function setPostFilterMode(mode: 'ALL' | 'PRIVATE') {
  if (postFilterMode.value === mode) return
  postFilterMode.value = mode
  loadPosts()
}

function setNewPostVisibility(visibility: PostVisibility) {
  if (visibility === 'PUBLIC' && !canMakePostsPublic.value) return
  newPostVisibility.value = visibility
}

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

function clearEditItemSearchTimer(postId: string) {
  const timer = editItemSearchTimers[postId]
  if (timer) {
    clearTimeout(timer)
    editItemSearchTimers[postId] = null
  }
}

function setEditItemSearchTypeForPost(post: JournalPost, type: ItemSuggestionType) {
  if (post.editItemSearchType === type) return
  post.editItemSearchType = type
  post.editItemSearchQuery = ''
  post.editItemSearchResults = []
  clearEditItemSearchTimer(post._id)
}

function handleEditItemSearchInputForPost(post: JournalPost) {
  clearEditItemSearchTimer(post._id)

  if (post.editItemSearchQuery.trim().length < 2) {
    post.editItemSearchResults = []
    return
  }

  editItemSearchTimers[post._id] = setTimeout(() => {
    executeEditItemSearch(post, post.editItemSearchQuery.trim())
  }, 250)
}

async function executeEditItemSearch(post: JournalPost, term: string) {
  post.isSearchingEditItems = true
  try {
    if (post.editItemSearchType === 'SONG') {
      const responses = await searchByTitleOrArtist({ query: term })
      const songs = responses
        .map(result => result.song)
        .filter((song): song is Song => Boolean(song && song._id))
      post.editItemSearchResults = songs.slice(0, ITEM_SEARCH_RESULT_LIMIT).map(song => ({
        id: song._id,
        label: `${song.title} by ${song.artist}`,
        detail: 'Song',
        type: 'SONG',
      }))
    } else {
      const chords = await searchChordsByName(term)
      post.editItemSearchResults = chords.slice(0, ITEM_SEARCH_RESULT_LIMIT).map((chord: Chord) => ({
        id: chord._id,
        label: chord.name,
        detail: chord.notes?.length ? chord.notes.join(', ') : 'Chord',
        type: 'CHORD',
      }))
    }
  } catch (error) {
    console.error('Failed to search items while editing journal post:', error)
    post.editItemSearchResults = []
  } finally {
    post.isSearchingEditItems = false
  }
}

function selectEditItem(post: JournalPost, option: ItemSuggestion) {
  const prefix = option.type === 'SONG' ? 'Song' : 'Chord'
  const label = `${prefix}: ${option.label}`
  if (!post.editItems.includes(label)) {
    post.editItems.push(label)
  }
  post.editItemSearchQuery = ''
  post.editItemSearchResults = []
  clearEditItemSearchTimer(post._id)
}

function removeEditItem(post: JournalPost, index: number) {
  post.editItems.splice(index, 1)
}

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

function resolveCommentIdentifier(comment: JournalComment): string | undefined {
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

async function enrichComments(rawComments: any[]): Promise<JournalComment[]> {
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
        } catch (error) {
          console.error('Failed to load profile for comment author:', error)
        }
      }

      const identifier = extractCommentId(raw)
      if (!identifier) {
        console.warn('JournalPage: missing comment identifier', raw)
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
      visibility: newPostVisibility.value,
    })

    // Reset form
    newPostContent.value = ''
    newPostItems.value = []
    newPostType.value = 'PROGRESS'
    newPostVisibility.value = 'PRIVATE'
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

async function handleVisibilityChange(post: JournalPost, nextVisibility: PostVisibility) {
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

function toggleComments(post: JournalPost) {
  post.showComments = !post.showComments
  if (post.showComments) {
    loadComments(post)
  }
}

async function loadComments(post: JournalPost) {
  post.loadingComments = true
  try {
    const response = await getCommentsForPostId({ post: post._id }) as any
    let rawComments: any[] = []

    if (response && response.length > 0 && response[0] && 'comments' in response[0]) {
      rawComments = response[0].comments
    } else if (Array.isArray(response)) {
      rawComments = response
    }

    post.comments = rawComments.length > 0 ? await enrichComments(rawComments) : []
  } catch (error) {
    console.error('Failed to load comments for journal post:', error)
  } finally {
    post.loadingComments = false
  }
}

async function submitComment(post: JournalPost) {
  const text = post.newCommentText.trim()
  if (!text) return

  const sessionId = getSessionId()
  if (!sessionId) return

  try {
    await addCommentToPost({
      sessionId,
      post: post._id,
      content: text,
    })
    post.newCommentText = ''
    await loadComments(post)
  } catch (error) {
    console.error('Failed to add comment to journal post:', error)
  }
}

function startEditingComment(comment: JournalComment) {
  comment.isEditing = true
  comment.editDraft = comment.content
  comment.editError = ''
}

function cancelEditingComment(comment: JournalComment) {
  comment.isEditing = false
  comment.editDraft = ''
  comment.editError = ''
}

async function saveCommentEdit(comment: JournalComment) {
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
    console.error('Failed to edit journal comment:', error)
    comment.editError = error?.message || 'Failed to edit comment.'
  } finally {
    comment.isSaving = false
  }
}

async function deleteCommentItem(post: JournalPost, comment: JournalComment) {
  comment.editError = ''
  if (comment.isDeleting) return

  const identifier = resolveCommentIdentifier(comment)
  if (!identifier) {
    comment.editError = 'Unable to delete this comment (missing identifier).'
    return
  }

  const confirmed = window.confirm('Are you sure you want to delete this comment?')
  if (!confirmed) return

  const sessionId = getSessionId()
  if (!sessionId) {
    comment.editError = 'You must be logged in to delete comments.'
    return
  }

  comment.isDeleting = true
  try {
    await deleteComment({ sessionId, comment: identifier })
    post.comments = post.comments.filter(entry => entry !== comment)
  } catch (error: any) {
    console.error('Failed to delete journal comment:', error)
    comment.editError = error?.message || 'Failed to delete comment.'
  } finally {
    comment.isDeleting = false
    if (comment.isEditing) {
      comment.isEditing = false
      comment.editDraft = ''
    }
  }
}

function startEditingPost(post: JournalPost) {
  if (post.isDeleting) return
  post.isEditing = true
  post.editDraft = post.content
  post.editItems = [...(post.items ?? [])]
  post.editItemSearchType = 'SONG'
  post.editItemSearchQuery = ''
  post.editItemSearchResults = []
  post.editError = ''
  post.isSearchingEditItems = false
  clearEditItemSearchTimer(post._id)
}

function cancelEditingPost(post: JournalPost) {
  if (post.isSavingEdit) return
  post.isEditing = false
  post.editDraft = ''
  post.editItems = [...(post.items ?? [])]
  post.editItemSearchQuery = ''
  post.editItemSearchResults = []
  post.editError = ''
  post.isSearchingEditItems = false
  clearEditItemSearchTimer(post._id)
}

async function savePostEdit(post: JournalPost) {
  post.editError = ''
  const trimmed = (post.editDraft || '').trim()
  if (!trimmed) {
    post.editError = 'Post cannot be empty.'
    return
  }

  const sessionId = getSessionId()
  if (!sessionId) {
    post.editError = 'You must be logged in to edit posts.'
    return
  }

  clearEditItemSearchTimer(post._id)
  post.isSavingEdit = true
  try {
    await editPost({
      sessionId,
      postId: post._id,
      newContent: trimmed,
      newItems: post.editItems,
      newPostType: 'UNDEFINED',
    })

    post.content = trimmed
    post.items = [...post.editItems]
    post.isEditing = false
    post.editDraft = ''
    post.editItemSearchQuery = ''
    post.editItemSearchResults = []
  } catch (error: any) {
    console.error('Failed to edit journal post', error)
    post.editError = error?.message || 'Failed to edit post.'
  } finally {
    post.isSavingEdit = false
  }
}

async function deletePostItem(post: JournalPost) {
  post.editError = ''
  if (post.isDeleting) return

  const sessionId = getSessionId()
  if (!sessionId) {
    post.editError = 'You must be logged in to delete posts.'
    return
  }

  const confirmed = window.confirm('Are you sure you want to delete this post?')
  if (!confirmed) return

  post.isDeleting = true
  try {
    await deletePost({ sessionId, postId: post._id })
    posts.value = posts.value.filter(entry => entry._id !== post._id)
  } catch (error: any) {
    console.error('Failed to delete journal post', error)
    post.editError = error?.message || 'Failed to delete post.'
  } finally {
    post.isDeleting = false
    if (post.isEditing) {
      post.isEditing = false
      post.editDraft = ''
    }
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

    const payload = { sessionId, user: userId }
    const response =
      postFilterMode.value === 'PRIVATE'
        ? await getPersonalPrivatePosts(payload)
        : await getAllPersonalPosts(payload)
    posts.value = response.map(item => ({
      ...item.post,
      items: Array.isArray(item.post.items) ? item.post.items.filter(Boolean) : [],
      comments: [],
      showComments: false,
      loadingComments: false,
      newCommentText: '',
      isEditing: false,
      editDraft: '',
      editItems: Array.isArray(item.post.items) ? item.post.items.filter(Boolean) : [],
      editError: '',
      isSavingEdit: false,
      isDeleting: false,
      editItemSearchType: 'SONG',
      editItemSearchQuery: '',
      editItemSearchResults: [],
      isSearchingEditItems: false,
    }))
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

function formatPostTypeLabel(type?: string | null) {
  if (!type) return 'Progress'
  return type.toUpperCase() === 'GENERAL' ? 'General' : 'Progress'
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
  currentUserId.value = getUserId() || null
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

/* h1 styling is now standardized in style.css */

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
  font-size: var(--font-size-xl);
  margin: 0 0 1rem;
  color: var(--contrast-mid);
}

.posts-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.post-filter-toggle {
  display: inline-flex;
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.filter-btn {
  padding: 0.35rem 0.9rem;
  background: transparent;
  border: none;
  color: var(--contrast-mid);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.filter-btn.active {
  background: var(--button);
  color: var(--button-text);
}

.posts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.create-post-card {
  background: var(--card);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.post-input {
  width: 100%;
  min-height: 100px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 1rem;
  color: var(--text-secondary);
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
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  overflow: hidden;
  background: var(--bg-card);
}

.item-search-tab {
  background: transparent;
  border: none;
  color: var(--contrast-mid);
  padding: 0.35rem 0.85rem;
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: background 0.2s ease, color 0.2s ease;
}

.item-search-tab.active {
  background: var(--button);
  color: var(--button-text);
}

.item-search-input-wrapper {
  position: relative;
}

.item-input {
  flex: 1;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  color: var(--text-primary);
  transition: border-color 0.2s ease;
}

.item-input:focus {
  outline: none;
  border-color: var(--button);
}

.post-type-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--contrast-top);
}

.post-type-select label {
  font-weight: var(--font-weight-semibold);
}

.post-type-select select {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.45rem 0.75rem;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.post-type-select select:focus {
  outline: none;
  border-color: var(--button);
  box-shadow: 0 0 0 2px var(--button-bg-medium);
}

.post-visibility-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--contrast-top);
  flex-wrap: wrap;
}

.post-visibility-toggle {
  border-radius: 0.5rem;
  padding: 0.75rem;
  background: var(--bg-card);
}

.post-visibility-toggle label {
  font-weight: var(--font-weight-semibold);
  margin-bottom: 0.5rem;
  display: block;
}

.visibility-toggle-group {
  display: inline-flex;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  overflow: hidden;
  background: var(--bg-secondary);
}

.visibility-toggle-btn {
  background: transparent;
  border: none;
  color: var(--contrast-mid);
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease, color 0.2s ease;
}

.visibility-toggle-btn.active {
  background: var(--button);
  color: var(--button-text);
}

.visibility-toggle-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.visibility-hint {
  font-size: 0.8rem;
  color: var(--error);
  margin-top: -0.35rem;
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
  border: 1px solid var(--border);
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
  background: var(--border-light);
}

.dropdown-item.muted {
  cursor: default;
  color: var(--text-muted);
}

.dropdown-item .item-line-primary {
  display: block;
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.dropdown-item .item-line-secondary {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  background: var(--button);
  color: var(--button-text);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.2s;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  color: var(--error);
  margin-top: 1rem;
  font-size: var(--font-size-sm);
}

.post-card {
  background: var(--card);
  border: 1px solid var(--border-light);
  border-radius: 1rem;
  padding: 1.5rem;
}

.post-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.post-meta {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.post-owner-actions {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.post-actions {
  display: flex;
  justify-content: flex-start;
  margin-top: 1rem;
  border-top: 1px solid var(--border-light);
  padding-top: 0.75rem;
}

.post-edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.post-edit-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.post-edit-textarea {
  width: 100%;
  min-height: 120px;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  color: var(--text-secondary);
  resize: vertical;
}

.post-edit-textarea:focus {
  outline: none;
  border-color: var(--main);
}

.post-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.post-edit-save-btn,
.post-edit-cancel-btn {
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.9rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
}

.post-edit-save-btn {
  background: var(--main);
  color: var(--button-text);
}

.post-edit-cancel-btn {
  background: var(--border-light);
  color: var(--text-secondary);
}

.post-edit-save-btn:disabled,
.post-edit-cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-error {
  color: var(--error);
  font-size: var(--font-size-sm);
  margin-top: 0.25rem;
}

.comment-btn {
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--font-size-base);
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
  transition: background 0.2s ease;
}

.comment-btn:hover {
  background: var(--border-light);
}

.reaction-count {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.post-icon-btn {
  border: none;
  background: transparent;
  color: var(--text-primary);
  padding: 0.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: color 0.2s ease, transform 0.1s ease;
}

.post-icon-btn:hover:not(:disabled) {
  color: var(--button-text);
  transform: translateY(-1px);
}

.post-icon-btn.delete:hover:not(:disabled) {
  color: var(--error);
}

.post-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.post-type {
  display: inline-flex;
  align-items: center;
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  border-radius: 999px;
  padding: 0.1rem 0.8rem;
  border: 1px solid var(--border);
  background: var(--bg-card);
  white-space: normal;
  line-height: 1.2;
  text-align: center;
}

.post-type.progress {
  background: var(--button-bg-light);
  border-color: var(--button);
  color: var(--text-primary);
}

.post-type.general {
  background: rgba(251, 225, 172, 0.18);
  border-color: rgba(251, 225, 172, 0.45);
  color: var(--text-primary);
}

.post-date {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
}

.post-content {
  margin: 1rem 0;
  color: var(--text-secondary);
  line-height: 1.6;
}

.post-items {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
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
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  text-transform: capitalize;
}

.visibility-btn {
  background: rgba(255, 255, 255, 0.12);
  border: none;
  border-radius: 0.5rem;
  padding: 0.4rem 0.9rem;
  cursor: pointer;
  color: var(--text-primary);
}

.visibility-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.items-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.post-items .items-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.item-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.75rem;
  background: var(--button-bg-light);
  border: 1px solid var(--button-border-light);
  border-radius: 999px;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
  align-self: flex-start;
  width: fit-content;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-section {
  background: var(--card);
  border: 1px solid var(--border-light);
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
  border: 1px solid var(--border);
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
  font-weight: var(--font-weight-medium);
  color: var(--contrast-mid);
}

.item-subtext {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.item-mastery {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  text-transform: capitalize;
}

.loading,
.empty-state {
  color: var(--text-muted);
  padding: 2rem;
  text-align: center;
}

.comments-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-light);
}

.loading-comments,
.no-comments {
  color: var(--text-muted);
  font-size: var(--font-size-sm);
  padding: 0.5rem 0;
}

.comments-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.comment-item {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  background: var(--bg-card);
  padding: 0.6rem 0.75rem;
  border-radius: 0.5rem;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comment-actions {
  display: inline-flex;
  gap: 0.25rem;
  align-items: center;
}

.comment-author {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--contrast-top);
}

.comment-icon-btn {
  border: none;
  background: transparent;
  color: var(--text-primary);
  padding: 0.15rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: color 0.2s ease, transform 0.1s ease;
}

.comment-icon-btn:hover:not(:disabled) {
  color: var(--button-text);
  transform: translateY(-1px);
}

.comment-icon-btn.delete:hover:not(:disabled) {
  color: var(--error);
}

.comment-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comment-text {
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  line-height: 1.4;
}

.comment-edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-edit-input {
  width: 100%;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 0.4rem;
  padding: 0.4rem 0.6rem;
  color: var(--text-primary);
}

.comment-edit-input:focus {
  outline: none;
  border-color: var(--button);
}

.comment-edit-actions {
  display: flex;
  gap: 0.5rem;
}

.comment-save-btn,
.comment-cancel-btn {
  border: none;
  border-radius: 0.35rem;
  padding: 0.35rem 0.9rem;
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.comment-save-btn {
  background: var(--main);
  color: var(--button-text);
}

.comment-cancel-btn {
  background: var(--border-light);
  color: var(--text-secondary);
}

.comment-save-btn:disabled,
.comment-cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.comment-error {
  color: var(--error);
  font-size: var(--font-size-sm);
}

.add-comment-box {
  display: flex;
  gap: 0.5rem;
}

.comment-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.5rem 0.75rem;
  color: var(--text-primary);
}

.comment-input:focus {
  outline: none;
  border-color: var(--button);
}

.post-comment-btn {
  background: var(--main);
  color: var(--button-text);
  border: none;
  border-radius: 0.5rem;
  padding: 0 1rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: opacity 0.2s ease;
}

/* Light theme: ensure good contrast */
:root[data-theme="dark-brown-primary"] .post-comment-btn {
  background: var(--button);
  color: var(--button-text);
}

.post-comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

