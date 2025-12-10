<template>
  <div class="theme-switcher">
    <button 
      class="theme-toggle"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      aria-label="Change theme"
    >
      <span class="theme-icon">🎨</span>
      <span class="theme-label">{{ currentThemeDisplay }}</span>
      <span class="dropdown-arrow" :class="{ 'arrow-up': isOpen }">▼</span>
    </button>
    
    <div v-if="isOpen" class="theme-dropdown" @click.stop>
      <div class="theme-options">
        <button
          v-for="theme in availableThemes"
          :key="theme.name"
          class="theme-option"
          :class="{ active: currentTheme === theme.name }"
          @click="selectTheme(theme.name)"
        >
          <span class="theme-preview" :style="{ backgroundColor: theme.colors.logo }"></span>
          <span class="theme-name">{{ theme.displayName }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type { ThemeName } from '@/themes/themes'

const { currentTheme, themes, applyTheme } = useTheme()
const isOpen = ref(false)

const availableThemes = computed(() => Object.values(themes))

const currentThemeDisplay = computed(() => {
  return themes[currentTheme.value]?.displayName || 'Theme'
})

function selectTheme(themeName: ThemeName) {
  applyTheme(themeName)
  isOpen.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.theme-switcher')) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.theme-switcher {
  position: relative;
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--bg-card, rgba(75, 62, 53, 0.8));
  border: 1px solid var(--border, rgba(238, 232, 219, 0.2));
  border-radius: 0.5rem;
  color: var(--text-primary, rgb(238, 232, 219));
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size-sm);
}

.theme-toggle:hover {
  background: var(--bg-secondary, rgb(59, 46, 37));
  border-color: var(--accent, rgb(245, 128, 48));
}

.theme-icon {
  font-size: var(--font-size-md);
}

.theme-label {
  font-weight: var(--font-weight-medium);
}

.dropdown-arrow {
  font-size: var(--font-size-xs);
  transition: transform 0.2s ease;
  display: inline-block;
}

.dropdown-arrow.arrow-up {
  transform: rotate(180deg);
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: var(--bg-card, rgb(75, 62, 53));
  border: 1px solid var(--border, rgba(238, 232, 219, 0.2));
  border-radius: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  min-width: 180px;
  z-index: 1000;
  overflow: hidden;
}

.theme-options {
  display: flex;
  flex-direction: column;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary, rgb(238, 232, 219));
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: left;
  width: 100%;
}

.theme-option:hover {
  background: rgba(255, 255, 255, 0.05);
}

.theme-option.active {
  background: var(--button-bg-light);
  color: var(--accent, rgb(245, 128, 48));
}

.theme-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border, rgba(238, 232, 219, 0.2));
  flex-shrink: 0;
}

.theme-name {
  font-weight: var(--font-weight-medium);
}
</style>

