<template>
  <div class="floating-theme-switcher">
    <button 
      class="theme-button"
      @click="isOpen = !isOpen"
      :aria-expanded="isOpen"
      aria-label="Change theme"
    >
      <svg 
        class="palette-icon" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <path 
          d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zM7.5 12c-.83 0-1.5-.67-1.5-1.5S6.67 9 7.5 9 9 9.67 9 10.5 8.33 12 7.5 12zm3-4C9.67 8 9 7.33 9 6.5S9.67 5 10.5 5 12 5.67 12 6.5 11.33 8 10.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S14.67 5 15.5 5 17 5.67 17 6.5 16.33 8 15.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S17.67 9 18.5 9 20 9.67 20 10.5 19.33 12 18.5 12z" 
          :fill="iconColor"
        />
      </svg>
    </button>
    
    <Transition name="dropdown">
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
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from '@/composables/useTheme'
import type { ThemeName } from '@/themes/themes'

const { currentTheme, themes, applyTheme, getCurrentTheme } = useTheme()
const isOpen = ref(false)

const availableThemes = computed(() => Object.values(themes))

const iconColor = computed(() => {
  const theme = getCurrentTheme()
  // Use beige/orange combo - beige for dark themes, orange for light theme
  if (theme.name === 'dark-brown-primary') {
    return theme.colors.logo // brown for light theme
  }
  return theme.colors.textSecondary // beige for dark themes
})

function selectTheme(themeName: ThemeName) {
  applyTheme(themeName)
  isOpen.value = false
}

// Close dropdown when clicking outside
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.floating-theme-switcher')) {
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
.floating-theme-switcher {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.theme-button {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(245, 128, 48, 0.3);
}

.theme-button:hover {
  background: var(--bg-secondary);
  border-color: var(--button);
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(245, 128, 48, 0.4);
}

.theme-button:active {
  transform: scale(0.95);
}

.palette-icon {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease;
  transform: rotate(-15deg);
}

.theme-button:hover .palette-icon {
  transform: rotate(0deg);
}

.theme-dropdown {
  position: absolute;
  bottom: calc(100% + 1rem);
  right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px var(--shadow-strong);
  min-width: 200px;
  overflow: hidden;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.theme-options {
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
  border-radius: 0.5rem;
}

.theme-option:hover {
  background: var(--bg-secondary);
}

.theme-option.active {
  background: var(--button-bg-light);
  color: var(--button);
}

.theme-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-shrink: 0;
}

.theme-name {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .floating-theme-switcher {
    bottom: 1.5rem;
    right: 1.5rem;
  }
  
  .theme-button {
    width: 48px;
    height: 48px;
  }
  
  .palette-icon {
    width: 28px;
    height: 28px;
  }
  
  .theme-dropdown {
    min-width: 180px;
  }
}
</style>

