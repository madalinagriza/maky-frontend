<template>
  <Layout>
    <div class="jam-container">
      <header class="jam-header">
        <div>
          <p class="eyebrow">Collaborate</p>
          <h1>My Jam Groups</h1>
          <p class="jam-lead">
            Jam it up with your friends. See which chords your friends can play and practice songs together.
          </p>
        </div>
        <button @click="showCreateModal = true" class="create-group-btn">
          + Create New Group
        </button>
      </header>

      <div v-if="loading" class="loading">Loading your jam groups...</div>
      <div v-else-if="error" class="error-message">{{ error }}</div>
      <div v-else-if="jamGroups.length === 0" class="empty-state">
        <div class="empty-icon">🎸</div>
        <h2>No jam groups yet</h2>
        <p>Create your first jam group to start collaborating with friends!</p>
        <button @click="showCreateModal = true" class="create-group-btn-large">
          Create Your First Group
        </button>
      </div>
      <div v-else class="groups-grid">
        <RouterLink
          v-for="group in jamGroups"
          :key="group._id"
          :to="{ name: 'JamGroupDetail', params: { groupId: group._id } }"
          class="jam-group-link"
        >
          <JamGroupCard
            :group="group"
            :current-user="currentUsername"
          />
        </RouterLink>
      </div>

      <CreateJamGroupModal
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @created="handleGroupCreated"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Layout from '@/components/Layout.vue'
import JamGroupCard from '@/components/JamGroupCard.vue'
import CreateJamGroupModal from '@/components/CreateJamGroupModal.vue'
import { getJamGroupsForUser } from '@/services/jamGroupService'
import { useAuth } from '@/composables/useAuth'
import type { JamGroup } from '@/types/jamGroup'

const { username, userId } = useAuth()

const jamGroups = ref<JamGroup[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)

const currentUsername = computed(() => username.value || '')
const currentUserId = computed(() => userId.value || '')

function groupIncludesUser(group: JamGroup, memberId: string) {
  if (!memberId || !Array.isArray(group.members)) return false
  return group.members.some(member => {
    if (typeof member === 'string') return member === memberId
    return member.username === memberId
  })
}

async function loadJamGroups() {
  loading.value = true
  error.value = null
  try {
    const groups = await getJamGroupsForUser()
    // Filter to show only groups where user is a member (guard missing members arrays)
    const activeUserId = currentUserId.value
    jamGroups.value = !activeUserId
      ? groups
      : groups.filter(group => groupIncludesUser(group, activeUserId))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load jam groups'
    console.error('Error loading jam groups:', err)
  } finally {
    loading.value = false
  }
}

function handleGroupCreated() {
  showCreateModal.value = false
  loadJamGroups()
}

onMounted(() => {
  loadJamGroups()
})
</script>

<style scoped>
.jam-container {
  max-width: 1200px;
  margin: 0 auto;
}

.jam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
  flex-wrap: wrap;
  gap: 1rem;
}

.jam-header h1 {
  margin-bottom: 2rem;
}

/* Eyebrow styling removed - using standardized h1 only */

/* h1 styling is now standardized in style.css */
h1 {
  font-size: 2.5rem;
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.jam-lead {
  margin: 0.25rem 0 0;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

/* h1 styling is now standardized in style.css */

.create-group-btn {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-base);
}

.create-group-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.loading,
.error-message {
  text-align: center;
  padding: 3rem;
  color: var(--contrast-mid);
  font-size: var(--font-size-md);
}

.error-message {
  color: var(--error);
  background: var(--error-bg-light);
  border-radius: 0.5rem;
  border: 1px solid var(--error-border-light);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: var(--font-size-xl);
  color: var(--contrast-top);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--contrast-mid);
  margin-bottom: 2rem;
  font-size: var(--font-size-base);
}

.create-group-btn-large {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-md);
}

.create-group-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.jam-group-link {
  text-decoration: none;
  color: inherit;
}

@media (max-width: 768px) {
  .jam-container {
    padding: 1rem;
  }

  .jam-header {
    flex-direction: column;
    align-items: stretch;
  }

  h1 {
    font-size: var(--font-size-2xl);
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>

