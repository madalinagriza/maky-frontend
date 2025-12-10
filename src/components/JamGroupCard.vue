<template>
  <div class="jam-group-card" @click="$emit('click')">
    <div class="card-header">
      <h3>{{ group.name }}</h3>
      <span v-if="isCreator" class="creator-badge">Creator</span>
    </div>
    <p class="card-description">{{ group.description || 'No description' }}</p>
    <div class="card-footer">
      <div class="member-count">
        <span class="icon">👥</span>
        <span>{{ group.members.length }} {{ group.members.length === 1 ? 'member' : 'members' }}</span>
      </div>
      <div class="created-date">
        {{ formatDate(group.createdAt) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { JamGroup } from '@/types/jamGroup'

interface Props {
  group: JamGroup
  currentUser: string
}

const props = defineProps<Props>()

defineEmits<{
  click: []
}>()

const isCreator = computed(() => props.group.creator === props.currentUser)

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`

  return date.toLocaleDateString()
}
</script>

<style scoped>
.jam-group-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.jam-group-card:hover {
  background: var(--bg-card);
  opacity: 0.9;
  border-color: var(--accent);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
  gap: 1rem;
}

.card-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--contrast-top);
  margin: 0;
  flex: 1;
}

.creator-badge {
  background: linear-gradient(120deg, var(--contrast-bottom), var(--contrast-top));
  color: var(--main);
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

.card-description {
  color: var(--contrast-mid);
  margin: 0 0 1.25rem 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  font-size: var(--font-size-sm);
}

.member-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--contrast-mid);
  font-weight: var(--font-weight-medium);
}

.icon {
  font-size: var(--font-size-md);
}

.created-date {
  color: var(--contrast-bottom);
  font-size: var(--font-size-sm);
}
</style>

