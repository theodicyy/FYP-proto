<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Capability Statement Platform
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      
      <div v-if="authStore.error" class="bg-red-50 border border-red-200 rounded-lg p-4">
        <p class="text-sm text-red-700">{{ authStore.error }}</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
          <p class="font-semibold mb-2">Test Credentials:</p>
          <p><strong>Admin:</strong> admin@lawfirm.com / admin123</p>
          <p><strong>Associate:</strong> associate@lawfirm.com / associate123</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="authStore.loading">Signing in...</span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>

      <div v-if="authStore.isAuthenticated" class="text-center">
        <p class="text-sm text-gray-600">
          Already logged in as: <strong>{{ authStore.user?.email }}</strong>
        </p>
        <button
          @click="handleLogout"
          class="mt-2 text-sm text-primary-600 hover:text-primary-800"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { setAuthToken } from '../services/dataService'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

onMounted(() => {
  // Initialize auth on mount
  authStore.initializeAuth()
  
  // If already authenticated, redirect to dashboard
  if (authStore.isAuthenticated) {
    router.push('/')
  }
  
  // Set token in API client if exists
  if (authStore.token) {
    setAuthToken(authStore.token)
  }
})

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    
    // Set token in API client
    setAuthToken(authStore.token)
    
    // Redirect to dashboard
    router.push('/')
  } catch (error) {
    // Error is already set in store
    console.error('Login error:', error)
  }
}

async function handleLogout() {
  await authStore.logout()
  setAuthToken(null)
  router.push('/login')
}
</script>
