import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  contentService,
  type UpdateAppContentPayload,
} from '@/shared/services/content.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const contentKeys = {
  all: ['content'] as const,
  list: () => [...contentKeys.all, 'list'] as const,
}

export function useContentListQuery() {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: contentKeys.list(),
    queryFn: () => contentService.list(),
    enabled: Boolean(accessToken),
  })
}

export function useUpdateContentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      contentKey,
      payload,
    }: {
      contentKey: string
      payload: UpdateAppContentPayload
    }) => contentService.update(contentKey, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: contentKeys.all })
    },
  })
}
