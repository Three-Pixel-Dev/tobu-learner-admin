import { Button } from '@/components/ui/button'
import { Pill } from '@/components/ui/pill'
import type { ExamDto } from '@/shared/services/exam.service'

interface ExamGridProps {
  exams: ExamDto[]
  loading?: boolean
  onEdit: (exam: ExamDto) => void
  onViewDetail: (exam: ExamDto) => void
  onDelete: (id: number) => void
  onRestore: (id: number) => void
}

export function ExamGrid({
  exams,
  loading = false,
  onEdit,
  onViewDetail,
  onDelete,
  onRestore,
}: ExamGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-2xl bg-muted/40 animate-pulse border border-muted" />
        ))}
      </div>
    )
  }

  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-muted p-12 text-center bg-card">
        <span className="text-4xl mb-3">📝</span>
        <h3 className="text-base font-bold text-foreground">No Exam Papers Found</h3>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          No mock exam papers have been created for this JLPT level yet. Click "＋ New Exam" to create one.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exams.map((exam) => {
        const isDeleted = Boolean(exam.deleted)
        const mins = Math.round((exam.timeLimitSeconds || 300) / 60)

        return (
          <div
            key={exam.id}
            className={`flex flex-col justify-between rounded-2xl border p-5 transition-all shadow-sm bg-card ${
              isDeleted ? 'opacity-50 border-destructive/30 bg-destructive/5' : 'border-muted hover:border-primary/50'
            }`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-primary/10 px-2.5 py-1 text-xs font-extrabold text-primary">
                  {exam.jlptLevelCode || 'N5'}
                </span>
                <div className="flex items-center gap-1.5">
                  {exam.published ? (
                    <Pill variant="grammar">Published</Pill>
                  ) : (
                    <Pill variant="vocab">Draft</Pill>
                  )}
                  {exam.comingSoon && <Pill variant="kanji">Soon</Pill>}
                </div>
              </div>

              <h3 className="font-display text-lg font-bold text-foreground mb-1">
                {exam.title}
                {exam.titleJp && <span className="text-xs text-muted-foreground ml-2 font-normal">({exam.titleJp})</span>}
              </h3>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-muted/30 p-2.5 text-center text-xs mt-3 mb-4">
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">Duration</span>
                  <span className="font-semibold text-foreground">⏱ {mins} mins</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">Pass Score</span>
                  <span className="font-semibold text-foreground">🎯 {exam.passScore} pts</span>
                </div>
                <div>
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold">Questions</span>
                  <span className="font-semibold text-emerald-600 font-bold">📄 {exam.questionCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-muted pt-3">
              <Button
                variant="ghost"
                className="flex-1 text-xs"
                onClick={() => onViewDetail(exam)}
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
                  onClick={() => onDelete(exam.id)}
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
