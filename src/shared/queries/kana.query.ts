import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  kanaService,
  type CreateKanaPayload,
  type KanaType,
  type UpdateKanaPayload,
} from '@/shared/services/kana.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const kanaKeys = {
  all: ['kana'] as const,
  list: (type: KanaType) => [...kanaKeys.all, 'list', type] as const,
}

export function useKanaListQuery(type: KanaType, enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: kanaKeys.list(type),
    queryFn: () => kanaService.list(type),
    enabled: Boolean(accessToken) && enabled,
  })
}

function useInvalidateKana() {
  const queryClient = useQueryClient()
  return async () => {
    await queryClient.invalidateQueries({ queryKey: kanaKeys.all })
  }
}

export function useCreateKanaMutation() {
  const invalidate = useInvalidateKana()
  return useMutation({
    mutationFn: (payload: CreateKanaPayload) => kanaService.create(payload),
    onSuccess: invalidate,
  })
}

export function useUpdateKanaMutation() {
  const invalidate = useInvalidateKana()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateKanaPayload }) =>
      kanaService.update(id, payload),
    onSuccess: invalidate,
  })
}

export function useSoftDeleteKanaMutation() {
  const invalidate = useInvalidateKana()
  return useMutation({
    mutationFn: (id: number) => kanaService.softDelete(id),
    onSuccess: invalidate,
  })
}

export function useRestoreKanaMutation() {
  const invalidate = useInvalidateKana()
  return useMutation({
    mutationFn: (id: number) => kanaService.restore(id),
    onSuccess: invalidate,
  })
}
