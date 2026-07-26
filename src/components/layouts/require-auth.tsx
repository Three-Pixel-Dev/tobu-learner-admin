import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { LoadingScreen } from '@/components/common/loading-screen'
import { useMeQuery } from '@/shared/queries/auth.query'
import { useAuthHydrated, useAuthStore } from '@/shared/stores/auth.store'

export function RequireAuth() {
  const hydrated = useAuthHydrated()
  const accessToken = useAuthStore((s) => s.accessToken)
  const clearSession = useAuthStore((s) => s.clearSession)
  const setUser = useAuthStore((s) => s.setUser)
  const location = useLocation()
  const meQuery = useMeQuery(hydrated && Boolean(accessToken))

  const shouldClear =
    Boolean(accessToken) &&
    (meQuery.isError || (meQuery.isSuccess && meQuery.data.role !== 'ADMIN'))

  useEffect(() => {
    if (shouldClear) {
      clearSession()
    }
  }, [shouldClear, clearSession])

  useEffect(() => {
    if (!meQuery.data || meQuery.data.role !== 'ADMIN') return
    setUser({
      userId: meQuery.data.userId,
      email: meQuery.data.email,
      name: meQuery.data.name,
      role: meQuery.data.role,
    })
  }, [meQuery.data, setUser])

  if (!hydrated) {
    return <LoadingScreen tagline="Checking your session…" />
  }

  if (!accessToken || shouldClear) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (meQuery.isLoading && !meQuery.data) {
    return <LoadingScreen tagline="Loading your account…" />
  }

  return <Outlet />
}

export function GuestOnly() {
  const hydrated = useAuthHydrated()
  const accessToken = useAuthStore((s) => s.accessToken)

  if (!hydrated) {
    return <LoadingScreen tagline="Checking your session…" />
  }

  if (accessToken) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
