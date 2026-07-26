import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  activationCodeService,
  type ActivationCodePageRequest,
  type GenerateActivationCodesPayload,
} from '@/shared/services/activation-code.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const activationCodeKeys = {
  all: ['activation-codes'] as const,
  page: (request: ActivationCodePageRequest) => [...activationCodeKeys.all, 'page', request] as const,
}

export function useActivationCodesPageQuery(request: ActivationCodePageRequest) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: activationCodeKeys.page(request),
    queryFn: () => activationCodeService.page(request),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useGenerateActivationCodesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: GenerateActivationCodesPayload) => activationCodeService.generate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: activationCodeKeys.all })
    },
  })
}
