import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export type ActivationCodeStatus = 'USED' | 'UNUSED' | 'EXPIRED'

export interface ActivationCodeLevelDto {
  id: number
  code: string
  name: string
}

export interface ActivationCodeDto {
  id: number
  code: string
  levels: ActivationCodeLevelDto[]
  durationDays: number
  status: ActivationCodeStatus
  usedByName: string | null
  usedAt: string | null
  expiresAt: string | null
  createdAt: string
}

export interface ActivationCodeListMeta extends PageMeta {
  redeemedThisMonth: number
}

export interface ActivationCodePageRequest {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter?: { keyword?: string }
}

export interface GenerateActivationCodesPayload {
  jlptLevelIds: number[]
  durationDays: number
  quantity: number
}

export interface ActivationCodePageResult {
  data: ActivationCodeDto[]
  meta: ActivationCodeListMeta
}

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<ActivationCodeDto[]> }>,
): Promise<ActivationCodePageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: data.meta as ActivationCodeListMeta,
  }
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const activationCodeService = {
  page(request: ActivationCodePageRequest) {
    return unwrapPage(
      http.post<ApiResponse<ActivationCodeDto[]>>('/api/activation-codes/pageable', {
        pageNumber: request.pageNumber ?? 1,
        pageSize: request.pageSize ?? 20,
        sortBy: request.sortBy ?? 'createdAt',
        sortOrder: request.sortOrder ?? 'DESC',
        filter: {
          keyword: request.filter?.keyword?.trim() || undefined,
        },
      }),
    )
  },

  generate(payload: GenerateActivationCodesPayload) {
    return unwrap(
      http.post<ApiResponse<ActivationCodeDto[]>>('/api/activation-codes/generate', payload),
    )
  },
}
