import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { TableSkeleton } from '@/components/common/table-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

/** Matches ROW_GRID in codes-page.tsx. */
const ROW_GRID =
  'grid grid-cols-[1.2fr_0.7fr_0.9fr_1fr_0.8fr] items-center gap-[10px] px-[14px] py-[11px]'

export function CodesSkeleton() {
  return (
    <LoadingRegion label="Loading activation codes">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[120px] rounded-xl" />
      </PageHeaderSkeleton>

      <TableSkeleton rowClassName={ROW_GRID} columns={5} rows={7} />
    </LoadingRegion>
  )
}
