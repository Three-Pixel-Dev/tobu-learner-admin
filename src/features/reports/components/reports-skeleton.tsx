import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

/** Matches ROW_GRID in reports-page.tsx. */
const ROW_GRID =
  'grid grid-cols-[0.5fr_1.2fr_0.9fr_0.7fr_0.7fr_2fr] items-center gap-[10px] px-[14px] py-[11px] max-lg:grid-cols-1'

export function ReportsSkeleton() {
  return (
    <LoadingRegion label="Loading reports">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[280px] rounded-xl" />
      </PageHeaderSkeleton>

      <div className="mb-[14px] flex flex-wrap gap-[10px]">
        <Skeleton className="h-[38px] w-[140px] rounded-xl" />
        <Skeleton className="h-[38px] w-[140px] rounded-xl" />
        <Skeleton className="h-[38px] w-[200px] rounded-xl" />
      </div>

      <TableSkeleton rowClassName={ROW_GRID} columns={6} rows={8} />

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
