import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { ErrorPageShell } from '@/features/errors/components/error-page-shell'
import { createErrorReference } from '@/features/errors/util/error-reference'
import { cn } from '@/util/cn'

interface ServerErrorPageProps {
  /** Optional reference from an ErrorBoundary; generated when omitted. */
  reference?: string
  onRetry?: () => void
}

export function ServerErrorPage({ reference, onRetry }: ServerErrorPageProps) {
  const errorCode = useMemo(() => reference ?? createErrorReference(), [reference])
  const [copied, setCopied] = useState(false)
  const [copyStatus, setCopyStatus] = useState('')

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(errorCode)
      setCopied(true)
      setCopyStatus('Error reference copied to clipboard.')
      window.setTimeout(() => {
        setCopied(false)
        setCopyStatus('')
      }, 2200)
    } catch {
      setCopyStatus('Could not copy the error reference.')
    }
  }

  return (
    <ErrorPageShell documentTitle="Something went wrong">
      <div
        className="mb-[18px] flex h-[88px] w-[88px] items-center justify-center rounded-[26px] border-2 border-destructive-soft bg-card text-[42px]"
        aria-hidden
      >
        😵
      </div>

      <p className="m-0 font-display text-[56px] font-bold leading-none" aria-hidden>
        500
      </p>

      <h1 className="m-0 mt-[14px] font-display text-[22px] font-bold outline-none">
        Something went wrong on our end
      </h1>
      <p className="mx-auto mt-[8px] mb-[24px] max-w-[460px] text-[14.5px] text-muted-foreground">
        This isn&apos;t something you did — our server hit an unexpected error. Your data and
        progress are safe; try again in a moment.
      </p>

      <div className="mb-[24px] flex flex-wrap justify-center gap-[10px]">
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'primary' }), 'px-[20px] py-[11px]')}
          onClick={() => {
            if (onRetry) {
              onRetry()
              return
            }
            window.location.reload()
          }}
        >
          ↻ Try again
        </button>
        <Link to="/" className={cn(buttonVariants({ variant: 'ghost' }), 'px-[20px] py-[11px]')}>
          🏠 Back to dashboard
        </Link>
      </div>

      <div className="mb-[20px] flex w-full max-w-[420px] items-center justify-between gap-[12px] rounded-[14px] border-[1.5px] border-border bg-card px-[18px] py-[14px] text-left">
        <div>
          <div className="text-[11px] tracking-[0.04em] text-subtle uppercase">Error reference</div>
          <div className="font-mono text-[13.5px] font-semibold">{errorCode}</div>
        </div>
        <button
          type="button"
          className={cn(
            'rounded-[8px] px-[10px] py-[6px] text-[11.5px] font-semibold',
            copied
              ? 'bg-primary-soft text-primary-dark'
              : 'bg-muted text-muted-foreground hover:bg-surface',
          )}
          onClick={() => {
            void copyRef()
          }}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {copyStatus}
      </p>

      <p className="max-w-[420px] text-[12.5px] text-muted-foreground">
        If this keeps happening, contact{' '}
        <a href="mailto:support@tobu.app" className="font-semibold text-primary-dark">
          support@tobu.app
        </a>{' '}
        and include the reference code above — it helps us find exactly what happened without you
        needing to explain the technical details.
      </p>
    </ErrorPageShell>
  )
}
