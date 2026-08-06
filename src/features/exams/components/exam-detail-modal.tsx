import { Button } from '@/components/ui/button'
import { ExamQuestionPreview } from '@/features/exams/components/exam-question-preview'
import { type ExamDetailDto } from '@/shared/services/exam.service'

interface ExamDetailModalProps {
  exam: ExamDetailDto | null
  open: boolean
  onClose: () => void
}

export function ExamDetailModal({ exam, open, onClose }: ExamDetailModalProps) {
  if (!open || !exam) return null

  const mins = Math.round((exam.timeLimitSeconds || 300) / 60)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-muted bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-muted bg-muted/20 px-6 py-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {exam.jlptLevelCode || 'N5'}
              </span>
              {exam.titleJp ? (
                <span className="text-xs font-semibold text-muted-foreground">{exam.titleJp}</span>
              ) : null}
            </div>
            <h2 className="font-display text-xl font-bold">{exam.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm font-bold text-muted-foreground hover:bg-muted/80"
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 border-b border-muted bg-muted/10 p-4 text-center text-xs">
          <div className="rounded-xl border border-muted bg-card p-2">
            <span className="block text-[10px] font-bold uppercase text-muted-foreground">
              Time Limit
            </span>
            <span className="font-extrabold text-foreground">⏱ {mins} minutes</span>
          </div>
          <div className="rounded-xl border border-muted bg-card p-2">
            <span className="block text-[10px] font-bold uppercase text-muted-foreground">
              Pass Requirement
            </span>
            <span className="font-extrabold text-foreground">
              🎯 {exam.passScore} / {exam.totalScore} pts
            </span>
          </div>
          <div className="rounded-xl border border-muted bg-card p-2">
            <span className="block text-[10px] font-bold uppercase text-muted-foreground">
              Total Questions
            </span>
            <span className="font-extrabold text-emerald-600">
              📄 {exam.questions?.length || 0} items
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {!exam.questions || exam.questions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No questions added to this exam paper yet.
            </div>
          ) : (
            exam.questions.map((q, idx) => (
              <ExamQuestionPreview key={q.id || idx} question={q} index={idx} />
            ))
          )}
        </div>

        <div className="flex justify-end border-t border-muted p-4">
          <Button variant="ghost" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  )
}
