import { useEffect } from 'react'

import { cn } from '@/util/cn'

interface ToastProps {
  message: string | null
  onDismiss: () => void
  durationMs?: number
  className?: string
}

export function Toast({ message, onDismiss, durationMs = 3200, className }: ToastProps) {
  useEffect(() => {
    if (!message) return
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [message, durationMs, onDismiss])

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-[24px] left-1/2 z-60 flex items-center gap-[10px] rounded-xl bg-foreground px-[20px] py-[12px] text-[13.5px] text-primary-foreground transition duration-250',
        message
          ? 'pointer-events-auto -translate-x-1/2 translate-y-0 opacity-100'
          : 'pointer-events-none -translate-x-1/2 translate-y-[20px] opacity-0',
        className,
      )}
    >
      <span className="font-bold text-primary" aria-hidden>
        ✓
      </span>
      <span>{message ?? ''}</span>
    </div>
  )
}
