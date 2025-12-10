import { ref } from 'vue'
import type { ThemeName } from '@/themes/themes'
import { themes } from '@/themes/themes'

const currentTheme = ref<ThemeName>('red-primary')
const THEME_STORAGE_KEY = 'chordconnect-theme'

// Apply theme to CSS custom properties
function applyTheme(themeName: ThemeName) {
  const theme = themes[themeName]
  const root = document.documentElement
  
  // Set all CSS variables
  root.style.setProperty('--logo-color', theme.colors.logo)
  root.style.setProperty('--logo-text-color', theme.colors.logoText)
  root.style.setProperty('--bg-primary', theme.colors.bgPrimary)
  root.style.setProperty('--bg-secondary', theme.colors.bgSecondary)
  root.style.setProperty('--bg-card', theme.colors.bgCard)
  root.style.setProperty('--bg-gradient-top', theme.colors.bgGradient.top)
  root.style.setProperty('--bg-gradient-mid', theme.colors.bgGradient.mid)
  root.style.setProperty('--bg-gradient-bottom', theme.colors.bgGradient.bottom)
  root.style.setProperty('--text-primary', theme.colors.textPrimary)
  root.style.setProperty('--text-secondary', theme.colors.textSecondary)
  root.style.setProperty('--text-muted', theme.colors.textMuted)
  root.style.setProperty('--button', theme.colors.button)
  root.style.setProperty('--button-hover', theme.colors.buttonHover)
  root.style.setProperty('--button-text', theme.colors.buttonText)
  root.style.setProperty('--accent', theme.colors.accent)
  root.style.setProperty('--link', theme.colors.link)
  root.style.setProperty('--border', theme.colors.border)
  root.style.setProperty('--border-light', theme.colors.borderLight)
  root.style.setProperty('--input-bg', theme.colors.inputBg)
  root.style.setProperty('--input-border', theme.colors.inputBorder)
  root.style.setProperty('--input-text', theme.colors.inputText)
  root.style.setProperty('--input-focus', theme.colors.inputFocus)
  root.style.setProperty('--success', theme.colors.success)
  root.style.setProperty('--success-bg', theme.colors.successBg)
  root.style.setProperty('--success-border', theme.colors.successBorder)
  root.style.setProperty('--error', theme.colors.error)
  root.style.setProperty('--error-bg', theme.colors.errorBg)
  root.style.setProperty('--error-border', theme.colors.errorBorder)
  root.style.setProperty('--focus-outline', theme.colors.focusOutline)
  root.style.setProperty('--shadow', theme.colors.shadow)
  root.style.setProperty('--shadow-strong', theme.colors.shadowStrong)
  root.style.setProperty('--button-bg-light', theme.colors.buttonBgLight)
  root.style.setProperty('--button-bg-medium', theme.colors.buttonBgMedium)
  root.style.setProperty('--button-border-light', theme.colors.buttonBorderLight)
  root.style.setProperty('--error-bg-light', theme.colors.errorBgLight)
  root.style.setProperty('--error-border-light', theme.colors.errorBorderLight)
  root.style.setProperty('--auth-overlay', theme.colors.authOverlay)
  
  currentTheme.value = themeName
  localStorage.setItem(THEME_STORAGE_KEY, themeName)
}

// Load theme from storage or default
export function loadTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  // Handle migration from removed themes
  if (saved === 'beige-primary' || saved === 'warm-neutral') {
    localStorage.setItem(THEME_STORAGE_KEY, 'red-primary')
    applyTheme('red-primary')
  } else if (saved && saved in themes) {
    applyTheme(saved as ThemeName)
  } else {
    applyTheme('red-primary')
  }
}

export function useTheme() {
  // Get current theme object
  function getCurrentTheme() {
    return themes[currentTheme.value]
  }
  
  return {
    currentTheme,
    themes,
    applyTheme,
    loadTheme,
    getCurrentTheme
  }
}

