import axios from 'axios'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle 401 — token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.includes('/auth/')
    const is401 = error.response?.status === 401
    const detail = error.response?.data?.detail?.toLowerCase?.() || ''

    const isTokenError =
      detail.includes('token') ||
      detail.includes('expired') ||
      detail.includes('kedaluwarsa') ||
      detail.includes('invalid credentials')

    if (is401 && !isAuthEndpoint && isTokenError) {
      localStorage.clear()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api