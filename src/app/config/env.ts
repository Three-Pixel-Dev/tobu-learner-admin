const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:8080').replace(
  /\/$/,
  '',
)

export const env = {
  apiBaseUrl,
  /** Spring Boot Actuator health (public; used by the 503 recovery screen). */
  healthUrl: `${apiBaseUrl}/actuator/health`,
} as const

