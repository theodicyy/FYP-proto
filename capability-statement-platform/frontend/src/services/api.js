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
      🔑 Return full response for binary (DOCX / PDF)
      so caller can use response.data and response.status.
    */
    if (response.config.responseType === 'blob' || response.config.responseType === 'arraybuffer') {
      return response
    }

    // Normal JSON responses
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    // Reject original error so callers can read response.status / response.data (e.g. 503 + JSON)
    return Promise.reject(error)
  }
)

export default api
