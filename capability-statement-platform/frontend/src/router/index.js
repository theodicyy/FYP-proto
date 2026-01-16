import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { setAuthToken } from '../services/dataService'
import Dashboard from '../views/Dashboard.vue'
import Aggregation from '../views/Aggregation.vue'
import Configuration from '../views/Configuration.vue'
import Preview from '../views/Preview.vue'
import Library from '../views/Library.vue'
import Login from '../views/Login.vue'
import AdminLawyers from '../views/admin/LawyersManagement.vue'
import AdminDeals from '../views/admin/DealsManagement.vue'
import AdminAwards from '../views/admin/AwardsManagement.vue'

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
  {
    path: '/aggregation',
    name: 'Aggregation',
    component: Aggregation,
    meta: { requiresAuth: true }
  },
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
    path: '/library',
    name: 'Library',
    component: Library,
    meta: { requiresAuth: true }
  },
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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard - check authentication and admin access
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth if token exists
  if (authStore.token && !authStore.user) {
    setAuthToken(authStore.token)
    await authStore.fetchCurrentUser()
  } else if (authStore.token) {
    setAuthToken(authStore.token)
  }
  
  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    // Block non-admin users from admin routes
    next('/')
  } else {
    next()
  }
})

export default router
