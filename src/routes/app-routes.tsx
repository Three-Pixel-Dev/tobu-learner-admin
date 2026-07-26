import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { GuestOnly, RequireAuth } from '@/components/layouts/require-auth'
import { CodesSkeleton } from '@/features/codes/components/codes-skeleton'
import { ContentSkeleton } from '@/features/content/components/content-skeleton'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { ExamsSkeleton } from '@/features/exams/components/exams-skeleton'
import { JlptLevelsSkeleton } from '@/features/jlpt-levels/components/jlpt-levels-skeleton'
import { KanaSkeleton } from '@/features/kana/components/kana-skeleton'
import { LessonsSkeleton } from '@/features/lessons/components/lessons-skeleton'
import { ProfileSkeleton } from '@/features/profile/components/profile-skeleton'
import { RemindersSkeleton } from '@/features/reminders/components/reminders-skeleton'
import { UsersSkeleton } from '@/features/users/components/users-skeleton'

const LoginPage = lazy(() =>
  import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage })),
)
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/profile-page').then((m) => ({ default: m.ProfilePage })),
)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
)
const JlptLevelsPage = lazy(() =>
  import('@/features/jlpt-levels/pages/jlpt-levels-page').then((m) => ({ default: m.JlptLevelsPage })),
)
const LessonsPage = lazy(() =>
  import('@/features/lessons/pages/lessons-page').then((m) => ({ default: m.LessonsPage })),
)
const KanaPage = lazy(() =>
  import('@/features/kana/pages/kana-page').then((m) => ({ default: m.KanaPage })),
)
const ExamsPage = lazy(() =>
  import('@/features/exams/pages/exams-page').then((m) => ({ default: m.ExamsPage })),
)
const UsersPage = lazy(() =>
  import('@/features/users/pages/users-page').then((m) => ({ default: m.UsersPage })),
)
const CodesPage = lazy(() =>
  import('@/features/codes/pages/codes-page').then((m) => ({ default: m.CodesPage })),
)
const RemindersPage = lazy(() =>
  import('@/features/reminders/pages/reminders-page').then((m) => ({ default: m.RemindersPage })),
)
const ContentPage = lazy(() =>
  import('@/features/content/pages/content-page').then((m) => ({ default: m.ContentPage })),
)
const NotFoundPage = lazy(() =>
  import('@/features/errors/pages/not-found-page').then((m) => ({ default: m.NotFoundPage })),
)
const ServerErrorPage = lazy(() =>
  import('@/features/errors/pages/server-error-page').then((m) => ({ default: m.ServerErrorPage })),
)
const ServiceUnavailablePage = lazy(() =>
  import('@/features/errors/pages/service-unavailable-page').then((m) => ({
    default: m.ServiceUnavailablePage,
  })),
)
const StatusPage = lazy(() =>
  import('@/features/errors/pages/status-page').then((m) => ({ default: m.StatusPage })),
)

interface PageBoundaryProps {
  /** The feature's own skeleton — never a generic one. */
  fallback: ReactNode
  children: ReactNode
}

/**
 * Per-route Suspense boundary. Sits inside DashboardLayout's Outlet, so the
 * sidebar stays painted while a page chunk (and later, its query) resolves.
 */
function PageBoundary({ fallback, children }: PageBoundaryProps) {
  return <Suspense fallback={fallback}>{children}</Suspense>
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<GuestOnly />}>
        <Route
          path="login"
          element={
            <Suspense fallback={null}>
              <LoginPage />
            </Suspense>
          }
        />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<DashboardLayout />}>
          <Route
            index
            element={
              <PageBoundary fallback={<DashboardSkeleton />}>
                <DashboardPage />
              </PageBoundary>
            }
          />
          <Route
            path="profile"
            element={
              <PageBoundary fallback={<ProfileSkeleton />}>
                <ProfilePage />
              </PageBoundary>
            }
          />
          <Route
            path="jlpt-levels"
            element={
              <PageBoundary fallback={<JlptLevelsSkeleton />}>
                <JlptLevelsPage />
              </PageBoundary>
            }
          />
          <Route
            path="lessons"
            element={
              <PageBoundary fallback={<LessonsSkeleton />}>
                <LessonsPage />
              </PageBoundary>
            }
          />
          <Route
            path="kana"
            element={
              <PageBoundary fallback={<KanaSkeleton />}>
                <KanaPage />
              </PageBoundary>
            }
          />
          <Route
            path="exams"
            element={
              <PageBoundary fallback={<ExamsSkeleton />}>
                <ExamsPage />
              </PageBoundary>
            }
          />
          <Route
            path="users"
            element={
              <PageBoundary fallback={<UsersSkeleton />}>
                <UsersPage />
              </PageBoundary>
            }
          />
          <Route
            path="codes"
            element={
              <PageBoundary fallback={<CodesSkeleton />}>
                <CodesPage />
              </PageBoundary>
            }
          />
          <Route
            path="reminders"
            element={
              <PageBoundary fallback={<RemindersSkeleton />}>
                <RemindersPage />
              </PageBoundary>
            }
          />
          <Route
            path="content"
            element={
              <PageBoundary fallback={<ContentSkeleton />}>
                <ContentPage />
              </PageBoundary>
            }
          />
        </Route>
      </Route>

      <Route
        path="500"
        element={
          <Suspense fallback={null}>
            <ServerErrorPage />
          </Suspense>
        }
      />
      <Route
        path="503"
        element={
          <Suspense fallback={null}>
            <ServiceUnavailablePage />
          </Suspense>
        }
      />
      <Route
        path="status"
        element={
          <Suspense fallback={null}>
            <StatusPage />
          </Suspense>
        }
      />
      <Route
        path="*"
        element={
          <Suspense fallback={null}>
            <NotFoundPage />
          </Suspense>
        }
      />
    </Routes>
  )
}
