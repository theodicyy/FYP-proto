import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dataService from '../services/dataService'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isAdmin = computed(() => user.value?.roleType === 'admin')
  const isAssociate = computed(() => user.value?.roleType === 'associate')

  // Actions
  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const response = await dataService.login({ email, password })
      
      if (response.success) {
        token.value = response.data.token
        user.value = response.data.user
        localStorage.setItem('authToken', response.data.token)
        
        // Fetch current user details
        await fetchCurrentUser()
        
        return response.data
      } else {
        throw new Error(response.error?.message || 'Login failed')
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null
    try {
      if (token.value) {
        await dataService.logout()
      }
    } catch (err) {
      console.error('Logout error:', err)
      // Continue with logout even if API call fails
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('authToken')
      loading.value = false
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return null
    
    loading.value = true
    error.value = null
    try {
      const response = await dataService.getCurrentUser()
      if (response.success) {
        user.value = response.data
        return response.data
      }
    } catch (err) {
      error.value = err.message
      // If token is invalid, clear it
      if (err.message.includes('401') || err.message.includes('Invalid')) {
        await logout()
      }
    } finally {
      loading.value = false
    }
  }

  function initializeAuth() {
    // Check if we have a token and fetch user
    if (token.value) {
      fetchCurrentUser()
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    // Computed
    isAuthenticated,
    isAdmin,
    isAssociate,
    // Actions
    login,
    logout,
    fetchCurrentUser,
    initializeAuth
  }
})
