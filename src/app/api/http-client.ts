import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/app/config/env'
import type { ApiResponse, LoginDto } from '@/app/api/types'
import {
  isServiceUnavailableError,
  redirectToServiceUnavailable,
} from '@/app/api/service-unavailable'
import { useAuthStore } from '@/shared/stores/auth.store'

export const http = axios.create({
  baseURL: env.apiBaseUrl,
})

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean }

let refreshPromise: Promise<string | null> | null = null

function clearSessionAndRedirect() {
  useAuthStore.getState().clearSession()
  if (window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

function setAuthorizationHeader(config: InternalAxiosRequestConfig, token: string) {
  const value = `Bearer ${token}`
  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', value)
    return
  }
  const headers = AxiosHeaders.from(config.headers ?? {})
  headers.set('Authorization', value)
  config.headers = headers
}

/** Let the browser set `multipart/form-data; boundary=...`. A bare Content-Type drops the JWT on retry. */
function stripContentTypeForFormData(config: InternalAxiosRequestConfig) {
  if (typeof FormData === 'undefined' || !(config.data instanceof FormData)) {
    return
  }
  if (config.headers instanceof AxiosHeaders) {
    config.headers.delete('Content-Type')
    return
  }
  if (config.headers) {
    delete config.headers['Content-Type']
    delete config.headers['content-type']
  }
}

function isAuthPublicUrl(url: string | undefined): boolean {
  if (!url) return false
  return (
    url.includes('/api/auth/login') ||
    url.includes('/api/auth/refresh-token') ||
    url.includes('/api/auth/signup') ||
    url.includes('/api/auth/forgot-password') ||
    url.includes('/api/auth/verify-otp') ||
    url.includes('/api/auth/reset-password') ||
    url.includes('/api/auth/signup-verify-otp')
  )
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
    const login = data?.data
    if (!data?.success || !login?.accessToken || !login.refreshToken) {
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
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      redirectToServiceUnavailable()
      return null
    }
    clearSessionAndRedirect()
    return null
  }
}

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  stripContentTypeForFormData(config)
  const token = useAuthStore.getState().accessToken
  if (token) {
    setAuthorizationHeader(config, token)
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    if (isServiceUnavailableError(error)) {
      redirectToServiceUnavailable()
      return Promise.reject(error)
    }

    const original = error.config as RetryConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || original._retry || isAuthPublicUrl(original.url)) {
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

    stripContentTypeForFormData(original)
    setAuthorizationHeader(original, nextToken)
    return http(original)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
      return message
    }
    if (error.response?.status === 401) {
      return 'Unauthorized'
    }
  }
  if (error instanceof Error && error.message) {
    return error.message
  }
  return fallback
}

export function isUnauthorizedError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}
