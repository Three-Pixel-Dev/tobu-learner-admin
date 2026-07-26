import { LoadingRegion } from '@/components/common/loading-region'
import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Panel } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const TILE_COUNT = 18

export function KanaSkeleton() {
  return (
    <LoadingRegion label="Loading kana and kanji">
      <PageHeaderSkeleton />

      <Panel className="mb-0">
        {/* Tab track */}
        <Skeleton className="mb-[16px] h-[38px] w-[240px] rounded-xl" />

        <Skeleton className="mb-[8px] h-[11px] w-[120px] rounded-[6px]" />
        <div className="grid grid-cols-6 gap-[8px]">
          {Array.from({ length: TILE_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-[70px] rounded-xl" />
          ))}
        </div>
      </Panel>
    </LoadingRegion>
  )
}
