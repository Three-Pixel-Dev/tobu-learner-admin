import { useDeferredValue, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import type { UserAdminDto } from '@/app/api/types'
import { Avatar } from '@/components/common/avatar'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { IconButton } from '@/components/ui/icon-button'
import { Panel } from '@/components/ui/panel'
import { UsersSkeleton } from '@/features/users/components/users-skeleton'
import {
  useRestoreUserMutation,
  useSoftDeleteUserMutation,
  useUsersPageQuery,
} from '@/shared/queries/user.query'
import { cn } from '@/util/cn'
import { getInitials } from '@/util/initials'
import { formatRelativeTime } from '@/util/relative-time'

const ROW_GRID = 'grid grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.6fr] items-center px-[14px] py-[11px] text-[12.5px]'

interface PendingRemove {
  id: number
  name: string
}

function formatActiveSubtitle(count: number | undefined): string {
  if (count == null) return 'Loading learners…'
  const formatted = new Intl.NumberFormat('en').format(count)
  return `${formatted} active learner${count === 1 ? '' : 's'}`
}

function toRowView(user: UserAdminDto) {
  const deleted = user.deleted
  return {
    id: user.id,
    name: deleted ? `${user.name} (deleted)` : user.name,
    displayName: user.name,
    detail: deleted ? `removed ${formatRelativeTime(user.updatedAt)}` : user.email,
    initials: getInitials(user.name, '?'),
    tone: deleted ? ('danger' as const) : user.id % 2 === 0 ? ('info' as const) : ('primary' as const),
    level: deleted || !user.level ? '—' : user.level,
    streak: deleted ? '—' : `🔥 ${user.currentStreak}`,
    xp: deleted ? '—' : String(user.totalXp),
    deleted,
  }
}

export function UsersPage() {
  const [keyword, setKeyword] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)
  const deferredKeyword = useDeferredValue(keyword.trim())

  const request = useMemo(
    () => ({
      pageNumber,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      filter: { keyword: deferredKeyword || undefined },
    }),
    [pageNumber, pageSize, deferredKeyword],
  )

  const usersQuery = useUsersPageQuery(request)
  const softDelete = useSoftDeleteUserMutation()
  const restore = useRestoreUserMutation()

  if (usersQuery.isLoading && !usersQuery.data) {
    return <UsersSkeleton />
  }

  if (usersQuery.isError) {
    return (
      <>
        <PageHeader title="Users" subtitle="Learners">
          <SearchBox
            placeholder="Search by name or email"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPageNumber(1)
            }}
          />
        </PageHeader>
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(usersQuery.error, 'Failed to load users.')}
        </p>
      </>
    )
  }

  const rows = (usersQuery.data?.data ?? []).map(toRowView)
  const meta = usersQuery.data?.meta
  const busyId = softDelete.isPending
    ? softDelete.variables
    : restore.isPending
      ? restore.variables
      : null

  return (
    <>
      <PageHeader title="Users" subtitle={formatActiveSubtitle(meta?.activeCount)}>
        <SearchBox
          placeholder="Search by name or email"
          value={keyword}
          onChange={(event) => {
            setKeyword(event.target.value)
            setPageNumber(1)
          }}
          aria-label="Search users by name or email"
        />
      </PageHeader>

      <Panel id="users-table" className="p-0" role="table" aria-label="Users">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle',
          )}
          role="row"
        >
          <div>User</div>
          <div>Level</div>
          <div>Streak</div>
          <div>XP</div>
          <div />
        </div>

        {rows.length === 0 ? (
          <div className="px-[14px] py-[28px] text-center text-[13px] text-muted-foreground">
            {deferredKeyword ? 'No users match your search.' : 'No learners yet.'}
          </div>
        ) : null}

        {rows.map((user) => (
          <div key={user.id} className={cn(ROW_GRID, 'border-t border-muted')}>
            <div className="flex items-center gap-[8px]">
              <Avatar initials={user.initials} tone={user.tone} />
              <div>
                <div className={cn('font-semibold', user.deleted && 'text-subtle')}>{user.name}</div>
                <div className="text-[10.5px] text-subtle">{user.detail}</div>
              </div>
            </div>
            <div className={cn('font-semibold', user.deleted && 'font-normal text-disabled')}>
              {user.level}
            </div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.streak}</div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.xp}</div>
            <div>
              {user.deleted ? (
                <IconButton
                  aria-label={`Restore ${user.displayName}`}
                  title="Restore user"
                  disabled={busyId === user.id}
                  onClick={() => {
                    restore.mutate(user.id, {
                      onSuccess: () => setToast('User restored.'),
                      onError: (error) => setToast(getApiErrorMessage(error)),
                    })
                  }}
                >
                  ↺
                </IconButton>
              ) : (
                <IconButton
                  aria-label={`Remove ${user.displayName}`}
                  title="Remove user"
                  disabled={busyId === user.id}
                  onClick={() => setPendingRemove({ id: user.id, name: user.displayName })}
                >
                  ⋯
                </IconButton>
              )}
            </div>
          </div>
        ))}
      </Panel>

      {meta ? (
        <TablePagination
          label="Users pagination"
          controlsId="users-table"
          meta={meta}
          busy={usersQuery.isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPageNumber(1)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={pendingRemove != null}
        tone="danger"
        icon="⚠"
        title={pendingRemove ? `Remove ${pendingRemove.name}?` : 'Remove user?'}
        description="This hides the learner from the app, but nothing is permanently deleted. You can restore them later from this list."
        cancelLabel="Cancel"
        confirmLabel="Remove user"
        busy={softDelete.isPending}
        onCancel={() => {
          if (!softDelete.isPending) setPendingRemove(null)
        }}
        onConfirm={() => {
          if (!pendingRemove) return
          softDelete.mutate(pendingRemove.id, {
            onSuccess: () => {
              setPendingRemove(null)
              setToast('User removed.')
            },
            onError: (error) => setToast(getApiErrorMessage(error)),
          })
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
