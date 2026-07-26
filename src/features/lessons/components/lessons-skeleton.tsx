import { FieldSkeleton } from '@/components/common/field-skeleton'
import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const ITEM_CARDS = 3

export function LessonsSkeleton() {
  return (
    <LoadingRegion label="Loading lesson editor">
      <PageHeaderSkeleton>
        <Skeleton className="h-[38px] w-[110px] rounded-xl" />
        <Skeleton className="h-[38px] w-[110px] rounded-xl" />
      </PageHeaderSkeleton>

      <Panel className="mb-0">
        {/* Tab track */}
        <Skeleton className="mb-[16px] h-[38px] w-[280px] rounded-xl" />

        {Array.from({ length: ITEM_CARDS }, (_, index) => (
          <div key={index} className="mb-[12px] rounded-2xl border-[1.5px] border-border p-[16px]">
            <div className="mb-[10px] flex items-center justify-between">
              <Skeleton className="h-[11px] w-[100px] rounded-[6px]" />
              <Skeleton className="h-[14px] w-[14px] rounded-[4px]" />
            </div>
            <div className="mb-[10px] grid grid-cols-2 gap-[10px]">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
            <div className="grid grid-cols-2 gap-[10px]">
              <FieldSkeleton />
              <FieldSkeleton />
            </div>
          </div>
        ))}

        <Skeleton className="h-[44px] rounded-2xl" />
      </Panel>
    </LoadingRegion>
  )
}
