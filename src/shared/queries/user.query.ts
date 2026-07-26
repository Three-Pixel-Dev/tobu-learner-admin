import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { useAuthStore } from '@/shared/stores/auth.store'
import { userService, type UserPageRequest } from '@/shared/services/user.service'

export const userKeys = {
  all: ['users'] as const,
  page: (request: UserPageRequest) => [...userKeys.all, 'page', request] as const,
}

export function useUsersPageQuery(request: UserPageRequest) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: userKeys.page(request),
    queryFn: () => userService.page(request),
    enabled: Boolean(accessToken),
    placeholderData: (previous) => previous,
  })
}

export function useSoftDeleteUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.softDelete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useRestoreUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => userService.restore(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}
