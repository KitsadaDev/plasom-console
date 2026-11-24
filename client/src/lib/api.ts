import axios from 'axios'

// ===========================
// Axios instance หลักของแอป
// ทุก request ไปที่ /api (Vite proxy → localhost:4000)
// ===========================
const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// ===========================
// Request interceptor: แนบ JWT token อัตโนมัติ
// ===========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('coolcare_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ===========================
// Response interceptor: จัดการ 401 → redirect ไป /login
// ===========================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('coolcare_token')
      const path = window.location.pathname
      const isProtectedPath =
        path.startsWith('/admin') ||
        path.startsWith('/projects') ||
        error.config?.url?.includes('/admin') ||
        error.config?.url?.includes('/projects')

      if (isProtectedPath && !path.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
