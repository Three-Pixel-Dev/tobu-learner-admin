import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/app/config/env'
import type { ApiResponse, LoginDto } from '@/app/api/types'
import { useAuthStore } from '@/shared/stores/auth.store'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<string | null> | null = null

function clearSessionAndRedirect() {
  useAuthStore.getState().clearSession()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    clearSessionAndRedirect()
    return null
  }

  try {
    const { data } = await axios.post<ApiResponse<LoginDto>>(
      `${env.apiBaseUrl}/api/auth/refresh-token`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } },
    )
    const login = data.data
    if (!login?.accessToken || !login.refreshToken) {
      clearSessionAndRedirect()
      return null
    }
    useAuthStore.getState().setTokens(login.accessToken, login.refreshToken)
    useAuthStore.getState().setUser({
      userId: login.userId,
      email: login.email,
      name: login.name,
      role: login.role,
    })
    return login.accessToken
  } catch {
    clearSessionAndRedirect()
    return null
  }
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined
    const status = error.response?.status
    const url = original?.url ?? ''

    const isAuthPublic =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/refresh-token') ||
      url.includes('/api/auth/signup') ||
      url.includes('/api/auth/forgot-password')

    if (status !== 401 || !original || original._retry || isAuthPublic) {
      return Promise.reject(error)
    }

    original._retry = true

    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null
      })
    }

    const nextToken = await refreshPromise
    if (!nextToken) {
      return Promise.reject(error)
    }

    original.headers.Authorization = `Bearer ${nextToken}`
    return http(original)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}
