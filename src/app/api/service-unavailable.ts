import axios, { type AxiosError } from 'axios'

/** True when the API is unreachable or explicitly returns 503. */
export function isServiceUnavailableError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false

  const axiosError = error as AxiosError
  if (axiosError.response?.status === 503) return true

  // No HTTP response — browser/network failure (backend down, DNS, CORS blocked, etc.)
  if (!axiosError.response) {
    const code = axiosError.code
    return code === 'ERR_NETWORK' || code === 'ECONNABORTED' || axiosError.message === 'Network Error'
  }

  return false
}

export function redirectToServiceUnavailable(): void {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/503') return
  window.location.assign('/503')
}
