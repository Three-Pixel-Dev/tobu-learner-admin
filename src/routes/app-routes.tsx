import { Suspense, lazy, type ReactNode } from 'react'
import { Route, Routes } from 'react-router-dom'

import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { CodesSkeleton } from '@/features/codes/components/codes-skeleton'
import { ContentSkeleton } from '@/features/content/components/content-skeleton'
import { DashboardSkeleton } from '@/features/dashboard/components/dashboard-skeleton'
import { ExamsSkeleton } from '@/features/exams/components/exams-skeleton'
import { KanaSkeleton } from '@/features/kana/components/kana-skeleton'
import { LessonsSkeleton } from '@/features/lessons/components/lessons-skeleton'
import { RemindersSkeleton } from '@/features/reminders/components/reminders-skeleton'
import { UsersSkeleton } from '@/features/users/components/users-skeleton'

const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page').then((m) => ({ default: m.DashboardPage })),
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
    </Routes>
  )
}
