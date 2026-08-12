import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

export function UserDetailSkeleton() {
  return (
    <LoadingRegion label="Loading learner">
      <div className="mb-[18px] flex justify-end">
        <Skeleton className="h-[38px] w-[120px] rounded-xl" />
      </div>
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[140px] rounded-xl" />
      </PageHeaderSkeleton>

      <div className="mb-[18px] grid grid-cols-4 gap-[12px] max-md:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Panel key={index} className="mb-0 p-[18px]">
            <Skeleton className="h-[10px] w-[72px] rounded-[6px]" />
            <Skeleton className="mt-[12px] h-[26px] w-[48px] rounded-[8px]" />
          </Panel>
        ))}
      </div>

      <Panel className="mb-[18px]">
        <div className="flex items-center gap-[14px]">
          <Skeleton className="h-[56px] w-[56px] shrink-0 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="mb-[8px] h-[16px] w-[40%] rounded-[6px]" />
            <Skeleton className="h-[12px] w-[60%] rounded-[6px]" />
          </div>
        </div>
      </Panel>

      <Skeleton className="mb-[12px] h-[18px] w-[140px] rounded-[6px]" />
      <Panel className="mb-[14px]">
        <Skeleton className="mb-[10px] h-[10px] w-[80px] rounded-[6px]" />
        <div className="flex flex-wrap gap-[8px]">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-[32px] w-[72px] rounded-full" />
          ))}
        </div>
      </Panel>
      {Array.from({ length: 2 }, (_, index) => (
        <Panel key={index} className="p-[18px]">
          <Skeleton className="mb-[10px] h-[14px] w-[30%] rounded-[6px]" />
          <Skeleton className="mb-[16px] h-[22px] w-[55%] rounded-[8px]" />
          <div className="grid grid-cols-4 gap-[10px] max-sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, bar) => (
              <Skeleton key={bar} className="h-[6px] w-full rounded-full" />
            ))}
          </div>
        </Panel>
      ))}
    </LoadingRegion>
  )
}
