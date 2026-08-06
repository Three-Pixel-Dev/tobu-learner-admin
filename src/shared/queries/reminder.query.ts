import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  reminderService,
  type CreateReminderPayload,
  type ReminderStatus,
  type UpdateReminderPayload,
} from '@/shared/services/reminder.service'
import { useAuthStore } from '@/shared/stores/auth.store'

const PAGE_SIZE = 20

export const reminderKeys = {
  all: ['reminders'] as const,
  infinite: (status: string, search: string) =>
    [...reminderKeys.all, 'infinite', status, search] as const,
  detail: (id: number) => [...reminderKeys.all, 'detail', id] as const,
}

export function useRemindersInfiniteQuery(status: ReminderStatus | '', search: string) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useInfiniteQuery({
    queryKey: reminderKeys.infinite(status, search.trim()),
    queryFn: ({ pageParam }) =>
      reminderService.page({
        pageNumber: pageParam,
        pageSize: PAGE_SIZE,
        filter: { status, search },
      }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const page = last.meta.page || 1
      const totalPages = last.meta.totalPages || 0
      return page < totalPages ? page + 1 : undefined
    },
    enabled: Boolean(accessToken),
  })
}

export function useReminderDetailQuery(id: number | null) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: reminderKeys.detail(id ?? 0),
    queryFn: () => reminderService.get(id!),
    enabled: Boolean(accessToken) && id != null && id > 0,
  })
}

function useInvalidateReminders() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: reminderKeys.all })
  }
}

export function useCreateReminderMutation() {
  const invalidate = useInvalidateReminders()
  return useMutation({
    mutationFn: (payload: CreateReminderPayload) => reminderService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateReminderMutation() {
  const invalidate = useInvalidateReminders()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateReminderPayload }) =>
      reminderService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useCancelReminderMutation() {
  const invalidate = useInvalidateReminders()
  return useMutation({
    mutationFn: (id: number) => reminderService.cancel(id),
    onSuccess: invalidate,
  })
}

export function useDuplicateReminderMutation() {
  const invalidate = useInvalidateReminders()
  return useMutation({
    mutationFn: (id: number) => reminderService.duplicate(id),
    onSuccess: invalidate,
  })
}
