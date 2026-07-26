import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

const ROW_GRID =
  'grid grid-cols-[90px_1.6fr_1fr_1fr_140px] items-center gap-[14px] px-[20px] py-[16px]'

export function JlptLevelsSkeleton() {
  return (
    <LoadingRegion label="Loading JLPT levels">
      <PageHeaderSkeleton>
        <Skeleton className="h-[40px] w-[130px] rounded-xl" />
      </PageHeaderSkeleton>
      <Skeleton className="mb-[20px] h-[52px] w-full rounded-[14px]" />
      <div className="overflow-hidden rounded-[22px] bg-card shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
        <div className={`${ROW_GRID} bg-surface py-[12px]`}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-[10px] w-[70%]" />
          ))}
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className={`${ROW_GRID} border-t border-muted`}>
            <Skeleton className="h-[32px] w-full rounded-[10px]" />
            <div className="flex flex-col gap-[6px]">
              <Skeleton className="h-[14px] w-[120px]" />
              <Skeleton className="h-[11px] w-[160px]" />
            </div>
            <Skeleton className="h-[14px] w-[80px]" />
            <Skeleton className="h-[24px] w-[90px] rounded-full" />
            <Skeleton className="ml-auto h-[32px] w-[70px] rounded-[9px]" />
          </div>
        ))}
      </div>
    </LoadingRegion>
  )
}
