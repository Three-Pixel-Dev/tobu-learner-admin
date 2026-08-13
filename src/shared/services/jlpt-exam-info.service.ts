import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export interface JlptExamInfoDto {
  id: number
  icon: string | null
  titleMm: string
  titleEn: string
  bodyMm: string
  bodyEn: string
  imageUrl: string | null
  sortOrder: number
  deleted: boolean
}

export interface JlptExamInfoPayload {
  icon?: string | null
  titleMm: string
  titleEn: string
  bodyMm: string
  bodyEn: string
  imageUrl?: string | null
  sortOrder?: number
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const jlptExamInfoService = {
  list() {
    return unwrap(http.get<ApiResponse<JlptExamInfoDto[]>>('/api/v1/admin/jlpt-exam-info'))
  },

  create(payload: JlptExamInfoPayload) {
    return unwrap(http.post<ApiResponse<JlptExamInfoDto>>('/api/v1/admin/jlpt-exam-info', payload))
  },

  update(id: number, payload: JlptExamInfoPayload) {
    return unwrap(http.put<ApiResponse<JlptExamInfoDto>>(`/api/v1/admin/jlpt-exam-info/${id}`, payload))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<JlptExamInfoDto>>(`/api/v1/admin/jlpt-exam-info/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<JlptExamInfoDto>>(`/api/v1/admin/jlpt-exam-info/${id}/restore`))
  },
}
