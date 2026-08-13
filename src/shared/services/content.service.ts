import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export type AppContentKey = 'TERMS_CONDITIONS' | 'PRIVACY_POLICY' | 'CONTACT_US'

export const APP_CONTENT_KEY_META: Record<
  AppContentKey,
  { label: string; description: string }
> = {
  TERMS_CONDITIONS: {
    label: 'Terms',
    description: 'Shown when learners open Terms & conditions.',
  },
  PRIVACY_POLICY: {
    label: 'Privacy',
    description: 'Shown when learners open Privacy policy.',
  },
  CONTACT_US: {
    label: 'Contact',
    description: 'Shown on Contact us in the app.',
  },
}

export function contentKeyMeta(contentKey: string) {
  if (contentKey in APP_CONTENT_KEY_META) {
    return APP_CONTENT_KEY_META[contentKey as AppContentKey]
  }
  return { label: contentKey, description: 'Custom app content page.' }
}

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
