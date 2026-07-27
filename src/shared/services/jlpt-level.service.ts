import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export interface JlptLevelDto {
  id: number
  code: string
  name: string
  nameMm: string | null
  unlocked: boolean
  hot: boolean
  deleted: boolean
  lessonCount: number
  examCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateJlptLevelPayload {
  code: string
  name: string
  nameMm: string
}

export interface UpdateJlptLevelPayload {
  code: string
  name: string
  nameMm: string
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const jlptLevelService = {
  list() {
    return unwrap(http.get<ApiResponse<JlptLevelDto[]>>('/api/jlpt-levels'))
  },

  create(payload: CreateJlptLevelPayload) {
    return unwrap(http.post<ApiResponse<JlptLevelDto>>('/api/jlpt-levels', payload))
  },

  update(id: number, payload: UpdateJlptLevelPayload) {
    return unwrap(http.put<ApiResponse<JlptLevelDto>>(`/api/jlpt-levels/${id}`, payload))
  },

  setUnlocked(id: number, unlocked: boolean) {
    return unwrap(
      http.put<ApiResponse<JlptLevelDto>>(`/api/jlpt-levels/${id}/unlocked`, { unlocked }),
    )
  },

  setHot(id: number, hot: boolean) {
    return unwrap(http.put<ApiResponse<JlptLevelDto>>(`/api/jlpt-levels/${id}/hot`, { hot }))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<JlptLevelDto>>(`/api/jlpt-levels/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<JlptLevelDto>>(`/api/jlpt-levels/${id}/restore`))
  },
}
