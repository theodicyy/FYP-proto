<template>
  <div id="app" class="min-h-screen">
    <nav class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="text-xl font-bold text-primary-600">
              Capability Statement Platform
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="authStore.isAuthenticated">
              <span class="text-sm text-gray-600">
                {{ authStore.user?.email }} 
                <span class="px-2 py-1 rounded text-xs" :class="authStore.isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'">
                  {{ authStore.isAdmin ? 'Admin' : 'Associate' }}
                </span>
              </span>
              
              <!-- Admin Hamburger Menu -->
              <div v-if="authStore.isAdmin" class="relative" @click.stop="toggleAdminMenu">
                <button class="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                
                <!-- Dropdown Menu -->
                <div v-if="showAdminMenu" class="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                  <div class="py-1">
                    <router-link
                      to="/admin/lawyers"
                      @click="showAdminMenu = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Lawyers Management
                    </router-link>
                    <router-link
                      to="/admin/deals"
                      @click="showAdminMenu = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Deals Management
                    </router-link>
                    <router-link
                      to="/admin/awards"
                      @click="showAdminMenu = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Awards Management
                    </router-link>
                    <router-link
                      to="/admin/templates"
                      @click="showAdminMenu = false"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Templates Management
                    </router-link>
                  </div>
                </div>
              </div>
              
              <router-link
                to="/"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                active-class="bg-primary-50 text-primary-700"
              >
                Dashboard
              </router-link>
              <router-link
                to="/aggregation"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                active-class="bg-primary-50 text-primary-700"
              >
                Aggregation
              </router-link>
              <router-link
                to="/library"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
                active-class="bg-primary-50 text-primary-700"
              >
                Library
              </router-link>
              <button
                @click="handleLogout"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <router-link
                to="/login"
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Login
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/authStore'
import { setAuthToken } from './services/dataService'

const router = useRouter()
const authStore = useAuthStore()
const showAdminMenu = ref(false)

onMounted(() => {
  // Initialize auth and set token if exists
  if (authStore.token) {
    setAuthToken(authStore.token)
    authStore.initializeAuth()
  }
  
  // Close admin menu when clicking outside
  document.addEventListener('click', closeAdminMenu)
})

onUnmounted(() => {
  document.removeEventListener('click', closeAdminMenu)
})

function toggleAdminMenu() {
  showAdminMenu.value = !showAdminMenu.value
}

function closeAdminMenu() {
  showAdminMenu.value = false
}

async function handleLogout() {
  await authStore.logout()
  setAuthToken(null)
  router.push('/login')
}
</script>
