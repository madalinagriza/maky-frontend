<template>
  <Layout>
    <div class="group-detail-container">
      <div v-if="loading" class="loading">Loading group details...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="group" class="group-detail-content">
        <div class="group-header">
          <button @click="$router.push('/jam')" class="back-btn">← Back to Groups</button>
          <h1>{{ group.name }}</h1>
        </div>

        <div class="two-column-layout">
          <!-- Left Column: Group Info -->
          <div class="left-column">
            <section class="info-section">
              <h2>Group Details</h2>
              <div class="info-item">
                <span class="label">Description</span>
                <p class="value">{{ group.description || 'No description provided' }}</p>
              </div>
              <div class="info-item">
                <span class="label">Creator</span>
                <p class="value">{{ creatorDisplayName }}</p>
              </div>
              <div class="info-item">
                <span class="label">Created</span>
                <p class="value">{{ formatDate(group.createdAt) }}</p>
              </div>
            </section>

            <section class="members-section">
              <div class="section-header">
                <h2>Members ({{ group.members.length }})</h2>
              </div>
              <ul class="members-list">
                <li v-for="member in membersWithProfiles" :key="member.key" class="member-item">
                  <div class="member-info">
                    <div class="member-avatar">{{ member.initials }}</div>
                    <span class="member-name">{{ member.displayName }}</span>
                    <span v-if="member.isCreator" class="creator-tag">Creator</span>
                  </div>
                  <button
                    v-if="isCreator && !member.isCreator"
                    @click="confirmRemoveMember(member.id)"
                    class="remove-member-btn"
                    :disabled="removingMember === member.id"
                  >
                    {{ removingMember === member.id ? 'Removing...' : 'Remove' }}
                  </button>
                  <button
                    v-else-if="member.id === currentMemberIdentifier && !isCreator"
                    @click="confirmLeaveGroup(member.id)"
                    class="leave-btn"
                    :disabled="leavingGroup"
                  >
                    {{ leavingGroup ? 'Leaving...' : 'Leave' }}
                  </button>
                </li>
              </ul>
            </section>

            <section v-if="!isPrivateOrKid" class="add-friend-section">
              <h3>Add Friend to Group</h3>
              <div v-if="loadingFriends" class="loading-small">Loading friends...</div>
              <div v-else-if="availableFriends.length === 0" class="empty-small">
                All your friends are already in this group!
              </div>
              <div v-else class="add-friend-controls">
                <select v-model="selectedFriend" class="friend-select">
                  <option value="">Select a friend...</option>
                  <option
                    v-for="friend in availableFriends"
                    :key="friend.id"
                    :value="friend.id"
                  >
                    {{ friend.displayName }}
                  </option>
                </select>
                <button
                  @click="addFriend"
                  class="add-btn"
                  :disabled="!selectedFriend || addingFriend"
                >
                  {{ addingFriend ? 'Adding...' : 'Add' }}
                </button>
              </div>
              <div v-if="addFriendError" class="error-small">{{ addFriendError }}</div>
            </section>

            <section v-if="!isCreator && currentMemberIdentifier" class="leave-group-section">
              <h3>Leave Jam Group</h3>
              <p class="leave-group-text">
                Leaving removes you from future sessions and member lists. You can rejoin if
                the creator invites you again.
              </p>
              <button @click="confirmLeaveGroup()" class="leave-group-btn" :disabled="leavingGroup">
                {{ leavingGroup ? 'Leaving...' : 'Leave Group' }}
              </button>
            </section>

            <section v-if="isCreator" class="danger-zone">
              <h3>Danger Zone</h3>
              <p class="danger-text">
                Disbanding this group will permanently delete it and all associated sessions.
              </p>
              <button @click="confirmDisbandGroup" class="disband-btn" :disabled="disbanding">
                {{ disbanding ? 'Disbanding...' : 'Disband Group' }}
              </button>
            </section>
          </div>

          <!-- Right Column: Sessions -->
          <div class="right-column">
            <section class="active-session-section" v-if="activeSession">
              <div class="active-banner">
                <div>
                  <h3>🎸 Active Jam Session</h3>
                  <p>{{ activeSession.participants.length }} participants jamming now</p>
                </div>
                <div class="active-banner-actions">
                  <button @click="joinActiveSession" class="join-session-btn">
                    Join Session
                  </button>
                  <button
                    v-if="canEndActiveSession"
                    @click="confirmEndActiveSession"
                    class="end-session-btn"
                    :disabled="endingActiveSession"
                  >
                    {{ endingActiveSession ? 'Ending...' : 'End Session' }}
                  </button>
                </div>
              </div>
            </section>

            <section class="create-session-section">
              <button @click="createNewSession" class="create-session-btn" :disabled="creatingSession">
                {{ creatingSession ? 'Starting...' : '+ Start New Jam Session' }}
              </button>
            </section>

            <section class="common-chords-section">
              <h2>Common Chords</h2>
              <div v-if="loadingCommonChords" class="loading-small">Loading...</div>
              <div v-else-if="commonChords.length === 0" class="empty-small">
                No common chords yet. Members need to learn some chords first!
              </div>
              <div v-else class="chord-pills">
                <span v-for="chord in commonChords" :key="chord" class="chord-pill">
                  {{ chord }}
                </span>
              </div>
            </section>

            <section class="playable-songs-section">
              <h2>Playable Songs</h2>
              <div v-if="loadingPlayableSongs" class="loading-small">Loading...</div>
              <div v-else-if="playableSongs.length === 0" class="empty-small">
                No songs available yet. Learn more chords as a group!
              </div>
              <div v-else>
                <p class="song-count">{{ playableSongs.length }} songs your group can play together</p>
                <ul class="playable-songs-list">
                  <li v-for="song in playableSongs" :key="song._id" class="playable-song-item">
                    <div class="song-info">
                      <div class="song-header">
                        <span class="song-title">{{ song.title }}</span>
                        <span v-if="song.genre" class="song-genre-tag">{{ song.genre }}</span>
                      </div>
                      <span class="song-artist">{{ song.artist }}</span>
                      <div class="song-chords">
                        <span class="song-chords-label">Chords:</span>
                        <div class="song-chords-list">
                          <span
                            v-for="chord in song.chords"
                            :key="chord"
                            class="song-chord-pill"
                          >
                            {{ chord }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            <section class="sessions-section">
              <h2>Session History</h2>
              <div v-if="loadingSessions" class="loading-small">Loading sessions...</div>
              <div v-else-if="sessions.length === 0" class="empty-small">
                No jam sessions yet. Start your first session!
              </div>
              <ul v-else class="sessions-list">
                <li
                  v-for="session in sessions"
                  :key="session._id"
                  class="session-item"
                  @click="viewSession(session._id)"
                >
                  <div class="session-info">
                    <span class="session-date">{{ formatSessionDate(session.startTime) }}</span>
                    <span :class="['session-status', session.status.toLowerCase()]">
                      {{ session.status }}
                    </span>
                  </div>
                  <div class="session-details">
                    <span>{{ session.participants.length }} participants</span>
                    <span v-if="session.endTime">
                      {{ calculateDuration(session.startTime, session.endTime) }}
                    </span>
                  </div>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Layout from '@/components/Layout.vue'
import { useAuth } from '@/composables/useAuth'
import {
  getJamGroupById,
  removeUserFromGroup,
  disbandJamGroup,
  addMemberToGroup,
  getCommonChordsForGroup,
  getPlayableSongsForGroup,
} from '@/services/jamGroupService'
import {
  getJamSessionsForGroup,
  getActiveSessionForGroup,
  startJamSession,
  endJamSession,
} from '@/services/jamSessionService'
import { getFriends } from '@/services/friendshipService'
import { getProfile } from '@/services/userProfileService'
import { getSessionId as getStoredSessionId } from '@/utils/sessionStorage'
import type { JamGroup, JamGroupMember } from '@/types/jamGroup'
import type { JamSession } from '@/types/jamSession'
import type { Song } from '@/types/song'

const router = useRouter()
const route = useRoute()
const { username, kidOrPrivateStatus, sessionId, userId } = useAuth()

const group = ref<JamGroup | null>(null)
const sessions = ref<JamSession[]>([])
const activeSession = ref<JamSession | null>(null)
const commonChords = ref<string[]>([])
const playableSongs = ref<Song[]>([])
const friends = ref<Array<{ id: string; displayName: string }>>([])
const userProfiles = ref<Record<string, { displayName: string; avatarUrl?: string | null }>>({})

type GroupMemberEntry = string | JamGroupMember | null | undefined

function truncateIdentifier(value: string, visibleChars = 6) {
  if (!value) return ''
  return value.length <= visibleChars ? value : value.slice(0, visibleChars)
}

function extractMemberMeta(member: GroupMemberEntry) {
  if (!member) {
    return { id: '', displayName: '', avatarUrl: null as string | null }
  }
  if (typeof member === 'string') {
    return { id: member, displayName: '', avatarUrl: null as string | null }
  }
  const id = member.user || member.username || member.id || member._id || ''
  const displayName = member.displayName?.trim() || ''
  const avatarUrl = member.avatarUrl ?? (typeof member.avatar === 'string' ? member.avatar : null) ?? null
  return { id, displayName, avatarUrl }
}

function fallbackMemberLabel(index: number, id?: string) {
  if (id) return truncateIdentifier(id)
  return `Member ${index + 1}`
}

function normalizeMemberIds(members: Array<string | JamGroupMember> | null | undefined): string[] {
  if (!Array.isArray(members)) return []
  return members
    .map(member => extractMemberMeta(member).id)
    .filter((id): id is string => Boolean(id))
}

const loading = ref(true)
const error = ref<string | null>(null)
const loadingSessions = ref(false)
const loadingCommonChords = ref(false)
const loadingPlayableSongs = ref(false)
const loadingFriends = ref(false)

const creatingSession = ref(false)
const endingActiveSession = ref(false)
const removingMember = ref<string | null>(null)
const leavingGroup = ref(false)
const disbanding = ref(false)
const addingFriend = ref(false)
const selectedFriend = ref('')
const addFriendError = ref<string | null>(null)

const groupId = computed(() => route.params.groupId as string)
const currentUsername = computed(() => username.value || '')
const currentUserId = computed(() => userId.value || '')
const normalizedMemberIds = computed(() => normalizeMemberIds(group.value?.members ?? []))
const currentMemberIdentifier = computed(() => {
  const fallback = currentUserId.value || currentUsername.value || ''
  const memberIds = normalizedMemberIds.value
  if (currentUserId.value && memberIds.includes(currentUserId.value)) {
    return currentUserId.value
  }
  if (currentUsername.value && memberIds.includes(currentUsername.value)) {
    return currentUsername.value
  }
  return fallback
})
const isCreator = computed(() => group.value?.creator === currentUsername.value)
const isPrivateOrKid = computed(() => kidOrPrivateStatus.value === true)
const creatorDisplayName = computed(() => {
  if (!group.value?.creator) return 'Unknown'
  return (
    userProfiles.value[group.value.creator]?.displayName || truncateIdentifier(group.value.creator)
  )
})
const membersWithProfiles = computed(() => {
  if (!group.value) return []
  return group.value.members.map((memberEntry, index) => {
    const { id, displayName: inlineDisplayName } = extractMemberMeta(memberEntry)
      const profile = id ? userProfiles.value[id] : undefined
    const fallbackLabel = fallbackMemberLabel(index, id)
    const name = inlineDisplayName || profile?.displayName?.trim() || fallbackLabel
    const initialsSource = name || fallbackLabel
      return {
        id,
        key: id || `member-${index}`,
        displayName: name,
        initials: initialsSource.charAt(0)?.toUpperCase() || '?',
        isCreator: Boolean(id && group.value && id === group.value.creator),
      }
    })
})

const availableFriends = computed(() => {
  const memberSet = new Set(normalizedMemberIds.value)
  return friends.value.filter(friend => !memberSet.has(friend.id))
})

const canEndActiveSession = computed(() => {
  if (!activeSession.value) return false
  const isParticipant = activeSession.value.participants.includes(currentUsername.value)
  return isParticipant || isCreator.value
})

async function loadGroupDetails() {
  loading.value = true
  error.value = null
  userProfiles.value = {}
  try {
    group.value = await getJamGroupById(groupId.value)
    if (!group.value) {
      error.value = 'Group not found'
      return
    }
    const seededProfiles: Record<string, { displayName: string; avatarUrl?: string | null }> = {}
    group.value.members.forEach(memberEntry => {
      const { id, displayName, avatarUrl } = extractMemberMeta(memberEntry)
      if (!id || !displayName) return
      seededProfiles[id] = {
        displayName,
        avatarUrl,
      }
    })
    if (Object.keys(seededProfiles).length) {
      userProfiles.value = {
        ...userProfiles.value,
        ...seededProfiles,
      }
    }
    const memberIds = normalizeMemberIds(group.value.members)
    const membersToFetch = [...memberIds, group.value.creator].filter(Boolean)
    await Promise.all([
      loadSessions(),
      loadActiveSession(),
      loadCommonChords(),
      loadPlayableSongs(),
      loadFriends(),
      loadMemberProfiles(membersToFetch as string[]),
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load group details'
    console.error('Error loading group:', err)
  } finally {
    loading.value = false
  }
}

async function loadSessions() {
  loadingSessions.value = true
  try {
    sessions.value = await getJamSessionsForGroup(groupId.value)
  } catch (err) {
    console.error('Error loading sessions:', err)
  } finally {
    loadingSessions.value = false
  }
}

async function loadActiveSession() {
  try {
    activeSession.value = await getActiveSessionForGroup(groupId.value)
  } catch (err) {
    console.error('Error loading active session:', err)
  }
}

async function loadCommonChords() {
  loadingCommonChords.value = true
  try {
    const response = await getCommonChordsForGroup(groupId.value)
    commonChords.value = response.commonChords
  } catch (err) {
    console.error('Error loading common chords:', err)
  } finally {
    loadingCommonChords.value = false
  }
}

async function loadPlayableSongs() {
  loadingPlayableSongs.value = true
  try {
    playableSongs.value = await getPlayableSongsForGroup(groupId.value)
  } catch (err) {
    console.error('Error loading playable songs:', err)
  } finally {
    loadingPlayableSongs.value = false
  }
}

async function loadFriends() {
  if (isPrivateOrKid.value) return
  loadingFriends.value = true
  try {
    const activeSessionId = sessionId.value
    const activeUserId = currentUserId.value
    if (!activeSessionId || !activeUserId) {
      friends.value = []
      return
    }

    const friendIds = await getFriends({ sessionId: activeSessionId, user: activeUserId })
    if (friendIds.length) {
      await loadMemberProfiles(friendIds)
    }
    friends.value = friendIds.map(friendId => ({
      id: friendId,
      displayName: userProfiles.value[friendId]?.displayName || truncateIdentifier(friendId),
    }))
  } catch (err) {
    console.error('Error loading friends:', err)
    friends.value = []
  } finally {
    loadingFriends.value = false
  }
}

async function loadMemberProfiles(memberIds: string[]) {
  if (!memberIds.length) return

  const activeSessionId = sessionId.value || getStoredSessionId()
  if (!activeSessionId) {
    console.warn('Cannot load member profiles without a session id')
    return
  }
  const uniqueIds = Array.from(new Set(memberIds.filter(Boolean)))
  const idsToFetch = uniqueIds.filter(id => !(id in userProfiles.value))
  if (!idsToFetch.length) return

  const results = await Promise.all(
    idsToFetch.map(async id => {
      try {
        const profile = await getProfile({ sessionId: activeSessionId, user: id })
        return { id, profile }
      } catch (err) {
        console.warn(`Failed to load profile for member ${id}`, err)
        return { id, profile: null }
      }
    })
  )

  const nextProfiles: Record<string, { displayName: string; avatarUrl?: string | null }> = {}
  results.forEach(({ id, profile }) => {
    if (profile) {
      const displayName = (profile.displayName || '').trim() || id
      nextProfiles[id] = {
        displayName,
        avatarUrl: profile.avatarUrl ?? null,
      }
    } else if (!(id in userProfiles.value)) {
      nextProfiles[id] = { displayName: id }
    }
  })

  userProfiles.value = {
    ...userProfiles.value,
    ...nextProfiles,
  }
}

async function createNewSession() {
  if (creatingSession.value) return
  creatingSession.value = true
  try {
    const response = await startJamSession(groupId.value)
    router.push(`/jam/${groupId.value}/session/${response.session}`)
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to create session')
  } finally {
    creatingSession.value = false
  }
}

async function joinActiveSession() {
  if (activeSession.value) {
    router.push(`/jam/${groupId.value}/session/${activeSession.value._id}`)
  }
}

async function confirmEndActiveSession() {
  if (!activeSession.value || endingActiveSession.value) return
  if (!confirm('End the active jam session for everyone?')) return
  endingActiveSession.value = true
  try {
    await endJamSession(activeSession.value._id)
    await Promise.all([loadActiveSession(), loadSessions()])
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to end session')
  } finally {
    endingActiveSession.value = false
  }
}

function viewSession(sessionId: string) {
  router.push(`/jam/${groupId.value}/session/${sessionId}`)
}

async function confirmRemoveMember(member: string) {
  if (!member) {
    alert('Unable to remove this member because their account identifier is missing.')
    return
  }
  const label = userProfiles.value[member]?.displayName || truncateIdentifier(member)
  if (!confirm(`Remove ${label} from this group?`)) return
  removingMember.value = member
  try {
    await removeUserFromGroup(groupId.value, member)
    await loadGroupDetails()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to remove member')
  } finally {
    removingMember.value = null
  }
}

async function confirmLeaveGroup(memberId?: string) {
  const identifier = memberId || currentMemberIdentifier.value
  if (!identifier) {
    alert('Unable to determine which account to remove from this group.')
    return
  }
  if (!confirm('Are you sure you want to leave this group?')) return
  leavingGroup.value = true
  try {
    await removeUserFromGroup(groupId.value, identifier)
    router.push('/jam')
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to leave group')
  } finally {
    leavingGroup.value = false
  }
}

async function confirmDisbandGroup() {
  if (!confirm('Are you sure you want to disband this group? This action cannot be undone.')) return
  disbanding.value = true
  try {
    await disbandJamGroup(groupId.value)
    router.push('/jam')
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to disband group')
  } finally {
    disbanding.value = false
  }
}

async function addFriend() {
  if (!selectedFriend.value || addingFriend.value) return
  addingFriend.value = true
  addFriendError.value = null
  try {
    await addMemberToGroup(groupId.value, selectedFriend.value)
    selectedFriend.value = ''
    await loadGroupDetails()
  } catch (err) {
    addFriendError.value = err instanceof Error ? err.message : 'Failed to add friend'
  } finally {
    addingFriend.value = false
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatSessionDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function calculateDuration(start: string, end: string): string {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h ${mins}m`
}

onMounted(() => {
  loadGroupDetails()
})
</script>

<style scoped>
.group-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem;
  color: var(--contrast-mid);
  font-size: 1.1rem;
}

.error-message {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.group-header {
  margin-bottom: 2rem;
}

.back-btn {
  background: none;
  border: none;
  color: var(--contrast-mid);
  font-size: 0.95rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  transition: color 0.2s ease;
}

.back-btn:hover {
  color: var(--accent);
}

.group-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(120deg, var(--contrast-top), var(--contrast-mid));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.two-column-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.info-section,
.members-section,
.leave-group-section,
.add-friend-section,
.danger-zone,
.active-session-section,
.create-session-section,
.common-chords-section,
.playable-songs-section,
.sessions-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;
  color: var(--contrast-top);
  margin: 0 0 1rem 0;
}

h3 {
  font-size: 1.25rem;
  color: var(--contrast-top);
  margin: 0 0 1rem 0;
}

.info-item {
  margin-bottom: 1rem;
}

.label {
  display: block;
  color: var(--contrast-bottom);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.value {
  color: var(--contrast-mid);
  margin: 0;
}

.members-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.member-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.member-item:last-child {
  border-bottom: none;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.member-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--contrast-top);
  font-weight: 600;
}

.member-name {
  color: var(--contrast-mid);
  font-weight: 500;
}

.creator-tag {
  background: linear-gradient(120deg, var(--contrast-bottom), var(--contrast-top));
  color: var(--main);
  padding: 0.2rem 0.6rem;
  border-radius: 0.75rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.remove-member-btn,
.leave-btn {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 0.4rem 0.8rem;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-member-btn:hover:not(:disabled),
.leave-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
}

.add-friend-controls {
  display: flex;
  gap: 0.75rem;
}

.friend-select {
  flex: 1;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--contrast-top);
  font-size: 1rem;
}

.friend-select option {
  color: #0f172a;
  background-color: #ffffff;
}

.add-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.leave-group-text {
  color: var(--contrast-mid);
  margin-bottom: 1rem;
}

.leave-group-btn {
  width: 100%;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.leave-group-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.danger-zone {
  background: rgba(239, 68, 68, 0.05);
  border-color: rgba(239, 68, 68, 0.2);
}

.danger-text {
  color: var(--contrast-mid);
  margin-bottom: 1rem;
}

.disband-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.disband-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.active-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(120deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2));
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.active-banner-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.active-banner h3 {
  margin: 0 0 0.5rem 0;
}

.active-banner p {
  color: var(--contrast-mid);
  margin: 0;
}

.join-session-btn,
.create-session-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.end-session-btn {
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.4);
  color: #fca5a5;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.end-session-btn:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.3);
}

.create-session-btn {
  width: 100%;
  padding: 1rem;
}

.join-session-btn:hover:not(:disabled),
.create-session-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.chord-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chord-pill {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: var(--contrast-top);
  padding: 0.4rem 0.8rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.song-count {
  color: var(--contrast-mid);
  margin: 0;
}

.sessions-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.session-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;
}

.session-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.session-item:last-child {
  border-bottom: none;
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.session-date {
  color: var(--contrast-top);
  font-weight: 500;
}

.session-status {
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.session-status.active {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.session-status.completed {
  background: rgba(156, 163, 175, 0.2);
  color: #d1d5db;
}

.session-status.scheduled {
  background: rgba(251, 191, 36, 0.2);
  color: #fcd34d;
}

.session-details {
  display: flex;
  gap: 1rem;
  color: var(--contrast-bottom);
  font-size: 0.9rem;
}

.loading-small,
.empty-small,
.error-small {
  color: var(--contrast-bottom);
  font-size: 0.9rem;
  padding: 0.5rem 0;
}

.error-small {
  color: #fca5a5;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.playable-songs-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 0 0;
  max-height: 500px;
  overflow-y: auto;
}

.playable-song-item {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.playable-song-item:hover {
  background: rgba(255, 255, 255, 0.02);
}

.playable-song-item:last-child {
  border-bottom: none;
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.song-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.song-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--contrast-top);
}

.song-artist {
  color: var(--contrast-bottom);
  font-size: 0.9rem;
}

.song-genre-tag {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.song-chords {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.song-chords-label {
  color: var(--contrast-bottom);
  font-size: 0.85rem;
  font-weight: 500;
}

.song-chords-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.song-chord-pill {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--contrast-mid);
  padding: 0.25rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 500;
}

@media (max-width: 1024px) {
  .two-column-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .group-detail-container {
    padding: 1rem;
  }

  .group-header h1 {
    font-size: 2rem;
  }
}
</style>

