<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Branding (clean, professional) -->
    <div class="hidden lg:flex lg:w-1/2 relative overflow-hidden" style="background-color: #296067;">
      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 login-pattern"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        <div>
          <img 
            src="@/images/wongP_logo/WongP_W_Logo_HD_Transparent.png" 
            alt="Wong Partnership" 
            class="h-16 w-auto mb-8"
          />
        </div>
        
        <div class="max-w-md">
          <h1 class="text-4xl font-semibold mb-4 leading-tight tracking-tight">
            Capability Statement Platform
          </h1>
          <p class="text-lg text-white/75 leading-relaxed">
            Streamline your capability statement creation with our intelligent document generation system.
          </p>
          
          <div class="mt-10 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="text-white/85">Template-based document generation</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-white/85">Centralized data aggregation</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <span class="text-white/85">Version-controlled library</span>
            </div>
          </div>
        </div>
        
        <div class="text-sm text-white/40">
          © {{ new Date().getFullYear() }} Wong Partnership. All rights reserved.
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-[#fafbfc]">
      <div class="w-full max-w-md">
        <!-- Mobile Logo -->
        <div class="lg:hidden mb-10 text-center">
          <img 
            src="@/images/wongP_logo/Wong_Partnership_Logo_HD_Transparent.png" 
            alt="Wong Partnership" 
            class="h-12 w-auto mx-auto mb-4"
          />
        </div>

        <!-- Header -->
        <div class="mb-8">
          <h2 class="text-2xl font-semibold mb-2" style="color: #54585B;">Welcome back</h2>
          <p style="color: #8a8d90;">Sign in to access your capability statements</p>
        </div>
        
        <!-- Error Alert -->
        <Transition name="fade">
          <div v-if="authStore.error" class="alert alert-error mb-6 flex items-start gap-3">
            <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ authStore.error }}</span>
          </div>
        </Transition>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="input-group">
            <label for="email" class="label">Email address</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center" style="color: #A0A1A4;">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </span>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="input pl-12"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password" class="label">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center" style="color: #A0A1A4;">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="input pl-12 pr-12"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                style="color: #A0A1A4;"
              >
                <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn btn-primary w-full btn-lg"
          >
            <span v-if="authStore.loading" class="flex items-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </form>

        <!-- Test Credentials -->
        <div class="mt-8 p-5 rounded-lg" style="background-color: rgba(160, 161, 164, 0.08); border: 1px solid rgba(160, 161, 164, 0.15);">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style="background-color: #e8f3f4;">
              <svg class="w-4 h-4" style="color: #296067;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium mb-2" style="color: #54585B;">Demo Credentials</p>
              <div class="space-y-1 text-sm" style="color: #6b6f72;">
                <p><span class="font-medium" style="color: #54585B;">Admin:</span> admin@lawfirm.com / admin123</p>
                <p><span class="font-medium" style="color: #54585B;">Associate:</span> associate@lawfirm.com / associate123</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Already logged in -->
        <Transition name="fade">
          <div v-if="authStore.isAuthenticated" class="mt-6 p-4 rounded-lg text-center" style="background-color: #f0f7f7; border: 1px solid rgba(105, 153, 157, 0.2);">
            <p class="text-sm mb-2" style="color: #54585B;">
              You're already signed in as <strong>{{ authStore.user?.email }}</strong>
            </p>
            <button @click="handleLogout" class="text-sm font-medium" style="color: #69999D;">
              Sign out
            </button>
          </div>
        </Transition>
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
const showPassword = ref(false)

onMounted(() => {
  authStore.initializeAuth()
  
  if (authStore.isAuthenticated) {
    router.push('/')
  }
  
  if (authStore.token) {
    setAuthToken(authStore.token)
  }
})

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    setAuthToken(authStore.token)
    router.push('/')
  } catch (error) {
    console.error('Login error:', error)
  }
}

async function handleLogout() {
  await authStore.logout()
  setAuthToken(null)
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.login-pattern {
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
