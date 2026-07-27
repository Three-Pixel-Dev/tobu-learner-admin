import axios, { type AxiosError } from 'axios'

const RETURN_TO_KEY = 'tobu.pre503Path'
const SUPPRESS_UNTIL_KEY = 'tobu.suppress503Until'

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

function is503RedirectSuppressed(): boolean {
  if (typeof window === 'undefined') return false
  const until = Number(sessionStorage.getItem(SUPPRESS_UNTIL_KEY) || 0)
  if (!Number.isFinite(until) || until <= 0) return false
  if (Date.now() < until) return true
  sessionStorage.removeItem(SUPPRESS_UNTIL_KEY)
  return false
}

/** Call after health recovers so the next page load is not bounced back to /503. */
export function suppressServiceUnavailableRedirect(ms = 8_000): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SUPPRESS_UNTIL_KEY, String(Date.now() + ms))
}

export function rememberPathBeforeServiceUnavailable(): void {
  if (typeof window === 'undefined') return
  const path = window.location.pathname + window.location.search
  if (path === '/503' || path.startsWith('/503?')) return
  if (path === '/status' || path.startsWith('/status?')) return
  sessionStorage.setItem(RETURN_TO_KEY, path || '/')
}

export function consumePathAfterServiceUnavailable(): string {
  if (typeof window === 'undefined') return '/'
  const saved = sessionStorage.getItem(RETURN_TO_KEY)
  sessionStorage.removeItem(RETURN_TO_KEY)
  if (!saved || saved === '/503' || saved.startsWith('/503?')) return '/'
  return saved
}

export function redirectToServiceUnavailable(): void {
  if (typeof window === 'undefined') return
  if (window.location.pathname === '/503') return
  if (is503RedirectSuppressed()) return

  rememberPathBeforeServiceUnavailable()
  window.location.assign('/503')
}
