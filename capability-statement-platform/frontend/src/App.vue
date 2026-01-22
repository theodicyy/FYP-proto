<template>
  <div id="app" class="min-h-screen flex flex-col">
    <!-- Modern Navigation -->
    <nav class="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-secondary-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 lg:h-18">
          <!-- Logo & Brand -->
          <router-link to="/" class="flex items-center gap-3 group">
            <img 
              src="@/images/wongP_logo/Wong_Partnership_Logo_HD_Transparent.png" 
              alt="Wong Partnership" 
              class="h-10 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </router-link>

          <!-- Desktop Navigation -->
          <div class="hidden md:flex items-center gap-1">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </router-link>
              <router-link
                to="/aggregation"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/aggregation' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Aggregation
              </router-link>
              <router-link
                to="/library"
                class="nav-link"
                :class="{ 'nav-link-active': $route.path === '/library' }"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
                Library
              </router-link>
            </template>
          </div>

          <!-- Right Section -->
          <div class="flex items-center gap-3">
            <template v-if="authStore.isAuthenticated">
              <!-- User Info -->
              <div class="hidden sm:flex items-center gap-2">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  {{ getUserInitials() }}
                </div>
                <div class="hidden lg:block">
                  <p class="text-sm font-medium text-secondary-900 leading-tight">{{ authStore.user?.email?.split('@')[0] }}</p>
                  <p class="text-xs text-secondary-500">{{ authStore.isAdmin ? 'Administrator' : 'Associate' }}</p>
                </div>
              </div>

              <!-- Admin Menu (Dropdown) -->
              <div v-if="authStore.isAdmin" class="relative" ref="adminMenuRef">
                <button 
                  @click="toggleAdminMenu"
                  class="btn-icon btn-ghost text-secondary-600"
                  :class="{ 'bg-secondary-100': showAdminMenu }"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                <!-- Admin Dropdown -->
                <Transition name="dropdown">
                  <div v-if="showAdminMenu" class="dropdown right-0">
                    <div class="px-4 py-2 border-b border-secondary-100">
                      <p class="text-xs font-semibold text-secondary-400 uppercase tracking-wider">Admin Panel</p>
                    </div>
                    <router-link
                      to="/admin/lawyers"
                      @click="showAdminMenu = false"
                      class="dropdown-item flex items-center gap-3"
                    >
                      <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Lawyers Management
                    </router-link>
                    <router-link
                      to="/admin/deals"
                      @click="showAdminMenu = false"
                      class="dropdown-item flex items-center gap-3"
                    >
                      <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Deals Management
                    </router-link>
                    <router-link
                      to="/admin/awards"
                      @click="showAdminMenu = false"
                      class="dropdown-item flex items-center gap-3"
                    >
                      <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Awards Management
                    </router-link>
                    <router-link
                      to="/admin/templates"
                      @click="showAdminMenu = false"
                      class="dropdown-item flex items-center gap-3"
                    >
                      <svg class="w-4 h-4 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      Templates Management
                    </router-link>
                  </div>
                </Transition>
              </div>

              <!-- Logout Button -->
              <button
                @click="handleLogout"
                class="btn btn-ghost text-secondary-500 hover:text-red-600"
                title="Sign Out"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span class="hidden sm:inline">Sign Out</span>
              </button>
            </template>
            <template v-else>
              <router-link to="/login" class="btn btn-primary">
                Sign In
              </router-link>
            </template>

            <!-- Mobile Menu Button -->
            <button 
              @click="showMobileMenu = !showMobileMenu"
              class="md:hidden btn-icon btn-ghost"
            >
              <svg v-if="!showMobileMenu" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <Transition name="slide-down">
        <div v-if="showMobileMenu" class="md:hidden border-t border-secondary-100 bg-white">
          <div class="px-4 py-3 space-y-1">
            <template v-if="authStore.isAuthenticated">
              <router-link
                to="/"
                @click="showMobileMenu = false"
                class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/' }"
              >
                Dashboard
              </router-link>
              <router-link
                to="/aggregation"
                @click="showMobileMenu = false"
                class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/aggregation' }"
              >
                Aggregation
              </router-link>
              <router-link
                to="/library"
                @click="showMobileMenu = false"
                class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                :class="{ 'bg-primary-50 text-primary-700': $route.path === '/library' }"
              >
                Library
              </router-link>
              
              <!-- Admin Links (Mobile) -->
              <template v-if="authStore.isAdmin">
                <div class="pt-3 mt-3 border-t border-secondary-100">
                  <p class="px-4 py-2 text-xs font-semibold text-secondary-400 uppercase tracking-wider">Admin</p>
                  <router-link
                    to="/admin/lawyers"
                    @click="showMobileMenu = false"
                    class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                  >
                    Lawyers Management
                  </router-link>
                  <router-link
                    to="/admin/deals"
                    @click="showMobileMenu = false"
                    class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                  >
                    Deals Management
                  </router-link>
                  <router-link
                    to="/admin/awards"
                    @click="showMobileMenu = false"
                    class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                  >
                    Awards Management
                  </router-link>
                  <router-link
                    to="/admin/templates"
                    @click="showMobileMenu = false"
                    class="block px-4 py-3 rounded-lg text-secondary-700 hover:bg-secondary-50"
                  >
                    Templates Management
                  </router-link>
                </div>
              </template>
            </template>
          </div>
        </div>
      </Transition>
    </nav>

    <!-- Main Content -->
    <main class="flex-1">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-view v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t border-secondary-100 bg-white/50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <img 
              src="@/images/wongP_logo/Wong_Partnership_Logo_HD_Transparent.png" 
              alt="Wong Partnership" 
              class="h-6 w-auto opacity-60"
            />
            <span class="text-sm text-secondary-400">Capability Statement Platform</span>
          </div>
          <p class="text-xs text-secondary-400">
            © {{ new Date().getFullYear() }} Wong Partnership. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
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
const showMobileMenu = ref(false)
const adminMenuRef = ref(null)

onMounted(() => {
  // Initialize auth and set token if exists
  if (authStore.token) {
    setAuthToken(authStore.token)
    authStore.initializeAuth()
  }
  
  // Close menus when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(event) {
  if (adminMenuRef.value && !adminMenuRef.value.contains(event.target)) {
    showAdminMenu.value = false
  }
}

function toggleAdminMenu() {
  showAdminMenu.value = !showAdminMenu.value
}

function getUserInitials() {
  const email = authStore.user?.email || ''
  const name = email.split('@')[0]
  return name.substring(0, 2).toUpperCase()
}

async function handleLogout() {
  await authStore.logout()
  setAuthToken(null)
  showMobileMenu.value = false
  router.push('/login')
}
</script>

<style scoped>
/* Navigation link styles */
.nav-link {
  @apply flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150;
  color: #6b6f72;
}

.nav-link:hover {
  background-color: rgba(160, 161, 164, 0.08);
  color: #54585B;
}

.nav-link-active {
  background-color: #e8f3f4;
  color: #296067;
}

/* Dropdown transition */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease-out;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Slide down transition (mobile menu) */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
