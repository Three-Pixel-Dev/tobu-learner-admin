import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export type AppContentKey = 'TERMS_CONDITIONS' | 'CONTACT_US'

export interface AppContentDto {
  id: number
  contentKey: AppContentKey | string
  title: string
  body: string
  updatedAt: string
}

export interface UpdateAppContentPayload {
  title: string
  body: string
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const contentService = {
  list() {
    return unwrap(http.get<ApiResponse<AppContentDto[]>>('/api/content'))
  },

  getByKey(contentKey: string) {
    return unwrap(http.get<ApiResponse<AppContentDto>>(`/api/content/${contentKey}`))
  },

  update(contentKey: string, payload: UpdateAppContentPayload) {
    return unwrap(http.put<ApiResponse<AppContentDto>>(`/api/content/${contentKey}`, payload))
  },
}
