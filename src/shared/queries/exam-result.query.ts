import { useQuery } from '@tanstack/react-query'

import {
  examResultService,
  type ExamResultPageRequest,
} from '@/shared/services/exam-result.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const examResultKeys = {
  all: ['exam-results'] as const,
  page: (request: ExamResultPageRequest) => [...examResultKeys.all, 'page', request] as const,
}

export function useExamResultsPageQuery(request: ExamResultPageRequest, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: examResultKeys.page(request),
    queryFn: () => examResultService.page(request),
    enabled: Boolean(accessToken) && enabled && request.filter.userId > 0,
    placeholderData: (previous) => previous,
  })
}
