import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'
import { env } from '@/app/config/env'

export interface MediaUploadDto {
  url: string
  originalFilename: string
  contentType: string
}

export async function uploadAudio(file: File): Promise<MediaUploadDto> {
  const form = new FormData()
  form.append('file', file)
  const { data } = await http.post<ApiResponse<MediaUploadDto>>('/api/media/audio', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    transformRequest: [
      (body, headers) => {
        if (body instanceof FormData) {
          delete headers['Content-Type']
        }
        return body
      },
    ],
  })
  return data.data
}

/**
 * Resolve a stored media URL for playback.
 * New uploads are absolute GCS URLs; legacy relative paths (if any) fall back to the API host.
 */
export function resolveMediaUrl(path: string | null | undefined): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${env.apiBaseUrl}${path.startsWith('/') ? '' : '/'}${path}`
}
