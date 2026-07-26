import { Button } from '@/components/ui/button'
import { Pill } from '@/components/ui/pill'
import type { ExamDetailDto } from '@/shared/services/exam.service'

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
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-3xl bg-card shadow-2xl overflow-hidden border border-muted">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted px-6 py-4 bg-muted/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-lg bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                {exam.jlptLevelCode || 'N5'}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {exam.titleJp || 'だい１かい'}
              </span>
            </div>
            <h2 className="text-xl font-bold font-display">{exam.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted/80 text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Exam Meta Banner */}
        <div className="grid grid-cols-3 gap-3 border-b border-muted bg-muted/10 p-4 text-center text-xs">
          <div className="rounded-xl bg-card p-2 border border-muted">
            <span className="block text-[10px] text-muted-foreground font-bold uppercase">Time Limit</span>
            <span className="font-extrabold text-foreground">⏱ {mins} minutes</span>
          </div>
          <div className="rounded-xl bg-card p-2 border border-muted">
            <span className="block text-[10px] text-muted-foreground font-bold uppercase">Pass Requirement</span>
            <span className="font-extrabold text-foreground">🎯 {exam.passScore} / {exam.totalScore} pts</span>
          </div>
          <div className="rounded-xl bg-card p-2 border border-muted">
            <span className="block text-[10px] text-muted-foreground font-bold uppercase">Total Questions</span>
            <span className="font-extrabold text-emerald-600">📄 {exam.questions?.length || 0} items</span>
          </div>
        </div>

        {/* Question List Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {(!exam.questions || exam.questions.length === 0) ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No questions added to this exam paper yet.
            </div>
          ) : (
            exam.questions.map((q, idx) => (
              <div key={q.id || idx} className="rounded-2xl border border-muted p-4 space-y-2 bg-card">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Question #{idx + 1}</span>
                  <Pill variant="vocab">{q.categoryName || 'Section'}</Pill>
                </div>

                {q.mondaiTitle && (
                  <p className="text-xs font-semibold text-muted-foreground">{q.mondaiTitle}</p>
                )}

                <p className="text-sm font-bold text-foreground">{q.prompt}</p>

                {q.passage && (
                  <div className="rounded-xl bg-muted/40 p-3 text-xs italic border border-muted/50">
                    {q.passage}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {q.choices?.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className={`rounded-xl border p-2 text-xs flex items-center gap-2 ${
                        c.correct
                          ? 'border-emerald-500 bg-emerald-50/70 font-bold text-emerald-900'
                          : 'border-muted text-muted-foreground'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-muted font-bold">
                        {cIdx + 1}
                      </span>
                      <span>{c.content}</span>
                      {c.correct && <span className="ml-auto text-emerald-600 font-extrabold">✓</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-muted p-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  )
}
