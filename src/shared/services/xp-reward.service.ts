import { http } from '@/app/api/http-client'
import type { ApiResponse } from '@/app/api/types'

export interface XpRewardSettingsDto {
  id: number
  xpPerCorrect: number
  xpPerLesson: number
  updatedAt: string
}

export interface UpdateXpRewardSettingsPayload {
  xpPerCorrect: number
  xpPerLesson: number
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const xpRewardService = {
  get() {
    return unwrap(http.get<ApiResponse<XpRewardSettingsDto>>('/api/xp-rewards'))
  },

  update(payload: UpdateXpRewardSettingsPayload) {
    return unwrap(http.put<ApiResponse<XpRewardSettingsDto>>('/api/xp-rewards', payload))
  },
}
