<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Create New Jam Group</h2>
        <button class="close-btn" @click="$emit('close')" aria-label="Close">×</button>
      </div>

      <form @submit.prevent="handleSubmit" class="modal-form">
        <div class="form-group">
          <label for="group-name">Group Name *</label>
          <input
            id="group-name"
            v-model="groupName"
            type="text"
            placeholder="Enter a name for your jam group"
            required
            maxlength="50"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="group-description">Description</label>
          <textarea
            id="group-description"
            v-model="groupDescription"
            placeholder="What's this group about? (optional)"
            rows="4"
            maxlength="200"
            class="form-textarea"
          ></textarea>
        </div>

        <div v-if="error" class="error-message">{{ error }}</div>

        <div class="modal-actions">
          <button type="button" @click="$emit('close')" class="cancel-btn" :disabled="creating">
            Cancel
          </button>
          <button type="submit" class="submit-btn" :disabled="!isValid || creating">
            {{ creating ? 'Creating...' : 'Create Group' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createJamGroup } from '@/services/jamGroupService'

const emit = defineEmits<{
  close: []
  created: []
}>()

const groupName = ref('')
const groupDescription = ref('')
const creating = ref(false)
const error = ref<string | null>(null)

const isValid = computed(() => groupName.value.trim().length > 0)

async function handleSubmit() {
  if (!isValid.value || creating.value) return

  creating.value = true
  error.value = null

  try {
    await createJamGroup(groupName.value.trim(), groupDescription.value.trim())
    emit('created')
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to create jam group'
    console.error('Error creating jam group:', err)
  } finally {
    creating.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: var(--main);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-header h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  color: var(--contrast-top);
}

.close-btn {
  background: none;
  border: none;
  color: var(--contrast-mid);
  font-size: var(--font-size-2xl);
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--contrast-top);
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--contrast-mid);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  color: var(--contrast-top);
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: all 0.2s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  background: rgba(255, 255, 255, 0.08);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.error-message {
  background: var(--error-bg-light);
  border: 1px solid var(--error-border-light);
  color: var(--error);
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  font-size: var(--font-size-sm);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-base);
  border: none;
}

.cancel-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--contrast-mid);
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

.submit-btn {
  background: var(--button);
  color: var(--btn-text);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px var(--shadow);
}

.cancel-btn:disabled,
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

