import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import {
  authService,
  type ChangePasswordPayload,
  type LoginPayload,
  type UpdateProfilePayload,
} from '@/shared/services/auth.service'
import { useAuthStore } from '@/shared/stores/auth.store'

export const authKeys = {
  me: ['auth', 'me'] as const,
  sessions: ['auth', 'sessions'] as const,
}

export function useMeQuery(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: authKeys.me,
    queryFn: () => authService.me(),
    enabled: enabled && Boolean(accessToken),
    staleTime: 60_000,
  })
}

export function useSessionsQuery(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken)
  return useQuery({
    queryKey: authKeys.sessions,
    queryFn: () => authService.listSessions(),
    enabled: enabled && Boolean(accessToken),
  })
}

export function useLoginMutation() {
  const setSession = useAuthStore((s) => s.setSession)
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const data = await authService.login(payload)
      if (data.role !== 'ADMIN') {
        clearSession()
        throw new Error('This portal is for admin accounts only.')
      }
      return data
    },
    onSuccess: (data) => {
      setSession(data.accessToken, data.refreshToken, {
        userId: data.userId,
        email: data.email,
        name: data.name,
        role: data.role,
      })
      void queryClient.invalidateQueries({ queryKey: authKeys.me })
      void navigate('/', { replace: true })
    },
  })
}

export function useUpdateProfileMutation() {
  const setUser = useAuthStore((s) => s.setUser)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => authService.updateProfile(payload),
    onSuccess: (me) => {
      setUser({
        userId: me.userId,
        email: me.email,
        name: me.name,
        role: me.role,
      })
      queryClient.setQueryData(authKeys.me, me)
    },
  })
}

export function useChangePasswordMutation() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ChangePasswordPayload) => authService.changePassword(payload),
    onSuccess: () => {
      queryClient.clear()
      clearSession()
      void navigate('/login', { replace: true })
    },
  })
}

export function useRevokeSessionMutation() {
  const queryClient = useQueryClient()
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (sessionId: number) => authService.revokeSession(sessionId),
    onSuccess: async (_data, sessionId) => {
      const me = queryClient.getQueryData<Awaited<ReturnType<typeof authService.me>>>(authKeys.me)
      if (me?.currentSessionId === sessionId) {
        queryClient.clear()
        clearSession()
        void navigate('/login', { replace: true })
        return
      }
      await queryClient.invalidateQueries({ queryKey: authKeys.sessions })
    },
  })
}

export function useLogoutMutation() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      queryClient.clear()
      clearSession()
      void navigate('/login', { replace: true })
    },
  })
}

export function useLogoutAllMutation() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authService.logoutAll(),
    onSettled: () => {
      queryClient.clear()
      clearSession()
      void navigate('/login', { replace: true })
    },
  })
}
