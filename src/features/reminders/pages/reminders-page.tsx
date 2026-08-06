import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import {
  useCancelReminderMutation,
  useDuplicateReminderMutation,
  useRemindersInfiniteQuery,
} from '@/shared/queries/reminder.query'
import type { ReminderDto, ReminderStatus } from '@/shared/services/reminder.service'
import { cn } from '@/util/cn'

const TABS: { id: ReminderStatus | ''; label: string }[] = [
  { id: '', label: 'All' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'sent', label: 'Sent' },
  { id: 'cancelled', label: 'Cancelled' },
]

function audienceLabel(r: ReminderDto) {
  if (r.audienceType === 'INACTIVE') return 'Inactive users'
  if (r.audienceType === 'LEVEL') {
    return r.jlptLevelCodes.length ? r.jlptLevelCodes.join(', ') : 'Level'
  }
  return 'All learners'
}

function StatusDot({ status }: { status: ReminderStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-[6px] text-[12.5px] font-semibold capitalize',
        status === 'scheduled' && 'text-amber-800',
        status === 'sent' && 'text-emerald-700',
        status === 'cancelled' && 'text-slate-400',
      )}
    >
      <span
        className={cn(
          'inline-block size-[7px] rounded-full',
          status === 'scheduled' && 'bg-amber-700',
          status === 'sent' && 'bg-emerald-500',
          status === 'cancelled' && 'bg-slate-300',
        )}
      />
      {status}
    </span>
  )
}

export function RemindersPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<ReminderStatus | ''>('')
  const [toast, setToast] = useState<string | null>(null)
  const [pendingCancel, setPendingCancel] = useState<ReminderDto | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const listQuery = useRemindersInfiniteQuery(tab, '')
  const cancelMutation = useCancelReminderMutation()
  const duplicateMutation = useDuplicateReminderMutation()

  const rows = useMemo(
    () => listQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [listQuery.data],
  )

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          listQuery.hasNextPage &&
          !listQuery.isFetchingNextPage
        ) {
          void listQuery.fetchNextPage()
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.fetchNextPage, rows.length])

  const handleCancel = async () => {
    if (!pendingCancel) return
    try {
      await cancelMutation.mutateAsync(pendingCancel.id)
      setToast('Reminder cancelled.')
      setPendingCancel(null)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not cancel reminder.'))
    }
  }

  const handleDuplicate = async (id: number) => {
    try {
      const copy = await duplicateMutation.mutateAsync(id)
      setToast('Reminder duplicated.')
      navigate(`/reminders/${copy.id}/edit`)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not duplicate reminder.'))
    }
  }

  return (
    <>
      <PageHeader
        title="Reminders"
        subtitle="Push campaigns to learners — now, later, or on a repeat"
      >
        <Button onClick={() => navigate('/reminders/new')}>+ New reminder</Button>
      </PageHeader>

      <div
        className="mb-[18px] flex w-fit gap-[6px] rounded-[12px] bg-muted p-[4px]"
        role="tablist"
        aria-label="Reminder status"
      >
        {TABS.map((t) => (
          <button
            key={t.id || 'all'}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={cn(
              'rounded-[9px] px-[16px] py-[8px] text-[13px] font-semibold text-muted-foreground',
              tab === t.id && 'bg-background text-emerald-800 shadow-sm',
            )}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Panel className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="m-0 px-[18px] py-[24px] text-[13px] text-muted-foreground">Loading…</p>
        ) : rows.length === 0 ? (
          <div className="px-[20px] py-[50px] text-center">
            <div className="mb-[10px] text-[30px]" aria-hidden>
              🔔
            </div>
            <h3 className="m-0 mb-[6px] text-[15px] font-semibold">No reminders yet</h3>
            <p className="m-0 mb-[14px] text-[13px] text-muted-foreground">
              Create a campaign to nudge learners about streaks, lessons, or exams.
            </p>
            <Button onClick={() => navigate('/reminders/new')}>Create reminder</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-muted/50 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                  <th className="px-[18px] py-[12px]">Reminder</th>
                  <th className="px-[18px] py-[12px]">Audience</th>
                  <th className="px-[18px] py-[12px]">Schedule</th>
                  <th className="px-[18px] py-[12px]">Status</th>
                  <th className="px-[18px] py-[12px]">Performance</th>
                  <th className="px-[18px] py-[12px]" />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-border/60 text-[13.5px]">
                    <td className="px-[18px] py-[14px] align-middle">
                      <div className="font-semibold">{r.title}</div>
                      <div className="mt-[1px] max-w-[280px] truncate text-[11.5px] text-muted-foreground">
                        {r.body}
                      </div>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <span className="inline-flex rounded-full bg-sky-50 px-[10px] py-[4px] text-[11px] font-bold text-sky-800">
                        {audienceLabel(r)}
                      </span>
                    </td>
                    <td className="px-[18px] py-[14px] align-middle text-[12.5px] text-muted-foreground">
                      {r.scheduleLabel}
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <StatusDot status={r.status} />
                    </td>
                    <td className="px-[18px] py-[14px] align-middle text-[12px] text-muted-foreground">
                      {r.status === 'sent' || r.sentCount > 0 ? (
                        <>
                          <strong className="text-foreground">{r.sentCount}</strong> sent
                          {r.openedCount > 0 ? (
                            <>
                              {' '}
                              · <strong className="text-foreground">{r.openedCount}</strong> opened
                            </>
                          ) : null}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="px-[18px] py-[14px] align-middle">
                      <div className="flex justify-end">
                        <ActionMenu
                          label={`Actions for ${r.title}`}
                          items={[
                            ...(r.status === 'scheduled'
                              ? [
                                  {
                                    id: 'edit',
                                    label: 'Edit',
                                    onSelect: () => navigate(`/reminders/${r.id}/edit`),
                                  },
                                ]
                              : []),
                            {
                              id: 'duplicate',
                              label: 'Duplicate',
                              onSelect: () => void handleDuplicate(r.id),
                            },
                            ...(r.status === 'sent'
                              ? [
                                  {
                                    id: 'report',
                                    label: 'View report',
                                    onSelect: () => navigate(`/reminders/${r.id}/report`),
                                  },
                                ]
                              : []),
                            ...(r.status === 'scheduled'
                              ? [
                                  {
                                    id: 'cancel',
                                    label: 'Cancel',
                                    tone: 'danger' as const,
                                    onSelect: () => setPendingCancel(r),
                                  },
                                ]
                              : []),
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div ref={sentinelRef} className="h-px" />
        {listQuery.isFetchingNextPage ? (
          <p className="m-0 px-[18px] py-[12px] text-[12px] text-muted-foreground">Loading more…</p>
        ) : null}
      </Panel>

      <p className="mt-[10px] text-[12px] text-muted-foreground">
        Tip: sent reminders can’t be edited —{' '}
        <Link to="/reminders/new" className="text-emerald-700 underline-offset-2 hover:underline">
          create a new one
        </Link>{' '}
        or duplicate from the row menu.
      </p>

      <ConfirmDialog
        open={pendingCancel != null}
        title="Cancel reminder?"
        description={
          pendingCancel
            ? `“${pendingCancel.title}” will not be sent. This can’t be undone.`
            : ''
        }
        confirmLabel="Cancel reminder"
        tone="danger"
        onConfirm={() => void handleCancel()}
        onCancel={() => setPendingCancel(null)}
        busy={cancelMutation.isPending}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
