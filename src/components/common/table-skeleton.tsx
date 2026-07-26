import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/util/cn'

interface TableSkeletonProps {
  /** The real table's row grid class, so columns line up exactly. */
  rowClassName: string
  columns: number
  rows?: number
  /** First cell renders as avatar + two lines instead of a single bar. */
  hasAvatar?: boolean
}

export function TableSkeleton({ rowClassName, columns, rows = 6, hasAvatar = false }: TableSkeletonProps) {
  return (
    <Panel className="mb-0 p-0">
      <div className={cn(rowClassName, 'rounded-t-[22px] bg-surface')}>
        {Array.from({ length: columns }, (_, index) => (
          <Skeleton key={index} className="h-[10px] w-[60%] max-w-[80px] rounded-[6px]" />
        ))}
      </div>

      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className={cn(rowClassName, 'border-t border-muted')}>
          {hasAvatar ? (
            <div className="flex items-center gap-[8px]">
              <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-full" />
              <div className="min-w-0 flex-1">
                <Skeleton className="mb-[5px] h-[11px] w-[70%] rounded-[6px]" />
                <Skeleton className="h-[9px] w-[45%] rounded-[6px]" />
              </div>
            </div>
          ) : (
            <Skeleton className="h-[12px] w-[75%] rounded-[6px]" />
          )}

          {Array.from({ length: columns - 1 }, (_, cellIndex) => (
            <Skeleton key={cellIndex} className="h-[12px] w-[55%] max-w-[70px] rounded-[6px]" />
          ))}
        </div>
      ))}
    </Panel>
  )
}
