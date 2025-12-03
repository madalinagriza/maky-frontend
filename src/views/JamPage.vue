<template>
  <Layout>
    <div class="jam-container">
      <header class="jam-header">
        <div>
          <p class="eyebrow">Collaborate</p>
          <h1>My Jam Groups</h1>
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
        <JamGroupCard
          v-for="group in jamGroups"
          :key="group._id"
          :group="group"
          :current-user="currentUsername"
          @click="navigateToGroup(group._id)"
        />
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
import { useRouter } from 'vue-router'
import Layout from '@/components/Layout.vue'
import JamGroupCard from '@/components/JamGroupCard.vue'
import CreateJamGroupModal from '@/components/CreateJamGroupModal.vue'
import { getJamGroupsForUser } from '@/services/jamGroupService'
import { useAuth } from '@/composables/useAuth'
import type { JamGroup } from '@/types/jamGroup'

const router = useRouter()
const { username } = useAuth()

const jamGroups = ref<JamGroup[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)

const currentUsername = computed(() => username.value || '')

async function loadJamGroups() {
  loading.value = true
  error.value = null
  try {
    const groups = await getJamGroupsForUser()
    // Filter to show only groups where user is a member
    jamGroups.value = groups.filter(group => 
      group.members.includes(currentUsername.value)
    )
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load jam groups'
    console.error('Error loading jam groups:', err)
  } finally {
    loading.value = false
  }
}

function navigateToGroup(groupId: string) {
  router.push(`/jam/${groupId}`)
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
  padding: 2rem;
}

.jam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  color: var(--contrast-bottom);
  margin: 0 0 0.5rem 0;
}

h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(120deg, var(--contrast-top), var(--contrast-mid));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.create-group-btn {
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

.create-group-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  max-width: 500px;
  margin: 0 auto;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.empty-state h2 {
  font-size: 1.5rem;
  color: var(--contrast-top);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--contrast-mid);
  margin-bottom: 2rem;
  font-size: 1.05rem;
}

.create-group-btn-large {
  background: var(--button);
  color: var(--btn-text);
  border: none;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1.1rem;
}

.create-group-btn-large:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.groups-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
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
    font-size: 2rem;
  }

  .groups-grid {
    grid-template-columns: 1fr;
  }
}
</style>

