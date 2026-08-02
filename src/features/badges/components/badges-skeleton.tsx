import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

const ROW_GRID =
  'grid grid-cols-[56px_1.2fr_1.1fr_0.9fr_0.8fr_0.7fr_120px] items-center gap-[14px] px-[20px] py-[16px]'

export function BadgesSkeleton() {
  return (
    <LoadingRegion label="Loading badges">
      <PageHeaderSkeleton>
        <Skeleton className="h-[40px] w-[130px] rounded-xl" />
      </PageHeaderSkeleton>
      <Skeleton className="mb-[20px] h-[52px] w-full rounded-[14px]" />
      <div className="overflow-hidden rounded-[22px] bg-card shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
        <div className={`${ROW_GRID} bg-surface py-[12px]`}>
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-[10px] w-[70%]" />
          ))}
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className={`${ROW_GRID} border-t border-muted`}>
            <Skeleton className="h-[40px] w-[40px] rounded-[12px]" />
            <div className="flex flex-col gap-[6px]">
              <Skeleton className="h-[14px] w-[120px]" />
              <Skeleton className="h-[11px] w-[90px]" />
            </div>
            <Skeleton className="h-[14px] w-[140px]" />
            <Skeleton className="h-[14px] w-[100px]" />
            <Skeleton className="h-[14px] w-[40px]" />
            <Skeleton className="h-[24px] w-[70px] rounded-full" />
            <Skeleton className="ml-auto h-[32px] w-[70px] rounded-[9px]" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  )
}
