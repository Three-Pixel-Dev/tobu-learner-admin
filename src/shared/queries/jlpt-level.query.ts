import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  jlptLevelService,
  type CreateJlptLevelPayload,
  type UpdateJlptLevelPayload,
} from '@/shared/services/jlpt-level.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const jlptLevelKeys = {
  all: ['jlpt-levels'] as const,
  list: () => [...jlptLevelKeys.all, 'list'] as const,
}

export function useJlptLevelsQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: jlptLevelKeys.list(),
    queryFn: () => jlptLevelService.list(),
    enabled: Boolean(accessToken),
  })
}

function useInvalidateJlptLevels() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: jlptLevelKeys.all })
  }
}

export function useCreateJlptLevelMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: (payload: CreateJlptLevelPayload) => jlptLevelService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateJlptLevelMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateJlptLevelPayload }) =>
      jlptLevelService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useSetJlptLevelUnlockedMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: ({ id, unlocked }: { id: number; unlocked: boolean }) =>
      jlptLevelService.setUnlocked(id, unlocked),
    onSuccess: invalidate,
  })
}

export function useSetJlptLevelHotMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: ({ id, hot }: { id: number; hot: boolean }) => jlptLevelService.setHot(id, hot),
    onSuccess: invalidate,
  })
}

export function useSoftDeleteJlptLevelMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: (id: number) => jlptLevelService.softDelete(id),
    onSuccess: invalidate,
  })
}

export function useRestoreJlptLevelMutation() {
  const invalidate = useInvalidateJlptLevels()
  return useMutation({
    mutationFn: (id: number) => jlptLevelService.restore(id),
    onSuccess: invalidate,
  })
}
