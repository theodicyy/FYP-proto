import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
})

// ============================
// Request interceptor
// ============================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ============================
// Response interceptor
// ============================
api.interceptors.response.use(
  (response) => {
    /*
      🔑 IMPORTANT:

      If this is a blob (DOCX / PDF),
      return full response so binary stays intact.
    */
    if (response.config.responseType === 'blob') {
      return response
    }

    // Normal JSON responses
    return response.data
  },
  (error) => {
    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'An error occurred'

    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')

      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(new Error(message))
  }
)

export default api
