import { useEffect, useState } from 'react'

import { cn } from '@/util/cn'

const MESSAGES = ['Loading your lessons and stats…', 'Fetching streaks and XP…', 'Almost there…']

const MESSAGE_INTERVAL = 2200
const SLOW_AFTER = 6000

interface LoadingScreenProps {
  /** Shown under the brand name while the app boots. */
  tagline?: string
  className?: string
}

/**
 * Full-screen boot state — the React twin of the pre-hydration splash in
 * index.html. Use it for in-app boots (auth check, workspace switch) where
 * the whole shell is unavailable; use PageSkeleton when only content is.
 */
export function LoadingScreen({ tagline = 'Preparing your dashboard…', className }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0)
  const [isSlow, setIsSlow] = useState(false)

  useEffect(() => {
    const rotate = setInterval(
      () => setMessageIndex((index) => (index + 1) % MESSAGES.length),
      MESSAGE_INTERVAL,
    )
    // Past ~6s, tell the user it's slow rather than leaving them guessing.
    const slowTimer = setTimeout(() => setIsSlow(true), SLOW_AFTER)

    return () => {
      clearInterval(rotate)
      clearTimeout(slowTimer)
    }
  }, [])

  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center gap-[22px] p-[24px] text-center',
        className,
      )}
    >
      <div className="relative h-[88px] w-[88px]" aria-hidden>
        {/* Second, independent motion cue alongside the bob. */}
        <div className="absolute -inset-[8px] rounded-[34px] border-[3px] border-primary-soft border-t-primary motion-safe:animate-spin-ring" />
        <div className="flex h-[88px] w-[88px] items-center justify-center rounded-[26px] bg-primary text-[44px] shadow-[0_10px_26px_rgba(34,197,94,0.30)] motion-safe:animate-bob">
          🦉
        </div>
      </div>

      <div>
        <div className="font-display text-[24px] font-bold">
          Tobu <span className="text-warning-foreground">Admin</span>
        </div>
        <p className="mt-[2px] text-[13.5px] text-muted-foreground">{tagline}</p>
      </div>

      {/* role="progressbar" without aria-valuenow = indeterminate, per WAI-ARIA. */}
      <div
        role="progressbar"
        aria-label="Loading Tobu Admin"
        aria-busy="true"
        className="relative h-[8px] w-[220px] overflow-hidden rounded-[20px] bg-muted"
      >
        <div className="absolute inset-y-0 w-[40%] rounded-[20px] bg-primary motion-safe:animate-indeterminate motion-reduce:static motion-reduce:w-[60%] motion-reduce:animate-soft-pulse" />
      </div>

      {/* Polite live region: progress is announced without stealing focus. */}
      <p role="status" aria-live="polite" className="min-h-[16px] text-[12.5px] text-muted-foreground">
        {MESSAGES[messageIndex]}
      </p>

      {isSlow ? (
        <p
          role="status"
          aria-live="polite"
          className="max-w-[280px] rounded-[10px] border border-warning bg-warning-soft px-[14px] py-[8px] text-[12px] text-warning-foreground"
        >
          This is taking longer than usual. Hang tight — or{' '}
          <a href="/" className="font-semibold underline">
            refresh the page
          </a>
          .
        </p>
      ) : null}
    </div>
  )
}
