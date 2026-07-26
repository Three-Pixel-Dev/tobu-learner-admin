import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { ErrorPageShell } from '@/features/errors/components/error-page-shell'
import { checkApiHealth } from '@/shared/services/health.service'
import { cn } from '@/util/cn'

const RETRY_SECONDS = 30

function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

export function ServiceUnavailablePage() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(RETRY_SECONDS)
  const [retryStatus, setRetryStatus] = useState('')
  const [checking, setChecking] = useState(false)

  const recoverIfHealthy = useCallback(async () => {
    setChecking(true)
    setRetryStatus('Checking API health…')
    const status = await checkApiHealth()
    if (status === 'UP') {
      setRetryStatus('Service is back. Redirecting…')
      navigate('/', { replace: true })
      return true
    }
    setRetryStatus('API is still unavailable — please wait a little longer.')
    setChecking(false)
    return false
  }, [navigate])

  useEffect(() => {
    if (seconds > 0) {
      const timer = window.setTimeout(() => {
        setSeconds((value) => value - 1)
      }, 1000)

      if (seconds % 10 === 0 && seconds !== RETRY_SECONDS) {
        setRetryStatus(`Still retrying automatically, ${seconds} seconds remaining.`)
      }

      return () => window.clearTimeout(timer)
    }

    let cancelled = false
    void (async () => {
      setRetryStatus('Retrying connection now.')
      const recovered = await recoverIfHealthy()
      if (!cancelled && !recovered) {
        setSeconds(RETRY_SECONDS)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [seconds, recoverIfHealthy])

  const manualRetry = () => {
    void recoverIfHealthy().then((recovered) => {
      if (!recovered) setSeconds(RETRY_SECONDS)
    })
  }

  const fillPercent = Math.max(0, (seconds / RETRY_SECONDS) * 100)

  return (
    <ErrorPageShell documentTitle="Temporarily unavailable">
      <div className="relative mb-[18px] h-[96px] w-[96px]">
        <div
          className="flex h-[96px] w-[96px] animate-bob items-center justify-center rounded-[28px] border-2 border-warning bg-warning-soft text-[44px] motion-reduce:animate-none"
          aria-hidden
        >
          🛠️
        </div>
      </div>

      <p className="m-0 font-display text-[56px] font-bold leading-none" aria-hidden>
        503
      </p>

      <h1 className="m-0 mt-[14px] font-display text-[22px] font-bold outline-none">
        Tobu Admin is briefly unavailable
      </h1>
      <p className="mx-auto mt-[8px] mb-[22px] max-w-[460px] text-[14.5px] text-muted-foreground">
        We&apos;re doing scheduled maintenance to make things faster. This usually takes just a few
        minutes — your data isn&apos;t affected.
      </p>

      <div className="mb-[20px] w-full max-w-[340px] rounded-[16px] border-[1.5px] border-border bg-card px-[22px] py-[16px]">
        <div className="mb-[10px] flex items-center justify-between gap-[12px]">
          <span className="text-[12.5px] font-semibold text-muted-foreground">
            Retrying automatically in
          </span>
          <span className="font-display text-[15px] font-bold text-primary-dark">
            {checking && seconds <= 0 ? 'Checking…' : formatCountdown(seconds)}
          </span>
        </div>
        <div className="h-[6px] overflow-hidden rounded-[20px] bg-muted">
          <div
            className="h-full rounded-[20px] bg-primary transition-[width] duration-1000 ease-linear motion-reduce:transition-none"
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {retryStatus}
      </p>

      <div className="mb-[24px] flex flex-wrap justify-center gap-[10px]">
        <button
          type="button"
          disabled={checking}
          className={cn(buttonVariants({ variant: 'primary' }), 'px-[20px] py-[11px]')}
          onClick={manualRetry}
        >
          {checking ? '↻ Checking…' : '↻ Retry now'}
        </button>
        <Link to="/status" className={cn(buttonVariants({ variant: 'ghost' }), 'px-[20px] py-[11px]')}>
          📊 View status page
        </Link>
      </div>

      <p className="max-w-[460px] text-[12.5px] text-muted-foreground">
        Live updates on the{' '}
        <Link to="/status" className="font-semibold text-primary-dark no-underline hover:underline">
          Tobu Status
        </Link>{' '}
        page.
      </p>
    </ErrorPageShell>
  )
}
