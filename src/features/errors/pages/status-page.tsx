import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { probeApiHealth, type HealthStatus } from '@/shared/services/health.service'
import { cn } from '@/util/cn'

const POLL_MS = 30_000
const HISTORY_DAYS = 90

const BANNER: Record<
  HealthStatus,
  { title: string; sub: string; icon: string; tone: string; titleClass: string }
> = {
  UP: {
    title: 'All systems operational',
    sub: 'API responded normally on the last check.',
    icon: '✓',
    tone: 'border-[#86EFAC] bg-primary-soft',
    titleClass: 'text-primary-dark',
  },
  DOWN: {
    title: 'Service disruption',
    sub: 'The API is down or unreachable right now. Retry shortly — your data is safe.',
    icon: '✕',
    tone: 'border-[#FCA5A5] bg-destructive-soft',
    titleClass: 'text-destructive',
  },
  UNKNOWN: {
    title: 'Unable to confirm status',
    sub: "Your browser couldn't read a clear health response. Try refreshing in a moment.",
    icon: '?',
    tone: 'border-warning bg-warning-soft',
    titleClass: 'text-warning-foreground',
  },
}

/** Demo history bars — Actuator only reports current status (see mock notes). */
function buildHistoryDays() {
  return Array.from({ length: HISTORY_DAYS }, (_, index) => {
    if (index === 34) return 'degraded' as const
    return 'up' as const
  })
}

export function StatusPage() {
  const [status, setStatus] = useState<HealthStatus>('UNKNOWN')
  const [responseMs, setResponseMs] = useState<number | null>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [announce, setAnnounce] = useState('')
  const [subscribeMsg, setSubscribeMsg] = useState('')
  const lastStatusRef = useRef<HealthStatus | null>(null)
  const history = useRef(buildHistoryDays()).current

  const runCheck = useCallback(async (manual: boolean) => {
    if (manual) setSpinning(true)
    const result = await probeApiHealth()
    setStatus(result.status)
    setResponseMs(result.responseMs)
    setLastChecked(result.checkedAt)

    if (lastStatusRef.current !== result.status) {
      const copy = BANNER[result.status]
      setAnnounce(`${copy.title}. ${copy.sub}`)
      lastStatusRef.current = result.status
    }

    if (manual) {
      window.setTimeout(() => setSpinning(false), 700)
    }
  }, [])

  useEffect(() => {
    document.title = 'Tobu Status — Tobu Admin'
    void runCheck(false)
    const id = window.setInterval(() => {
      void runCheck(false)
    }, POLL_MS)
    return () => window.clearInterval(id)
  }, [runCheck])

  const banner = BANNER[status]
  const uptimePct = '99.94%'
  const responseTone =
    responseMs != null && responseMs > 800 ? 'text-warning-foreground' : 'text-primary-dark'

  const onSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    const email = new FormData(form).get('email')
    if (typeof email !== 'string' || !email.trim()) return
    setSubscribeMsg(`Subscribed ${email.trim()} (demo only).`)
    form.reset()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="absolute left-[-999px] top-0 z-[100] rounded-br-[10px] bg-sidebar px-[16px] py-[10px] text-[13px] font-semibold text-primary-foreground focus:left-0"
      >
        Skip to main content
      </a>

      <div className="mx-auto max-w-[760px] px-[20px] pt-[40px] pb-[80px]">
        <header className="mb-[28px] flex flex-wrap items-center justify-between gap-[12px]">
          <div className="flex items-center gap-[10px]">
            <div
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[11px] bg-primary text-[18px]"
              aria-hidden
            >
              🦉
            </div>
            <div className="font-display text-[18px] font-bold">Tobu Status</div>
          </div>
          <div className="flex items-center gap-[8px] text-[12px] text-muted-foreground">
            <span>
              {lastChecked
                ? `Last checked ${lastChecked.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                : 'Checking…'}
            </span>
            <button
              type="button"
              className="inline-flex items-center gap-[5px] rounded-[9px] border-[1.5px] border-border px-[10px] py-[6px] text-[12px] font-semibold text-muted-foreground hover:bg-card"
              aria-label="Check status now"
              onClick={() => void runCheck(true)}
            >
              <span
                className={cn(
                  'inline-block',
                  spinning && 'animate-[spin_0.7s_linear] motion-reduce:animate-none',
                )}
                aria-hidden
              >
                ↻
              </span>
              Refresh
            </button>
          </div>
        </header>

        <main id="main">
          <p className="sr-only" role="status" aria-live="polite">
            {announce}
          </p>

          <div
            className={cn(
              'mb-[24px] flex items-center gap-[18px] rounded-[22px] border-[1.5px] px-[28px] py-[26px]',
              banner.tone,
            )}
          >
            <div
              className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-[16px] bg-card text-[26px]"
              aria-hidden
            >
              {banner.icon}
            </div>
            <div className="text-left">
              <p className={cn('m-0 mb-[3px] font-display text-[19px] font-bold', banner.titleClass)}>
                {banner.title}
              </p>
              <p className="m-0 text-[13px] text-muted-foreground">{banner.sub}</p>
            </div>
          </div>

          <div className="mb-[24px] grid grid-cols-1 gap-[14px] sm:grid-cols-2">
            <div className="rounded-[16px] bg-card px-[18px] py-[16px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <div className="mb-[6px] text-[11px] font-bold tracking-[0.05em] text-subtle uppercase">
                Response time
              </div>
              <div className={cn('font-display text-[22px] font-bold', responseTone)}>
                {responseMs == null ? '—' : `${responseMs} ms`}
              </div>
              <div className="mt-[4px] text-[11.5px] text-muted-foreground">
                Measured from your browser just now
              </div>
            </div>
            <div className="rounded-[16px] bg-card px-[18px] py-[16px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <div className="mb-[6px] text-[11px] font-bold tracking-[0.05em] text-subtle uppercase">
                Uptime (90 days)
              </div>
              <div className="font-display text-[22px] font-bold text-primary-dark">{uptimePct}</div>
              <div className="mt-[4px] text-[11.5px] text-muted-foreground">
                Based on checks every 5 minutes
              </div>
            </div>
          </div>

          <section className="mb-[26px]" aria-labelledby="uptimeHeading">
            <div className="mb-[12px] flex flex-wrap items-baseline justify-between gap-[8px]">
              <h2 id="uptimeHeading" className="m-0 font-display text-[15px] font-bold">
                90-day history
              </h2>
              <span className="text-[12.5px] text-muted-foreground">
                Average: <strong className="text-primary-dark">{uptimePct}</strong> uptime
              </span>
            </div>
            <div
              className="flex h-[40px] gap-[2px] rounded-[12px] bg-card p-[8px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
              role="img"
              aria-label={`Uptime history for the last ${HISTORY_DAYS} days: ${uptimePct} average, one degraded day, no outages`}
            >
              {history.map((day, index) => (
                <button
                  key={index}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  title={
                    day === 'up'
                      ? `${HISTORY_DAYS - index}d ago · 100% uptime`
                      : `${HISTORY_DAYS - index}d ago · Degraded — elevated response times`
                  }
                  className={cn(
                    'min-w-[2px] flex-1 rounded-[4px] border-none p-0',
                    day === 'up' && 'bg-primary',
                    day === 'degraded' && 'bg-warning',
                  )}
                />
              ))}
            </div>
            <div className="mt-[6px] flex justify-between text-[11px] text-subtle">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </section>

          <section className="mb-[26px]" aria-labelledby="incidentsHeading">
            <div className="mb-[12px]">
              <h2 id="incidentsHeading" className="m-0 font-display text-[15px] font-bold">
                Recent incidents
              </h2>
            </div>

            <div className="mb-[10px] rounded-[16px] bg-card px-[18px] py-[16px] text-left shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <div className="mb-[4px] flex items-center gap-[8px]">
                <span className="h-[8px] w-[8px] rounded-full bg-primary" aria-hidden />
                <span className="text-[13.5px] font-semibold">Elevated response times</span>
                <span className="ml-auto text-[11.5px] text-subtle">Jul 18, 2026 — Resolved</span>
              </div>
              <p className="m-0 ml-[16px] text-[12.5px] text-muted-foreground">
                Database connection pool briefly saturated during a traffic spike. Auto-scaled and
                recovered in 6 minutes. No data was affected.
              </p>
            </div>

            <div className="rounded-[16px] bg-card px-[20px] py-[30px] text-center shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
              <div className="mb-[8px] text-[26px]" aria-hidden>
                🎉
              </div>
              <p className="m-0 text-[13px] text-muted-foreground">
                No other incidents in the last 90 days.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap items-center justify-between gap-[10px] rounded-[18px] bg-card p-[20px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
            <div className="text-left">
              <h2 className="m-0 mb-[3px] font-display text-[14.5px] font-bold">
                Get notified of incidents
              </h2>
              <p className="m-0 text-[12px] text-muted-foreground">
                We&apos;ll only email you when something&apos;s actually wrong — no noise.
              </p>
            </div>
            <form className="flex flex-wrap gap-[8px]" onSubmit={onSubscribe}>
              <label htmlFor="status-sub-email" className="sr-only">
                Email address
              </label>
              <Input
                id="status-sub-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-[200px] max-sm:w-full"
              />
              <Button type="submit" className="px-[16px] py-[9px] text-[13px]">
                Subscribe
              </Button>
            </form>
            {subscribeMsg ? (
              <p className="w-full text-left text-[12px] font-semibold text-primary-dark" role="status">
                {subscribeMsg}
              </p>
            ) : null}
          </div>
        </main>

        <p className="mt-[30px] text-center text-[11.5px] text-subtle">
          Tobu Status · powered by Spring Actuator health ·{' '}
          <a href="mailto:support@tobu.app" className="text-primary-dark">
            support@tobu.app
          </a>
          {' · '}
          <Link to="/" className="text-primary-dark">
            Back to admin
          </Link>
        </p>
      </div>
    </div>
  )
}
