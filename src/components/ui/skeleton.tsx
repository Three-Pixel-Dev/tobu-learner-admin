import type { HTMLAttributes } from 'react'

import { cn } from '@/util/cn'

type SkeletonProps = HTMLAttributes<HTMLDivElement>

/**
 * Placeholder block for loading content. Always decorative — the wrapping
 * region owns the aria-busy / status announcement, so these are hidden
 * from assistive tech to avoid announcing empty boxes.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return <div aria-hidden className={cn('skeleton', className)} {...props} />
}
