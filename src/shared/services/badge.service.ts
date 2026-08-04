import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export type BadgeCriteriaType = 'STREAK_DAYS' | 'TOTAL_XP' | 'LESSONS_COMPLETED'

export interface BadgeDto {
  id: number
  code: string
  name: string
  icon: string | null
  descriptionMm: string | null
  descriptionEn: string | null
  criteriaType: BadgeCriteriaType | null
  criteriaValue: number | null
  usersEarnedCount: number
  disabled: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateBadgePayload {
  code: string
  name: string
  icon: string
  descriptionMm: string
  descriptionEn?: string
  criteriaType?: BadgeCriteriaType | null
  criteriaValue?: number | null
}

export interface UpdateBadgePayload {
  name: string
  icon: string
  descriptionMm: string
  descriptionEn?: string
  criteriaType?: BadgeCriteriaType | null
  criteriaValue?: number | null
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const badgeService = {
  list() {
    return unwrap(http.get<ApiResponse<BadgeDto[]>>('/api/badges'))
  },

  create(payload: CreateBadgePayload) {
    return unwrap(http.post<ApiResponse<BadgeDto>>('/api/badges', payload))
  },

  update(id: number, payload: UpdateBadgePayload) {
    return unwrap(http.put<ApiResponse<BadgeDto>>(`/api/badges/${id}`, payload))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<BadgeDto>>(`/api/badges/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<BadgeDto>>(`/api/badges/${id}/restore`))
  },
}
