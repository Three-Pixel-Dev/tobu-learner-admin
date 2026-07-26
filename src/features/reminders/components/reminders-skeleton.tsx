import { FieldSkeleton } from '@/components/common/field-skeleton'
import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const HISTORY_ROWS = 4

export function RemindersSkeleton() {
  return (
    <LoadingRegion label="Loading reminders">
      <PageHeaderSkeleton />

      <Panel>
        <Skeleton className="mb-4 h-[16px] w-[140px]" />
        <FieldSkeleton className="mb-[10px]" />
        <FieldSkeleton className="mb-[12px]" />
        <div className="mb-[10px] grid grid-cols-2 gap-[10px]">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>
        <Skeleton className="h-[38px] w-[170px] rounded-xl" />
      </Panel>

      <Panel className="mb-0">
        <Skeleton className="mb-4 h-[16px] w-[130px]" />
        {Array.from({ length: HISTORY_ROWS }, (_, index) => (
          <div key={index} className="py-[9px]">
            <Skeleton className="mb-[5px] h-[11px] w-[70%] rounded-[6px]" />
            <Skeleton className="h-[9px] w-[35%] rounded-[6px]" />
          </div>
        ))}
      </Panel>
    </LoadingRegion>
  )
}
