import { FieldSkeleton } from '@/components/common/field-skeleton'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

export function XpRewardSkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <Panel>
        <div className="flex flex-col gap-[16px]">
          <FieldSkeleton />
          <FieldSkeleton />
          <Skeleton className="h-[36px] w-[96px] rounded-[10px]" />
        </div>
      </Panel>
    </>
  )
}
