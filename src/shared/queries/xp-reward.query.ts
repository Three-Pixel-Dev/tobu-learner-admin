import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  xpRewardService,
  type UpdateXpRewardSettingsPayload,
} from '@/shared/services/xp-reward.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const xpRewardKeys = {
  all: ['xp-rewards'] as const,
  settings: () => [...xpRewardKeys.all, 'settings'] as const,
}

export function useXpRewardSettingsQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: xpRewardKeys.settings(),
    queryFn: () => xpRewardService.get(),
    enabled: Boolean(accessToken),
  })
}

export function useUpdateXpRewardSettingsMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateXpRewardSettingsPayload) => xpRewardService.update(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: xpRewardKeys.all })
    },
  })
}
