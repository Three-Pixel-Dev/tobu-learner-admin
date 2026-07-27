import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { useDeleteExam, useExamDetail, useRestoreExam } from '@/features/exams/exam.query'
import { ExamDetailModal } from '@/features/exams/components/exam-detail-modal'
import { ExamQuestionPreview } from '@/features/exams/components/exam-question-preview'

function formatWhen(iso?: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export function ExamDetailPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const detailQuery = useExamDetail(Number.isFinite(id) && id > 0 ? id : undefined)
  const deleteMutation = useDeleteExam()
  const restoreMutation = useRestoreExam()
  const [confirmDisable, setConfirmDisable] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const exam = detailQuery.data

  if (detailQuery.isLoading) {
    return <div className="py-[40px] text-center text-[13px] text-muted-foreground">Loading…</div>
  }
  if (detailQuery.isError || !exam) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive">
        Could not load exam.{' '}
        <Link to="/exams" className="text-primary-dark">
          Back to list
        </Link>
      </div>
    )
  }

  const mins = Math.round((exam.timeLimitSeconds || 300) / 60)
  const statusLabel = exam.deleted
    ? 'Disabled'
    : exam.published
      ? 'Published'
      : 'Draft'
  const questions = exam.questions ?? []

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        <span className="text-[12.5px] text-subtle">
          Content / <Link to="/exams">Exams</Link> / {exam.jlptLevelCode} /{' '}
          <strong className="text-foreground">{exam.title}</strong>
        </span>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Button type="button" variant="ghost" onClick={() => setPreviewOpen(true)}>
            👁 Preview
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/exams')}>
            ← Back to list
          </Button>
        </div>
      </div>

      <PageHeader
        title={exam.title}
        subtitle={`${exam.jlptLevelCode}${exam.titleJp ? ` ・ ${exam.titleJp}` : ''} ・ ${statusLabel}`}
      />

      <div className="grid grid-cols-[1.4fr_1fr] gap-[18px] max-md:grid-cols-1">
        <div className="space-y-4">
          <Panel>
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Exam overview</h3>
            <div className="grid grid-cols-3 gap-3 text-center text-xs max-sm:grid-cols-1">
              <div className="rounded-xl border border-muted bg-muted/20 p-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                  Duration
                </span>
                <span className="font-extrabold text-foreground">{mins} mins</span>
              </div>
              <div className="rounded-xl border border-muted bg-muted/20 p-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                  Pass score
                </span>
                <span className="font-extrabold text-foreground">
                  {exam.passScore} / {exam.totalScore}
                </span>
              </div>
              <div className="rounded-xl border border-muted bg-muted/20 p-3">
                <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                  Questions
                </span>
                <span className="font-extrabold text-emerald-600">{questions.length}</span>
              </div>
            </div>
          </Panel>

          <Panel>
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Questions</h3>
            {questions.length === 0 ? (
              <p className="m-0 text-[13px] text-muted-foreground">
                No questions added yet. Open the editor to add content.
              </p>
            ) : (
              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <ExamQuestionPreview key={q.id ?? idx} question={q} index={idx} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-4">
          <Panel>
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Activity</h3>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px] first:border-t-0">
              <span className="text-muted-foreground">Created</span>
              <span className="font-semibold">{formatWhen(exam.createdAt)}</span>
            </div>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px]">
              <span className="text-muted-foreground">Last updated</span>
              <span className="font-semibold">{formatWhen(exam.updatedAt)}</span>
            </div>
            <div className="flex justify-between border-t border-muted py-[10px] text-[13px]">
              <span className="text-muted-foreground">Status</span>
              <span className="font-semibold">{statusLabel}</span>
            </div>
            {exam.comingSoon ? (
              <div className="flex justify-between border-t border-muted py-[10px] text-[13px]">
                <span className="text-muted-foreground">Flag</span>
                <span className="font-semibold">Coming soon</span>
              </div>
            ) : null}
          </Panel>

          <Panel>
            <h3 className="m-0 mb-[14px] font-display text-[14.5px]">Actions</h3>
            <button
              type="button"
              className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold hover:bg-muted disabled:opacity-50"
              disabled={Boolean(exam.deleted)}
              onClick={() => navigate(`/exams/${exam.id}/edit`)}
            >
              <span aria-hidden>✎</span> Edit exam
            </button>
            {exam.deleted ? (
              <button
                type="button"
                className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold hover:bg-muted"
                disabled={restoreMutation.isPending}
                onClick={async () => {
                  try {
                    await restoreMutation.mutateAsync(exam.id)
                    setToast('Exam restored.')
                  } catch (err) {
                    setToast(getApiErrorMessage(err, 'Could not restore exam.'))
                  }
                }}
              >
                <span aria-hidden>↩</span> Restore exam
              </button>
            ) : (
              <button
                type="button"
                className="mb-[8px] flex w-full cursor-pointer items-center gap-[10px] rounded-xl border-[1.5px] border-[#FCA5A5] bg-card px-[14px] py-[11px] font-body text-[13.5px] font-semibold text-destructive hover:bg-destructive-soft"
                onClick={() => setConfirmDisable(true)}
              >
                <span aria-hidden>🗑</span> Disable exam
              </button>
            )}
          </Panel>
        </div>
      </div>

      <ExamDetailModal
        open={previewOpen}
        exam={exam}
        onClose={() => setPreviewOpen(false)}
      />

      <ConfirmDialog
        open={confirmDisable}
        title="Disable this exam paper?"
        description={
          <>
            <strong className="text-foreground">{exam.title}</strong> will be hidden from learners.
            You can restore it later.
          </>
        }
        confirmLabel="Disable"
        busy={deleteMutation.isPending}
        onConfirm={async () => {
          try {
            await deleteMutation.mutateAsync(exam.id)
            setConfirmDisable(false)
            setToast('Exam disabled.')
            navigate('/exams')
          } catch (err) {
            setToast(getApiErrorMessage(err, 'Could not disable exam.'))
          }
        }}
        onCancel={() => {
          if (!deleteMutation.isPending) setConfirmDisable(false)
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
