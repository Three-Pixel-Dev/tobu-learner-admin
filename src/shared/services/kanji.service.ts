import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export interface KanjiDto {
  id: number
  character: string
  jlptLevelId: number
  jlptLevelCode?: string
  meaningMm?: string
  meaningEn?: string
  onyomi?: string
  kunyomi?: string
  strokeCount?: number
  strokeOrderJson?: Record<string, any>
  audioUrl?: string
  deleted: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateKanjiPayload {
  character: string
  jlptLevelId: number
  meaningMm?: string
  meaningEn?: string
  onyomi?: string
  kunyomi?: string
  strokeCount?: number
  strokeOrderJson?: Record<string, any>
  audioUrl?: string
}

export interface UpdateKanjiPayload extends CreateKanjiPayload {}

export interface KanjiFilter {
  jlptLevelId?: number
  levelCode?: string
  search?: string
  includeDisabled?: boolean
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const kanjiService = {
  list(filter?: KanjiFilter) {
    const params = new URLSearchParams()
    if (filter?.jlptLevelId) params.append('jlptLevelId', String(filter.jlptLevelId))
    if (filter?.levelCode) params.append('levelCode', filter.levelCode)
    if (filter?.search) params.append('search', filter.search)
    if (filter?.includeDisabled !== undefined) params.append('includeDisabled', String(filter.includeDisabled))

    const query = params.toString() ? `?${params.toString()}` : ''
    return unwrap(http.get<ApiResponse<KanjiDto[]>>(`/api/v1/admin/kanji${query}`))
  },

  getById(id: number) {
    return unwrap(http.get<ApiResponse<KanjiDto>>(`/api/v1/admin/kanji/${id}`))
  },

  create(payload: CreateKanjiPayload) {
    return unwrap(http.post<ApiResponse<KanjiDto>>('/api/v1/admin/kanji', payload))
  },

  update(id: number, payload: UpdateKanjiPayload) {
    return unwrap(http.put<ApiResponse<KanjiDto>>(`/api/v1/admin/kanji/${id}`, payload))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<KanjiDto>>(`/api/v1/admin/kanji/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<KanjiDto>>(`/api/v1/admin/kanji/${id}/restore`))
  },
}
