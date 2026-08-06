import { useQuery } from '@tanstack/react-query'

import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'
import type { DashboardDto } from '@/features/dashboard/dashboard.types'

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await http.get<ApiResponse<DashboardDto>>('/api/v1/admin/dashboard')
      return response.data.data
    },
  })
}
