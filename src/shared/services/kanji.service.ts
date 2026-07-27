import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

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

export interface KanjiPageRequest {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter?: KanjiFilter
}

export interface KanjiPageResult {
  data: KanjiDto[]
  meta: PageMeta
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<KanjiDto[]> }>,
): Promise<KanjiPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 24, totalElements: 0, totalPages: 0 },
  }
}

export const kanjiService = {
  page(request: KanjiPageRequest) {
    return unwrapPage(
      http.post<ApiResponse<KanjiDto[]>>('/api/v1/admin/kanji/pageable', {
        pageNumber: request.pageNumber ?? 1,
        pageSize: request.pageSize ?? 24,
        sortBy: request.sortBy ?? 'id',
        sortOrder: request.sortOrder ?? 'ASC',
        filter: {
          jlptLevelId: request.filter?.jlptLevelId,
          levelCode: request.filter?.levelCode,
          search: request.filter?.search?.trim() || undefined,
          includeDisabled: request.filter?.includeDisabled ?? true,
        },
      }),
    )
  },

  getById(id: number) {
    return unwrap(http.get<ApiResponse<KanjiDto>>(`/api/v1/admin/kanji/${id}`))
  },

  create(payload: CreateKanjiPayload) {
    return unwrap(http.post<ApiResponse<KanjiDto>>('/api/v1/admin/kanji', payload))
  },

  createBatch(payloads: CreateKanjiPayload[]) {
    return unwrap(http.post<ApiResponse<KanjiDto[]>>('/api/v1/admin/kanji/batch', payloads))
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
