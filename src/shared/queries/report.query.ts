import { useQuery } from '@tanstack/react-query'

import {
  reportService,
  type UserReportPageRequest,
} from '@/shared/services/report.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const reportKeys = {
  all: ['reports'] as const,
  page: (request: UserReportPageRequest) => [...reportKeys.all, 'page', request] as const,
}

export function useUserReportsPageQuery(request: UserReportPageRequest) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: reportKeys.page(request),
    queryFn: () => reportService.page(request),
    enabled: Boolean(accessToken),
    placeholderData: (prev) => prev,
  })
}
