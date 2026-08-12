import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Avatar } from '@/components/common/avatar'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { UserCertificateList } from '@/features/users/components/user-certificate-list'
import { UserDetailSkeleton } from '@/features/users/components/user-detail-skeleton'
import { UserStatTile } from '@/features/users/components/user-stat-tile'
import {
  useRestoreUserMutation,
  useSoftDeleteUserMutation,
  useUserDetailQuery,
} from '@/shared/queries/user.query'
import { getInitials } from '@/util/initials'
import { formatJoinedMonth, formatRelativeTime } from '@/util/relative-time'

function formatCount(value: number): string {
  return new Intl.NumberFormat('en').format(value)
}

export function UserDetailPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const validId = Number.isFinite(id) && id > 0 ? id : null
  const navigate = useNavigate()
  const detailQuery = useUserDetailQuery(validId)
  const softDelete = useSoftDeleteUserMutation()
  const restore = useRestoreUserMutation()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  if (!validId) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive">
        Invalid learner id.{' '}
        <Link to="/users" className="font-semibold text-primary-dark">
          Back to users
        </Link>
      </div>
    )
  }

  if (detailQuery.isLoading && !detailQuery.data) {
    return <UserDetailSkeleton />
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive" role="alert">
        {getApiErrorMessage(detailQuery.error, 'Could not load this learner.')}{' '}
        <Link to="/users" className="font-semibold text-primary-dark">
          Back to users
        </Link>
      </div>
    )
  }

  const user = detailQuery.data
  const certificates = user.certificates ?? { total: 0, passed: 0, levels: [] }
  const passRate =
    certificates.total > 0 ? Math.round((certificates.passed / certificates.total) * 100) : null
  const tone = user.deleted ? ('danger' as const) : user.id % 2 === 0 ? ('info' as const) : ('primary' as const)
  const busy = softDelete.isPending || restore.isPending

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        <span className="text-[12.5px] text-subtle">
          People / <Link to="/users">Users</Link> /{' '}
          <strong className="text-foreground">{user.name}</strong>
        </span>
        <Button type="button" variant="ghost" onClick={() => navigate('/users')}>
          ← Back to users
        </Button>
      </div>

      <PageHeader
        title={user.deleted ? `${user.name} (deleted)` : user.name}
        subtitle={user.deleted ? `Removed ${formatRelativeTime(user.updatedAt)}` : user.email}
      >
        {user.deleted ? (
          <Button
            type="button"
            disabled={busy}
            onClick={() => {
              restore.mutate(user.id, {
                onSuccess: () => setToast('User restored.'),
                onError: (error) => setToast(getApiErrorMessage(error)),
              })
            }}
          >
            Restore user
          </Button>
        ) : (
          <Button type="button" variant="dangerOutline" disabled={busy} onClick={() => setConfirmRemove(true)}>
            Remove user
          </Button>
        )}
      </PageHeader>

      <Panel className="mb-[18px]">
        <div className="flex flex-wrap items-center gap-[16px]">
          <Avatar
            initials={getInitials(user.name, '?')}
            tone={tone}
            className="h-[56px] w-[56px] text-[18px]"
          />
          <dl className="m-0 grid min-w-0 flex-1 grid-cols-2 gap-x-[24px] gap-y-[10px] sm:grid-cols-4">
            <div>
              <dt className="text-[11px] font-bold uppercase text-subtle">JLPT levels</dt>
              <dd className="m-0 text-[13.5px] font-semibold">{user.level || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-subtle">Login code</dt>
              <dd className="m-0 font-mono text-[13.5px] font-semibold">{user.loginCode || '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-subtle">Joined</dt>
              <dd className="m-0 text-[13.5px] font-semibold">{formatJoinedMonth(user.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-bold uppercase text-subtle">Status</dt>
              <dd className="m-0 text-[13.5px] font-semibold">
                {user.deleted ? 'Removed' : user.ban ? 'Banned' : 'Active'}
              </dd>
            </div>
          </dl>
        </div>
      </Panel>

      <div className="mb-[22px] grid grid-cols-4 gap-[12px] max-md:grid-cols-2">
        <UserStatTile label="Certificates" value={formatCount(certificates.total)} />
        <UserStatTile label="Passed" value={formatCount(certificates.passed)} tone="primary" />
        <UserStatTile label="Pass rate" value={passRate == null ? '—' : `${passRate}%`} />
        <UserStatTile label="Streak / XP" value={`🔥 ${user.currentStreak} · ${formatCount(user.totalXp)}`} />
      </div>

      <UserCertificateList userId={user.id} summary={certificates} onCopied={setToast} />

      <ConfirmDialog
        open={confirmRemove}
        tone="danger"
        icon="⚠"
        title={`Remove ${user.name}?`}
        description="This hides the learner from the app, but nothing is permanently deleted. You can restore them later."
        cancelLabel="Cancel"
        confirmLabel="Remove user"
        busy={softDelete.isPending}
        onCancel={() => {
          if (!softDelete.isPending) setConfirmRemove(false)
        }}
        onConfirm={() => {
          softDelete.mutate(user.id, {
            onSuccess: () => {
              setConfirmRemove(false)
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
