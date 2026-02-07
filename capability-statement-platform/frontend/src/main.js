import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { useAuthStore } from './stores/authStore'
import { setAuthToken } from './services/dataService'
import './assets/print.css'


const app = createApp(App)

const pinia = createPinia()
app.use(pinia)
app.use(router)

// Initialize auth on app start
const authStore = useAuthStore()
if (authStore.token) {
  setAuthToken(authStore.token)
  authStore.initializeAuth()
}

app.mount('#app')
