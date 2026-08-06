import { Button } from '@/components/ui/button'
import { Pill } from '@/components/ui/pill'
import type { ExamDto } from '@/shared/services/exam.service'
import { cn } from '@/util/cn'

interface ExamGridProps {
  exams: ExamDto[]
  loading?: boolean
  onOpen: (exam: ExamDto) => void
  onPreview: (exam: ExamDto) => void
  onEdit: (exam: ExamDto) => void
  onDelete: (exam: ExamDto) => void
  onRestore: (id: number) => void
}

export function ExamGrid({
  exams,
  loading = false,
  onOpen,
  onPreview,
  onEdit,
  onDelete,
  onRestore,
}: ExamGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-2xl border border-muted bg-muted/40" />
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted bg-card p-12 text-center">
        <span className="mb-3 text-4xl">📝</span>
        <h3 className="text-base font-bold text-foreground">No Exam Papers Found</h3>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          No mock exam papers have been created for this JLPT level yet. Click "＋ New Exam" to
          create one.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {exams.map((exam) => {
        const isDeleted = Boolean(exam.deleted)
        const mins = Math.round((exam.timeLimitSeconds || 300) / 60)

        return (
          <div
            key={exam.id}
            role="button"
            tabIndex={0}
            className={cn(
              'flex cursor-pointer flex-col justify-between rounded-2xl border bg-card p-5 shadow-sm transition-all',
              isDeleted
                ? 'border-destructive/30 bg-destructive/5 opacity-50'
                : 'border-muted hover:border-primary/50 hover:bg-muted/20',
            )}
            onClick={() => onOpen(exam)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(exam)
              }
            }}
          >
            <div>
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">
                  {exam.jlptLevelCode || 'N5'}
                </span>
                <div className="flex items-center gap-1.5">
                  {exam.published ? (
                    <Pill variant="grammar">Published</Pill>
                  ) : (
                    <Pill variant="vocab">Draft</Pill>
                  )}
                  {exam.comingSoon ? <Pill variant="quiz">Soon</Pill> : null}
                </div>
              </div>

              <h3 className="mb-1 font-display text-lg font-bold text-foreground">
                {exam.title}
                {exam.titleJp ? (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({exam.titleJp})
                  </span>
                ) : null}
              </h3>

              <div className="mt-3 mb-4 grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-2.5 text-center text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Duration
                  </span>
                  <span className="font-semibold text-foreground">⏱ {mins} mins</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Pass Score
                  </span>
                  <span className="font-semibold text-foreground">🎯 {exam.passScore} pts</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-muted-foreground">
                    Questions
                  </span>
                  <span className="font-bold font-semibold text-emerald-600">
                    📄 {exam.questionCount ?? 0}
                  </span>
                </div>
              </div>
            </div>

            <div
              className="flex items-center gap-2 border-t border-muted pt-3"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => onPreview(exam)}
                disabled={isDeleted}
              >
                👁 Preview
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => onEdit(exam)}
                disabled={isDeleted}
              >
                ✏️ Edit
              </Button>
              {isDeleted ? (
                <Button
                  variant="ghost"
                  className="text-xs text-emerald-600"
                  onClick={() => onRestore(exam.id)}
                >
                  Restore
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  className="text-xs text-destructive"
                  onClick={() => onDelete(exam)}
                >
                  Disable
                </Button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
