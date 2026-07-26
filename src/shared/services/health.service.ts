import { env } from '@/app/config/env'

/** Aggregated Actuator outcome — unknown means the browser couldn't reach the API. */
export type HealthStatus = 'UP' | 'DOWN' | 'UNKNOWN'

export interface HealthCheckResult {
  status: HealthStatus
  /** Round-trip time in ms when a response was received. */
  responseMs: number | null
  checkedAt: Date
}

interface ActuatorHealthResponse {
  status?: string
}

/** Lightweight probe — no auth, no axios interceptors (safe during outages). */
export async function probeApiHealth(timeoutMs = 5000): Promise<HealthCheckResult> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), timeoutMs)
  const started = performance.now()

  try {
    const response = await fetch(env.healthUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    const responseMs = Math.round(performance.now() - started)

    if (!response.ok) {
      return { status: 'DOWN', responseMs, checkedAt: new Date() }
    }

    const body = (await response.json()) as ActuatorHealthResponse
    const status = body.status?.toUpperCase()
    if (status === 'UP') {
      return { status: 'UP', responseMs, checkedAt: new Date() }
    }
    return { status: 'DOWN', responseMs, checkedAt: new Date() }
  } catch {
    // Backend process stopped / connection refused — treat as down for status UX.
    return { status: 'DOWN', responseMs: null, checkedAt: new Date() }
  } finally {
    window.clearTimeout(timer)
  }
}

/** Convenience for recovery flows that only care about UP vs not. */
export async function checkApiHealth(timeoutMs = 5000): Promise<HealthStatus> {
  const result = await probeApiHealth(timeoutMs)
  return result.status
}
