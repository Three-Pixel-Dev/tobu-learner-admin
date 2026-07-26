import type { ReactNode } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

interface PageHeaderSkeletonProps {
  /** Placeholder blocks for the header's action slot, mirroring PageHeader. */
  children?: ReactNode
  hasSubtitle?: boolean
}

/** Loading twin of PageHeader — same spacing, so nothing shifts on swap. */
export function PageHeaderSkeleton({ children, hasSubtitle = true }: PageHeaderSkeletonProps) {
  return (
    <div className="mb-[26px] flex flex-wrap items-center justify-between gap-[12px]">
      <div>
        <Skeleton className="h-[22px] w-[160px]" />
        {hasSubtitle ? <Skeleton className="mt-[8px] h-[12px] w-[260px]" /> : null}
      </div>
      {children ? <div className="flex items-center gap-[10px]">{children}</div> : null}
    </div>
  )
}
