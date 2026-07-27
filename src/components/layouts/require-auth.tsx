import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { isUnauthorizedError } from '@/app/api/http-client'
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

  // Only kick out on a true auth failure (401 after refresh) or non-admin role.
  // Do not clear the session on transient /me errors — that races with token refresh
  // and can make PUT /api/lessons/.../content fail with Unauthorized mid-save.
  const shouldClear =
    Boolean(accessToken) &&
    ((meQuery.isSuccess && meQuery.data.role !== 'ADMIN') ||
      (meQuery.isError && isUnauthorizedError(meQuery.error)))

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
