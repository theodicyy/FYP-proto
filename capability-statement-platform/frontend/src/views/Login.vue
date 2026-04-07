<template>
  <div class="login-page h-full min-h-0 w-full flex flex-col lg:flex-row overflow-hidden bg-slate-100">
    <!-- Brand (desktop): calm, no feature list -->
    <aside
      class="relative hidden min-h-0 lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-primary-950 px-10 py-10 xl:px-14 xl:py-12 text-white"
    >
      <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_0%_0%,rgba(41,96,103,0.45),transparent_55%),radial-gradient(ellipse_70%_50%_at_100%_100%,rgba(105,153,157,0.2),transparent_50%)]" />
      <div class="relative z-[1] flex flex-col gap-10">
        <!-- Full wordmark on a light plate: the W-only asset is tiny on a wide panel and the teal in the mark clashes with this teal background -->
        <div
          class="login-brand-plate w-fit max-w-full rounded-2xl bg-white px-6 py-4 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/5"
        >
          <img
            src="@/images/wongP_logo/Wong_Partnership_Logo_HD_Transparent.png"
            alt="Wong Partnership"
            class="h-10 w-auto max-w-full sm:h-11"
            decoding="async"
          />
        </div>
        <div>
          <p class="text-display-sm xl:text-display-md text-white font-semibold tracking-tight">
            Capability statements, without the friction.
          </p>
          <p class="mt-4 max-w-md text-[15px] leading-relaxed text-primary-100/90">
            Sign in to draft, aggregate, and publish firm capability content in one place.
          </p>
        </div>
      </div>
      <p class="relative z-[1] text-xs text-primary-200/80">
        © {{ new Date().getFullYear() }} Wong Partnership
      </p>
    </aside>

    <!-- Form region -->
    <section
      class="relative flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-8 sm:px-6 lg:px-10"
    >
      <div class="w-full max-w-[26rem] min-h-0 flex flex-col items-stretch">
        <div class="mb-8 flex justify-center lg:hidden">
          <img
            src="@/images/wongP_logo/Wong_Partnership_Logo_HD_Transparent.png"
            alt="Wong Partnership"
            class="h-11 w-auto"
          />
        </div>

        <div
          class="login-card max-h-[min(100%,calc(100svh-4rem))] min-h-0 overflow-y-auto overscroll-y-contain rounded-3xl border border-slate-200/90 bg-white px-7 py-8 shadow-medium sm:px-9 sm:py-9"
        >
          <header class="mb-7">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.65rem]">
              Sign in
            </h1>
            <p class="mt-1.5 text-sm leading-relaxed text-slate-500">
              Use your firm email and password.
            </p>
          </header>

          <Transition name="fade">
            <div
              v-if="authStore.error"
              class="mb-5 rounded-xl border border-red-200/80 bg-red-50 px-3.5 py-3 text-sm text-red-900"
              role="alert"
            >
              <p class="font-medium text-red-950">Could not sign in</p>
              <p class="mt-0.5 leading-snug text-red-800/95">{{ authStore.error }}</p>
            </div>
          </Transition>

          <form class="space-y-5" @submit.prevent="handleLogin">
            <div class="input-group">
              <label for="email" class="label text-slate-700">Email</label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                class="input text-slate-900 placeholder:text-slate-400"
                placeholder="name@firm.com"
              />
            </div>

            <div class="input-group">
              <label for="password" class="label text-slate-700">Password</label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="input pr-12 text-slate-900 placeholder:text-slate-400"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3.5 text-slate-400 transition-colors hover:text-primary-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40"
                  :aria-pressed="showPassword"
                  :aria-label="showPassword ? 'Hide password' : 'Show password'"
                  @click="showPassword = !showPassword"
                >
                  <svg
                    v-if="!showPassword"
                    class="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.5"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary w-full !py-3 text-[15px] font-semibold shadow-sm"
              :disabled="authStore.loading"
            >
              <span v-if="authStore.loading" class="inline-flex items-center justify-center gap-2">
                <svg class="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  />
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in…
              </span>
              <span v-else>Continue</span>
            </button>
          </form>

          <details class="login-details group mt-7 border-t border-slate-100 pt-6">
            <summary
              class="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-medium text-slate-600 outline-none transition-colors hover:text-slate-900 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-primary-500/35"
            >
              <span>Demo accounts (testing)</span>
              <svg
                class="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </summary>
            <div class="mt-4 space-y-3 text-sm">
              <div class="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/80">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Administrator</p>
                <p class="mt-1 font-mono text-[13px] text-slate-800">
                  admin@lawfirm.com
                </p>
                <p class="font-mono text-[13px] text-slate-800">admin123</p>
              </div>
              <div class="rounded-xl bg-slate-50 px-3 py-2.5 ring-1 ring-slate-200/80">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Associate</p>
                <p class="mt-1 font-mono text-[13px] text-slate-800">
                  associate@lawfirm.com
                </p>
                <p class="font-mono text-[13px] text-slate-800">associate123</p>
              </div>
            </div>
          </details>

          <Transition name="fade">
            <div
              v-if="authStore.isAuthenticated"
              class="mt-5 rounded-xl border border-accent-200 bg-accent-50 px-3 py-3 text-center text-sm text-slate-700"
            >
              <p>
                Signed in as
                <strong class="text-slate-900">{{ authStore.user?.email }}</strong>
              </p>
              <button
                type="button"
                class="btn-link mt-2 text-sm font-semibold text-primary-700"
                @click="handleLogout"
              >
                Sign out
              </button>
            </div>
          </Transition>
        </div>

        <p class="mt-6 text-center text-xs text-slate-400 lg:hidden">
          © {{ new Date().getFullYear() }} Wong Partnership
        </p>
      </div>
    </section>
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
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.login-details summary::-webkit-details-marker {
  display: none;
}
</style>
