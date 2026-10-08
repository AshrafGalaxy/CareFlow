import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 60000, // 60s default timeout to tolerate free-tier cold starts
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`

  // Give auth endpoints up to 90 seconds to tolerate cold-start container spins
  if (config.url?.includes('/api/auth/')) {
    config.timeout = 90000
  }

  return config
})

api.interceptors.response.use(
  res => res,
  async err => {
    const url = err.config?.url || ''
    const isAuthAttempt =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/refresh')

    // Only redirect on 401 for authenticated app requests, NOT during login/register attempts
    if (err.response?.status === 401 && !isAuthAttempt) {
      useAuthStore.getState().logout()
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

/**
 * Parses API errors into user-friendly diagnostic messages,
 * distinguishing between invalid credentials, cold-start timeouts, and network errors.
 */
export function parseApiError(err: unknown): {
  message: string
  isTimeout: boolean
  isServerWaking: boolean
  status?: number
} {
  const anyErr = err as {
    code?: string
    message?: string
    response?: { status?: number; data?: { detail?: string } }
  }

  const status = anyErr?.response?.status

  // 1. Timeout / Abort (Cold Start took longer than timeout)
  if (anyErr?.code === 'ECONNABORTED' || anyErr?.message?.toLowerCase().includes('timeout')) {
    return {
      message: 'The cloud server is taking time to wake up from idle mode. Please try again in a moment.',
      isTimeout: true,
      isServerWaking: true,
      status,
    }
  }

  // 2. Gateway Booting / Service Unavailable (502, 503, 504 on Render/Railway)
  if (status && [502, 503, 504].includes(status)) {
    return {
      message: 'Cloud service is currently starting up from idle mode. Please wait ~10 seconds and try again.',
      isTimeout: false,
      isServerWaking: true,
      status,
    }
  }

  // 3. Network unreachable (Server completely cold / booting)
  if (!anyErr?.response || anyErr?.message === 'Network Error') {
    return {
      message: 'Unable to reach the CareFlow server. It may be booting up from sleep mode. Please try again shortly.',
      isTimeout: false,
      isServerWaking: true,
      status,
    }
  }

  // 4. Invalid credentials (401)
  if (status === 401) {
    return {
      message: anyErr.response?.data?.detail || 'Invalid email or password. Please verify your credentials.',
      isTimeout: false,
      isServerWaking: false,
      status: 401,
    }
  }

  // 5. Access forbidden (403)
  if (status === 403) {
    return {
      message: anyErr.response?.data?.detail || 'Access denied. You do not have permission for this portal.',
      isTimeout: false,
      isServerWaking: false,
      status: 403,
    }
  }

  // 6. Generic server validation detail
  if (anyErr.response?.data?.detail) {
    return {
      message: anyErr.response.data.detail,
      isTimeout: false,
      isServerWaking: false,
      status,
    }
  }

  return {
    message: 'Authentication failed. Please check your connection and try again.',
    isTimeout: false,
    isServerWaking: false,
    status,
  }
}

export default api
