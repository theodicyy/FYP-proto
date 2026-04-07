<template>
  <div class="min-h-screen flex">
    <!-- Left Panel - Branding (gradient + depth) -->
    <div
      class="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-950 via-primary-800 to-primary-500"
    >
      <!-- Soft light orbs -->
      <div
        class="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary-300/25 blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        class="absolute bottom-0 left-0 w-[22rem] h-[22rem] rounded-full bg-accent-300/20 blur-3xl pointer-events-none translate-y-1/4 -translate-x-1/3"
        aria-hidden="true"
      />
      <!-- Subtle pattern overlay -->
      <div class="absolute inset-0 login-pattern"></div>
      
      <!-- Content -->
      <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        <div>
          <img 
            src="@/images/wongP_logo/WongP_W_Logo_HD_Transparent.png" 
            alt="Wong Partnership" 
            class="h-16 w-auto mb-8 drop-shadow-md"
          />
        </div>
        
        <div class="max-w-md">
          <h1
            class="text-4xl font-semibold mb-4 leading-tight tracking-tight text-white drop-shadow-sm"
          >
            Capability Statement Platform
          </h1>
          <p class="text-lg text-white/95 leading-relaxed font-normal">
            Streamline your capability statement creation with our intelligent document generation system.
          </p>
          
          <div class="mt-10 space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-white/15 border border-white/10 flex items-center justify-center shadow-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span class="text-white font-medium drop-shadow-sm">Template-based document generation</span>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-white/15 border border-white/10 flex items-center justify-center shadow-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span class="text-white font-medium drop-shadow-sm">Centralized data aggregation</span>
            </div>
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg bg-white/15 border border-white/10 flex items-center justify-center shadow-sm"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                </svg>
              </div>
              <span class="text-white font-medium drop-shadow-sm">Version-controlled library</span>
            </div>
          </div>
        </div>
        
        <div class="text-sm text-white/70">
          © {{ new Date().getFullYear() }} Wong Partnership. All rights reserved.
        </div>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div
      class="login-form-root flex-1 flex items-center justify-center p-6 sm:p-10 min-h-screen bg-gradient-to-br from-slate-100 via-primary-50 to-accent-100/90 text-slate-800 antialiased"
    >
      <div
        class="login-form-card w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-strong px-6 sm:px-10 py-10 sm:py-12"
      >
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
          <p class="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-2">
            Wong Partnership
          </p>
          <h2 class="text-2xl sm:text-3xl font-semibold text-primary-950 tracking-tight text-balance">
            Welcome back
          </h2>
          <div class="mt-3 h-1 w-14 rounded-full bg-primary-500" aria-hidden="true" />
          <p class="mt-4 text-slate-600 text-sm sm:text-base leading-relaxed">
            Sign in to access your capability statements
          </p>
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
        <form @submit.prevent="handleLogin" class="login-form space-y-5">
          <div class="input-group">
            <label for="email" class="label text-slate-800 font-semibold">Email address</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-primary-500/90">
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
                class="input pl-12 text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password" class="label text-slate-800 font-semibold">Password</label>
            <div class="relative">
              <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-primary-500/90">
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
                class="input pl-12 pr-12 text-slate-900 placeholder:text-slate-400 bg-slate-50/80 focus:bg-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors text-slate-500 hover:text-primary-600"
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
        <div
          class="mt-8 p-5 rounded-xl bg-primary-50 border border-primary-200"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/80 text-primary-600 shadow-sm border border-primary-100"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold mb-2 text-primary-900">Demo credentials</p>
              <div class="space-y-1.5 text-sm text-slate-700 leading-relaxed">
                <p>
                  <span class="font-semibold text-slate-800">Admin:</span>
                  admin@lawfirm.com / admin123
                </p>
                <p>
                  <span class="font-semibold text-slate-800">Associate:</span>
                  associate@lawfirm.com / associate123
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Already logged in -->
        <Transition name="fade">
          <div
            v-if="authStore.isAuthenticated"
            class="mt-6 p-4 rounded-xl text-center bg-accent-50 border border-accent-200"
          >
            <p class="text-sm mb-2 text-slate-700">
              You're already signed in as <strong class="text-slate-900">{{ authStore.user?.email }}</strong>
            </p>
            <button
              type="button"
              @click="handleLogout"
              class="text-sm font-semibold text-primary-700 hover:text-primary-900 underline underline-offset-2 transition-colors"
            >
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
  opacity: 0.06;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}
</style>
