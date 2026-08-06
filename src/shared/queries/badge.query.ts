import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  badgeService,
  type CreateBadgePayload,
  type UpdateBadgePayload,
} from '@/shared/services/badge.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const badgeKeys = {
  all: ['badges'] as const,
  list: () => [...badgeKeys.all, 'list'] as const,
}

export function useBadgesQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: badgeKeys.list(),
    queryFn: () => badgeService.list(),
    enabled: Boolean(accessToken),
  })
}

function useInvalidateBadges() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: badgeKeys.all })
  }
}

export function useCreateBadgeMutation() {
  const invalidate = useInvalidateBadges()
  return useMutation({
    mutationFn: (payload: CreateBadgePayload) => badgeService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateBadgeMutation() {
  const invalidate = useInvalidateBadges()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateBadgePayload }) =>
      badgeService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useSoftDeleteBadgeMutation() {
  const invalidate = useInvalidateBadges()
  return useMutation({
    mutationFn: (id: number) => badgeService.softDelete(id),
    onSuccess: invalidate,
  })
}

export function useRestoreBadgeMutation() {
  const invalidate = useInvalidateBadges()
  return useMutation({
    mutationFn: (id: number) => badgeService.restore(id),
    onSuccess: invalidate,
  })
}
