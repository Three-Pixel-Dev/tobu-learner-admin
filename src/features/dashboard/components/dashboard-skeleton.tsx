import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const STAT_COUNT = 4
const LESSON_ROWS = 5
const ACTIVITY_ROWS = 4

export function DashboardSkeleton() {
  return (
    <LoadingRegion label="Loading dashboard">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[220px] rounded-xl" />
        <Skeleton className="h-[38px] w-[110px] rounded-xl" />
        <Skeleton className="h-[38px] w-[130px] rounded-xl" />
      </PageHeaderSkeleton>

      <div className="mb-[26px] grid grid-cols-4 gap-[16px]">
        {Array.from({ length: STAT_COUNT }, (_, index) => (
          <Panel key={index} className="mb-0 rounded-[20px] p-[18px_20px]">
            <div className="flex items-start justify-between">
              <Skeleton className="h-[38px] w-[38px] rounded-xl" />
              <Skeleton className="h-[18px] w-[46px] rounded-full" />
            </div>
            <Skeleton className="mt-[14px] mb-[8px] h-[26px] w-[70px]" />
            <Skeleton className="h-[11px] w-[110px] rounded-[6px]" />
          </Panel>
        ))}
      </div>

      <div className="grid grid-cols-[1.65fr_1fr] items-start gap-[18px]">
        <Panel>
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-[16px] w-[150px]" />
            <Skeleton className="h-[30px] w-[160px] rounded-full" />
          </div>

          {Array.from({ length: LESSON_ROWS }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.4fr_1.3fr_0.8fr_0.5fr] items-center gap-[10px] border-b border-muted px-[10px] py-[12px] last:border-b-0"
            >
              <div>
                <Skeleton className="mb-[5px] h-[12px] w-[80%] rounded-[6px]" />
                <Skeleton className="h-[10px] w-[50%] rounded-[6px]" />
              </div>
              <div className="flex gap-[6px]">
                <Skeleton className="h-[20px] w-[62px] rounded-full" />
                <Skeleton className="h-[20px] w-[72px] rounded-full" />
              </div>
              <Skeleton className="h-[12px] w-[70px] rounded-[6px]" />
              <div className="flex gap-[6px]">
                <Skeleton className="h-[28px] w-[28px] rounded-lg" />
                <Skeleton className="h-[28px] w-[28px] rounded-lg" />
              </div>
            </div>
          ))}

          <div className="mt-[14px] flex gap-[8px]">
            <Skeleton className="h-[30px] w-[90px] rounded-xl" />
            <Skeleton className="h-[30px] w-[90px] rounded-xl" />
            <Skeleton className="h-[30px] w-[90px] rounded-xl" />
          </div>
        </Panel>

        <div>
          <Panel>
            <Skeleton className="mb-4 h-[16px] w-[150px]" />
            {Array.from({ length: ACTIVITY_ROWS }, (_, index) => (
              <div key={index} className="flex items-center gap-[10px] py-[9px]">
                <Skeleton className="h-[28px] w-[28px] shrink-0 rounded-[10px]" />
                <div className="flex-1">
                  <Skeleton className="mb-[5px] h-[11px] w-[85%] rounded-[6px]" />
                  <Skeleton className="h-[9px] w-[40%] rounded-[6px]" />
                </div>
              </div>
            ))}
          </Panel>

          <Skeleton className="mb-[18px] h-[86px] rounded-[18px]" />
          <Skeleton className="h-[86px] rounded-[18px]" />
        </div>
      </div>
    </LoadingRegion>
  )
}
