import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { getSessionId } from '@/utils/sessionStorage'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/questionnaire',
    name: 'Questionnaire',
    component: () => import('@/views/QuestionnairePage.vue'),
    meta: { requiresAuth: true, requiresQuestionnaire: true, useLayout: true },
  },
  {
    path: '/learn',
    name: 'Learn',
    component: () => import('@/views/LearnPage.vue'),
    meta: { requiresAuth: false, useLayout: true },
  },
  {
    path: '/feed',
    name: 'Feed',
    component: () => import('@/views/FeedPage.vue'),
    meta: { requiresAuth: true, useLayout: true },
  },
  {
    path: '/journal',
    name: 'Journal',
    component: () => import('@/views/JournalPage.vue'),
    meta: { requiresAuth: true, useLayout: true },
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/ProfilePage.vue'),
    meta: { requiresAuth: true, useLayout: true },
  },
  {
    path: '/',
    redirect: '/profile',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard to check authentication and questionnaire completion
router.beforeEach(async (to, _from, next) => {
  const sessionId = getSessionId()
  const requiresAuth = to.meta.requiresAuth

  // If route requires auth but no session, redirect to login
  // EXCEPT for the learn page which we allow without auth for development
  if (requiresAuth && !sessionId && to.name !== 'Learn') {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // If user is authenticated and trying to access login/register, redirect to profile
  if (sessionId && (to.name === 'Login' || to.name === 'Register')) {
    // Check if questionnaire is completed by checking if profile exists
    try {
      // We'll check this in the component or use a composable
      // For now, allow access and check in component
      next({ name: 'Profile' })
      return
    } catch {
      // If profile doesn't exist, redirect to questionnaire
      next({ name: 'Questionnaire' })
      return
    }
  }

  // If route requires questionnaire completion, check if profile exists
  if (to.meta.requiresQuestionnaire && sessionId) {
    // We'll handle questionnaire check in the component
    // For now, allow navigation
    next()
    return
  }

  next()
})

export default router

