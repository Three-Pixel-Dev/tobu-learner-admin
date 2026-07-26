import { FieldSkeleton } from '@/components/common/field-skeleton'
import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const CHOICE_COUNT = 4

export function ExamsSkeleton() {
  return (
    <LoadingRegion label="Loading exams">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[120px] rounded-xl" />
        <Skeleton className="h-[38px] w-[150px] rounded-xl" />
      </PageHeaderSkeleton>

      <Panel>
        <div className="mb-[10px] flex items-center justify-between">
          <Skeleton className="h-[11px] w-[130px] rounded-[6px]" />
          <Skeleton className="h-[20px] w-[56px] rounded-full" />
        </div>

        <div className="mb-[10px] flex items-center gap-[10px]">
          <Skeleton className="h-[34px] w-[110px] rounded-xl" />
          <Skeleton className="h-[11px] w-[180px] rounded-[6px]" />
        </div>

        <FieldSkeleton className="mb-[10px]" />

        <div className="grid grid-cols-2 gap-[10px]">
          {Array.from({ length: CHOICE_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-[40px] rounded-xl" />
          ))}
        </div>
      </Panel>

      <Skeleton className="h-[44px] rounded-2xl" />

      <div className="mt-[18px] flex gap-[10px]">
        <Skeleton className="h-[74px] flex-1 rounded-[18px]" />
        <Skeleton className="h-[74px] flex-1 rounded-[18px]" />
      </div>
    </LoadingRegion>
  )
}
