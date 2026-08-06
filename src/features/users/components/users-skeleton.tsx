import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

/** Matches ROW_GRID in users-page.tsx. */
const ROW_GRID =
  'grid grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.6fr] items-center gap-[10px] px-[14px] py-[11px]'

export function UsersSkeleton() {
  return (
    <LoadingRegion label="Loading users">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[220px] rounded-xl" />
      </PageHeaderSkeleton>

      <TableSkeleton rowClassName={ROW_GRID} columns={5} rows={7} hasAvatar />

      <div className="mt-[14px] flex flex-wrap items-center justify-between gap-[12px] rounded-[16px] border-[1.5px] border-border bg-card px-[14px] py-[10px]">
        <Skeleton className="h-[14px] w-[160px]" />
        <div className="flex gap-[6px]">
          <Skeleton className="h-[32px] w-[32px] rounded-[10px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[10px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[10px]" />
        </div>
      </div>
    </LoadingRegion>
  )
}
