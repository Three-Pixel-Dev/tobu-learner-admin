import { FieldSkeleton } from '@/components/common/field-skeleton'
import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const BLOCK_COUNT = 3

export function ContentSkeleton() {
  return (
    <LoadingRegion label="Loading content pages">
      <PageHeaderSkeleton />

      {Array.from({ length: BLOCK_COUNT }, (_, index) => (
        <Panel key={index} className="last:mb-0">
          <div className="mb-4 flex items-center justify-between">
            <Skeleton className="h-[16px] w-[160px]" />
            <Skeleton className="h-[32px] w-[80px] rounded-xl" />
          </div>
          <FieldSkeleton hasLabel={false} controlClassName="h-[110px] rounded-[12px]" />
        </Panel>
      ))}
    </LoadingRegion>
  )
}
