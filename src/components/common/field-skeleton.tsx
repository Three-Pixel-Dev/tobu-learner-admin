import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/util/cn'

interface FieldSkeletonProps {
  /** Override the control block, e.g. a taller bar for a textarea. */
  controlClassName?: string
  hasLabel?: boolean
  className?: string
}

/** Loading twin of Field + Input — a label bar above a control block. */
export function FieldSkeleton({ controlClassName, hasLabel = true, className }: FieldSkeletonProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {hasLabel ? <Skeleton className="mb-[5px] h-[10px] w-[90px] rounded-[6px]" /> : null}
      <Skeleton className={cn('h-[36px] rounded-[9px]', controlClassName)} />
    </div>
  )
}
