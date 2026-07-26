import { http } from '@/app/api/http-client'
import type { ApiResponse, UserAdminDto, UserListMeta } from '@/app/api/types'

export interface UserPageRequest {
  pageNumber?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
  filter?: {
    keyword?: string
  }
}

export interface UserPageResult {
  data: UserAdminDto[]
  meta: UserListMeta
}

async function unwrapPage(promise: Promise<{ data: ApiResponse<UserAdminDto[]> }>): Promise<UserPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: data.meta as UserListMeta,
  }
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

export const userService = {
  page(request: UserPageRequest) {
    return unwrapPage(
      http.post<ApiResponse<UserAdminDto[]>>('/api/users/pageable', {
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

  softDelete(id: number) {
    return unwrap(http.delete<ApiResponse<UserAdminDto>>(`/api/users/${id}`))
  },

  restore(id: number) {
    return unwrap(http.post<ApiResponse<UserAdminDto>>(`/api/users/${id}/restore`))
  },
}
