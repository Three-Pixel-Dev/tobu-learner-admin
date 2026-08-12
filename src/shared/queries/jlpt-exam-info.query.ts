import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  jlptExamInfoService,
  type JlptExamInfoPayload,
} from '@/shared/services/jlpt-exam-info.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const jlptExamInfoKeys = {
  all: ['jlpt-exam-info'] as const,
  list: () => [...jlptExamInfoKeys.all, 'list'] as const,
}

export function useJlptExamInfoListQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: jlptExamInfoKeys.list(),
    queryFn: () => jlptExamInfoService.list(),
    enabled: Boolean(accessToken),
  })
}

export function useCreateJlptExamInfoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: JlptExamInfoPayload) => jlptExamInfoService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jlptExamInfoKeys.all })
    },
  })
}

export function useUpdateJlptExamInfoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: JlptExamInfoPayload }) =>
      jlptExamInfoService.update(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jlptExamInfoKeys.all })
    },
  })
}

export function useSoftDeleteJlptExamInfoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => jlptExamInfoService.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jlptExamInfoKeys.all })
    },
  })
}

export function useRestoreJlptExamInfoMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => jlptExamInfoService.restore(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: jlptExamInfoKeys.all })
    },
  })
}
