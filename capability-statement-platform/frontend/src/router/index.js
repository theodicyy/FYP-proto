import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { setAuthToken } from '../services/dataService'

import Dashboard from '../views/Dashboard.vue'
import Configuration from '../views/Configuration.vue'
import Preview from '../views/Preview.vue'
import Login from '../views/Login.vue'

import AdminLawyers from '../views/admin/LawyersManagement.vue'
import AdminDeals from '../views/admin/DealsManagement.vue'
import AdminAwards from '../views/admin/AwardsManagement.vue'

import TemplatePreview from '../views/TemplatePreview.vue'
import Aggregation from '../views/Aggregation.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },

  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },

  /**
   * Main generation flow
   */
  {
    path: '/configuration',
    name: 'Configuration',
    component: Configuration,
    meta: { requiresAuth: true }
  },
  {
    path: '/preview',
    name: 'Preview',
    component: Preview,
    meta: { requiresAuth: true }
  },

  {
    path: '/aggregation',
    name: 'Aggregation',
    component: Aggregation,
    meta: { requiresAuth: true }
  },

  /**
   * Admin routes (preserved)
   */
  {
    path: '/admin/lawyers',
    name: 'AdminLawyers',
    component: AdminLawyers,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/deals',
    name: 'AdminDeals',
    component: AdminDeals,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/awards',
    name: 'AdminAwards',
    component: AdminAwards,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  {
    path: '/template-preview',
    name: 'TemplatePreview',
    component: TemplatePreview,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// ==========================
// Navigation Guard
// ==========================
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (authStore.token && !authStore.user) {
    setAuthToken(authStore.token)
    await authStore.fetchCurrentUser()
  } else if (authStore.token) {
    setAuthToken(authStore.token)
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
