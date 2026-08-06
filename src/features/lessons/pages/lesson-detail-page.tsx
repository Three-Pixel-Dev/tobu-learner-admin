import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import {
  useDuplicateLessonMutation,
  useLessonDetailQuery,
  useRestoreLessonMutation,
  useSoftDeleteLessonMutation,
} from '@/shared/queries/lesson.query'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function LessonDetailPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const detailQuery = useLessonDetailQuery(Number.isFinite(id) ? id : null)
  const duplicateMutation = useDuplicateLessonMutation()
  const softDeleteMutation = useSoftDeleteLessonMutation()
  const restoreMutation = useRestoreLessonMutation()
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [confirmDuplicate, setConfirmDuplicate] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const lesson = detailQuery.data

  if (detailQuery.isLoading) {
    return <div className="py-[40px] text-center text-[13px] text-muted-foreground">Loading…</div>
  }
  if (detailQuery.isError || !lesson) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive">
        Could not load lesson.{' '}
        <Link to="/lessons" className="text-primary-dark">
          Back to list
        </Link>
      </div>
    )
  }

  const statusLabel = lesson.deleted
    ? 'Disabled'
    : lesson.published
      ? 'Published'
      : 'Draft'

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        <span className="text-[12.5px] text-subtle">
          Content / <Link to="/lessons">Lessons</Link> / {lesson.jlptLevelCode} /{' '}
          <strong className="text-foreground">{lesson.title}</strong>
        </span>
        <Button type="button" variant="ghost" onClick={() => navigate('/lessons')}>
          ← Back to list
        </Button>
      </div>

      <PageHeader
        title={lesson.title}
        subtitle={`${lesson.jlptLevelCode} ・ ${statusLabel}`}
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-md:grid-cols-1">
        <div>
          <Panel className="mb-[16px]">
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Content breakdown</h3>
            <div className="flex flex-wrap gap-[6px]">
              <span className="rounded-[20px] bg-info-soft px-[9px] py-[3px] text-[11px] font-bold text-info-foreground">
                Vocab {lesson.vocabs.length}
              </span>
              <span className="rounded-[20px] bg-[#EDE9FE] px-[9px] py-[3px] text-[11px] font-bold text-[#6D28D9]">
                Grammar {lesson.grammars.length}
              </span>
              <span className="rounded-[20px] bg-warning-soft px-[9px] py-[3px] text-[11px] font-bold text-warning-foreground">
                Quiz {lesson.questions.length}
              </span>
            </div>
          </Panel>
          <Panel>
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Activity</h3>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px] first:border-t-0">
              <span className="text-muted-foreground">Created</span>
              <span className="font-semibold">{formatWhen(lesson.createdAt)}</span>
            </div>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px]">
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-semibold">{formatWhen(lesson.updatedAt)}</span>
            </div>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px]">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold">{statusLabel}</span>
            </div>
          </Panel>
        </div>

        <Panel>
          <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Actions</h3>
          <button
            type="button"
            className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold hover:bg-muted"
            onClick={() => navigate(`/lessons/${lesson.id}/edit`)}
          >
            <span aria-hidden>✎</span> Edit content
          </button>
          <button
            type="button"
            className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold hover:bg-muted"
            disabled={duplicateMutation.isPending}
            onClick={() => setConfirmDuplicate(true)}
          >
            <span aria-hidden>⧉</span> Duplicate lesson
          </button>
          {lesson.deleted ? (
            <button
              type="button"
              className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold hover:bg-muted"
              disabled={restoreMutation.isPending}
              onClick={async () => {
                try {
                  await restoreMutation.mutateAsync(lesson.id)
                  setToast('Lesson restored.')
                } catch (err) {
                  setToast(getApiErrorMessage(err, 'Could not restore.'))
                }
              }}
            >
              <span aria-hidden>↩</span> Restore lesson
            </button>
          ) : (
            <button
              type="button"
              className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-[#FCA5A5] bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold text-destructive hover:bg-destructive-soft"
              onClick={() => setConfirmDisable(true)}
            >
              <span aria-hidden>🗑</span> Disable lesson
            </button>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={confirmDisable}
        title="Disable this lesson?"
        description={
          <>
            <strong className="text-foreground">{lesson.title}</strong> will be hidden from learners.
            You can restore it later.
          </>
        }
        confirmLabel="Disable"
        busy={softDeleteMutation.isPending}
        onConfirm={async () => {
          try {
            await softDeleteMutation.mutateAsync(lesson.id)
            setConfirmDisable(false)
            setToast('Lesson disabled.')
            navigate('/lessons')
          } catch (err) {
            setToast(getApiErrorMessage(err, 'Could not disable.'))
          }
        }}
        onCancel={() => {
          if (!softDeleteMutation.isPending) setConfirmDisable(false)
        }}
      />

      <ConfirmDialog
        open={confirmDuplicate}
        title="Duplicate this lesson?"
        description={
          <>
            A draft copy of <strong className="text-foreground">{lesson.title}</strong> will be created
            under this JLPT level.
          </>
        }
        confirmLabel="Duplicate"
        tone="primary"
        icon="⧉"
        busy={duplicateMutation.isPending}
        onConfirm={async () => {
          try {
            const copy = await duplicateMutation.mutateAsync(lesson.id)
            setConfirmDuplicate(false)
            setToast('Duplicated — a draft copy was added to this level.')
            navigate(`/lessons/${copy.id}/edit`)
          } catch (err) {
            setToast(getApiErrorMessage(err, 'Could not duplicate.'))
          }
        }}
        onCancel={() => {
          if (!duplicateMutation.isPending) setConfirmDuplicate(false)
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
