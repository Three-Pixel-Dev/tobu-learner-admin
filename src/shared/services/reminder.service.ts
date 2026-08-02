import { http } from '@/app/api/http-client'
import type { ApiResponse, PageMeta } from '@/app/api/types'

export type ReminderStatus = 'scheduled' | 'sent' | 'cancelled'
export type ReminderAudience = 'ALL' | 'INACTIVE' | 'LEVEL'
export type ReminderScheduleMode = 'NOW' | 'LATER' | 'REPEAT'
export type ReminderRepeatFreq = 'DAILY' | 'WEEKLY'

export interface ReminderDto {
  id: number
  title: string
  body: string
  audienceType: ReminderAudience
  jlptLevelCodes: string[]
  scheduleMode: ReminderScheduleMode
  scheduledAt: string | null
  repeatFreq: ReminderRepeatFreq | null
  repeatTime: string | null
  nextRunAt: string | null
  status: ReminderStatus
  scheduleLabel: string
  sentCount: number
  deliveredCount: number
  openedCount: number
  tappedCount: number
  createdAt: string
  updatedAt: string
}

export interface ReminderPageResult {
  data: ReminderDto[]
  meta: PageMeta
}

export interface CreateReminderPayload {
  title: string
  body: string
  audienceType: ReminderAudience
  jlptLevelCodes?: string[]
  scheduleMode: ReminderScheduleMode
  scheduledAt?: string | null
  repeatFreq?: ReminderRepeatFreq | null
  repeatTime?: string | null
}

export type UpdateReminderPayload = Partial<CreateReminderPayload>

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const { data } = await promise
  return data.data
}

async function unwrapPage(
  promise: Promise<{ data: ApiResponse<ReminderDto[]> }>,
): Promise<ReminderPageResult> {
  const { data } = await promise
  return {
    data: data.data ?? [],
    meta: (data.meta as PageMeta) ?? { page: 1, size: 10, totalElements: 0, totalPages: 0 },
  }
}

export const reminderService = {
  page(request: {
    pageNumber?: number
    pageSize?: number
    filter?: { status?: ReminderStatus | ''; search?: string }
  }) {
    const status = request.filter?.status?.trim()
    return unwrapPage(
      http.post<ApiResponse<ReminderDto[]>>('/api/admin/reminders/pageable', {
        pageNumber: request.pageNumber ?? 1,
        pageSize: request.pageSize ?? 20,
        sortBy: 'id',
        sortOrder: 'DESC',
        filter: {
          status: status || undefined,
          search: request.filter?.search?.trim() || undefined,
        },
      }),
    )
  },

  get(id: number) {
    return unwrap(http.get<ApiResponse<ReminderDto>>(`/api/admin/reminders/${id}`))
  },

  create(payload: CreateReminderPayload) {
    return unwrap(http.post<ApiResponse<ReminderDto>>('/api/admin/reminders', payload))
  },

  update(id: number, payload: UpdateReminderPayload) {
    return unwrap(http.put<ApiResponse<ReminderDto>>(`/api/admin/reminders/${id}`, payload))
  },

  cancel(id: number) {
    return unwrap(http.post<ApiResponse<ReminderDto>>(`/api/admin/reminders/${id}/cancel`))
  },

  duplicate(id: number) {
    return unwrap(http.post<ApiResponse<ReminderDto>>(`/api/admin/reminders/${id}/duplicate`))
  },
}
