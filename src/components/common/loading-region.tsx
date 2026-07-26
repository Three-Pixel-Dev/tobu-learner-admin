import type { ReactNode } from 'react'

interface LoadingRegionProps {
  /** Announced to screen readers, e.g. "Loading users". */
  label: string
  children: ReactNode
  className?: string
}

/**
 * Wrapper every page skeleton uses. The skeleton blocks themselves are
 * aria-hidden, so this region owns the single spoken announcement — without
 * it, assistive tech would read out nothing while the page loads.
 */
export function LoadingRegion({ label, children, className }: LoadingRegionProps) {
  return (
    <div role="status" aria-busy="true" className={className}>
      <span className="sr-only">{label}, please wait.</span>
      {children}
    </div>
  )
}
