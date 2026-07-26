import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export type KanaType = 'HIRAGANA' | 'KATAKANA'

export interface KanaDto {
  id: number
  type: KanaType
  character: string
  romaji: string
  characterMm: string
  deleted: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateKanaPayload {
  type: KanaType
  character: string
  romaji: string
  characterMm: string
}

export interface UpdateKanaPayload {
  character: string
  romaji: string
  characterMm: string
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const kanaService = {
  list(type: KanaType) {
    return unwrap(http.get<ApiResponse<KanaDto[]>>('/api/kana', { params: { type } }))
  },

  create(payload: CreateKanaPayload) {
    return unwrap(http.post<ApiResponse<KanaDto>>('/api/kana', payload))
  },

  update(id: number, payload: UpdateKanaPayload) {
    return unwrap(http.put<ApiResponse<KanaDto>>(`/api/kana/${id}`, payload))
  },

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<KanaDto>>(`/api/kana/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<KanaDto>>(`/api/kana/${id}/restore`))
  },
}
