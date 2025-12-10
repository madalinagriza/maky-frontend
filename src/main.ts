import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { loadTheme } from '@/composables/useTheme'

// Initialize theme before mounting app
loadTheme()

createApp(App).use(router).mount('#app')
