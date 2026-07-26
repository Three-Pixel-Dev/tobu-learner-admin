import { PageHeaderSkeleton } from '@/components/common/page-header-skeleton'
import { Skeleton } from '@/components/ui/skeleton'

export function ProfileSkeleton() {
  return (
    <div>
      <PageHeaderSkeleton />
      <Skeleton className="mb-[20px] h-[120px] w-full rounded-[22px]" />
      <Skeleton className="mb-[20px] h-[40px] w-[280px] rounded-xl" />
      <Skeleton className="h-[280px] w-full rounded-[22px]" />
    </div>
  )
}
