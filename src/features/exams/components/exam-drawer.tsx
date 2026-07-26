import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  type CreateExamPayload,
  type ExamDetailDto,
  type ExamQuestionDto,
  type UpdateExamPayload,
} from '@/shared/services/exam.service'
import { cn } from '@/util/cn'

interface ExamDrawerProps {
  open: boolean
  mode: 'create' | 'edit'
  initial?: ExamDetailDto | null
  busy?: boolean
  onClose: () => void
  onSave: (payload: CreateExamPayload | UpdateExamPayload) => void
  onDelete?: () => void
  onRestore?: () => void
}

const CATEGORY_OPTIONS = [
  { id: 1, label: 'Vocabulary (語彙)' },
  { id: 2, label: 'Grammar (文法)' },
  { id: 3, label: 'Reading (読解)' },
  { id: 4, label: 'Listening (聴解)' },
]

export function ExamDrawer({
  open,
  mode,
  initial,
  busy = false,
  onClose,
  onSave,
  onDelete,
  onRestore,
}: ExamDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  const [jlptLevelId, setJlptLevelId] = useState<number>(1)
  const [title, setTitle] = useState('')
  const [titleJp, setTitleJp] = useState('')
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300)
  const [passScore, setPassScore] = useState(80)
  const [totalScore, setTotalScore] = useState(180)
  const [published, setPublished] = useState(true)
  const [comingSoon, setComingSoon] = useState(false)
  const [descriptionMm, setDescriptionMm] = useState('')

  const [questions, setQuestions] = useState<ExamQuestionDto[]>([])
  const [formAlert, setFormAlert] = useState<string | null>(null)

  const deleted = Boolean(initial?.deleted)

  useEffect(() => {
    if (!open) return
    if (initial) {
      setJlptLevelId(initial.jlptLevelId || 1)
      setTitle(initial.title || '')
      setTitleJp(initial.titleJp || '')
      setTimeLimitSeconds(initial.timeLimitSeconds || 300)
      setPassScore(initial.passScore || 80)
      setTotalScore(initial.totalScore || 180)
      setPublished(Boolean(initial.published))
      setComingSoon(Boolean(initial.comingSoon))
      setDescriptionMm(initial.descriptionMm || '')
      setQuestions(initial.questions || [])
    } else {
      setJlptLevelId(1)
      setTitle('')
      setTitleJp('')
      setTimeLimitSeconds(300)
      setPassScore(80)
      setTotalScore(180)
      setPublished(true)
      setComingSoon(false)
      setDescriptionMm('')
      setQuestions([
        {
          categoryId: 1,
          mondaiTitle: 'もんだい１ ・ Vocab',
          prompt: '',
          furigana: '',
          choices: [
            { content: '', correct: true, sortOrder: 1 },
            { content: '', correct: false, sortOrder: 2 },
            { content: '', correct: false, sortOrder: 3 },
            { content: '', correct: false, sortOrder: 4 },
          ],
        },
      ])
    }
    setFormAlert(null)
  }, [open, initial])

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        categoryId: 1,
        mondaiTitle: `Question ${prev.length + 1}`,
        prompt: '',
        furigana: '',
        sortOrder: prev.length + 1,
        choices: [
          { content: '', correct: true, sortOrder: 1 },
          { content: '', correct: false, sortOrder: 2 },
          { content: '', correct: false, sortOrder: 3 },
          { content: '', correct: false, sortOrder: 4 },
        ],
      },
    ])
  }

  const handleRemoveQuestion = (qIdx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIdx))
  }

  const handleQuestionChange = (qIdx: number, key: keyof ExamQuestionDto, val: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIdx ? { ...q, [key]: val } : q)),
    )
  }

  const handleChoiceChange = (qIdx: number, cIdx: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const newChoices = q.choices.map((c, j) => (j === cIdx ? { ...c, content: text } : c))
        return { ...q, choices: newChoices }
      }),
    )
  }

  const handleChoiceCorrect = (qIdx: number, cIdx: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q
        const newChoices = q.choices.map((c, j) => ({
          ...c,
          correct: j === cIdx,
        }))
        return { ...q, choices: newChoices }
      }),
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setFormAlert('Exam title is required.')
      return
    }

    const payload: CreateExamPayload = {
      jlptLevelId,
      title: title.trim(),
      titleJp: titleJp.trim() || undefined,
      timeLimitSeconds,
      passScore,
      totalScore,
      published,
      comingSoon,
      descriptionMm: descriptionMm.trim() || undefined,
      questions: questions.filter((q) => q.prompt.trim().length > 0),
    }

    onSave(payload)
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-60 bg-[rgba(15,23,42,0.45)] transition-opacity',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
        onClick={() => {
          if (!busy) onClose()
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-61 flex w-[min(560px,94vw)] flex-col bg-card shadow-[-12px_0_40px_rgba(0,0,0,0.15)] transition-transform duration-[220ms] ease',
          open ? 'translate-x-0' : 'translate-x-full',
          'motion-reduce:transition-none',
        )}
      >
        <div className="flex items-center justify-between border-b border-muted px-[22px] py-[20px]">
          <h2 id={titleId} className="m-0 font-display text-[17px] font-bold">
            {mode === 'edit' ? 'Edit Exam Paper' : 'Create New Exam Paper'}
          </h2>
          <button
            type="button"
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[9px] border-none bg-muted text-[15px] text-muted-foreground"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
          <div className="flex-1 overflow-y-auto px-[22px] py-[20px] space-y-4">
            {formAlert ? (
              <p className="text-[12.5px] font-semibold text-destructive">{formAlert}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[12.5px] font-semibold">JLPT Level *</label>
                <Select
                  value={jlptLevelId}
                  onChange={(e) => setJlptLevelId(Number(e.target.value))}
                  disabled={busy || deleted}
                >
                  <option value={1}>N5 Level</option>
                  <option value={2}>N4 Level</option>
                  <option value={3}>N3 Level</option>
                  <option value={4}>N2 Level</option>
                  <option value={5}>N1 Level</option>
                </Select>
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-semibold">Exam Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Test 1 / N5 Mock Exam #1"
                  required
                  disabled={busy || deleted}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-[12.5px] font-semibold">Title (JP)</label>
                <Input
                  value={titleJp}
                  onChange={(e) => setTitleJp(e.target.value)}
                  placeholder="だい１かい"
                  disabled={busy || deleted}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-semibold">Time Limit (Sec)</label>
                <Input
                  type="number"
                  value={timeLimitSeconds}
                  onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
                  placeholder="300"
                  disabled={busy || deleted}
                />
              </div>

              <div>
                <label className="mb-1 block text-[12.5px] font-semibold">Pass Score</label>
                <Input
                  type="number"
                  value={passScore}
                  onChange={(e) => setPassScore(Number(e.target.value))}
                  placeholder="80"
                  disabled={busy || deleted}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 rounded-xl bg-muted/40 p-3 border border-muted">
              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  disabled={busy || deleted}
                  className="rounded border-muted text-primary"
                />
                Published
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold">
                <input
                  type="checkbox"
                  checked={comingSoon}
                  onChange={(e) => setComingSoon(e.target.checked)}
                  disabled={busy || deleted}
                  className="rounded border-muted text-primary"
                />
                Coming Soon
              </label>
            </div>

            <div className="border-t border-muted pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-bold">Exam Questions ({questions.length})</h3>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddQuestion}
                  disabled={busy || deleted}
                  className="text-xs"
                >
                  ＋ Add Question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="rounded-2xl border border-muted bg-card p-4 space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-muted pb-2">
                      <span className="text-[12px] font-bold text-primary">Question #{qIdx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs text-destructive hover:underline"
                        disabled={busy || deleted}
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11.5px] font-semibold block mb-1">Section Category</label>
                        <Select
                          value={q.categoryId}
                          onChange={(e) =>
                            handleQuestionChange(qIdx, 'categoryId', Number(e.target.value))
                          }
                          disabled={busy || deleted}
                        >
                          {CATEGORY_OPTIONS.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.label}
                            </option>
                          ))}
                        </Select>
                      </div>

                      <div>
                        <label className="text-[11.5px] font-semibold block mb-1">Mondai Title</label>
                        <Input
                          value={q.mondaiTitle || ''}
                          onChange={(e) => handleQuestionChange(qIdx, 'mondaiTitle', e.target.value)}
                          placeholder="もんだい１ ・ Vocab"
                          disabled={busy || deleted}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold block mb-1">Question Prompt *</label>
                      <Input
                        value={q.prompt}
                        onChange={(e) => handleQuestionChange(qIdx, 'prompt', e.target.value)}
                        placeholder="「出ます」の かんじの よみかたは どれですか。"
                        disabled={busy || deleted}
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold block mb-1">Passage / Reading Script (Optional)</label>
                      <textarea
                        value={q.passage || ''}
                        onChange={(e) => handleQuestionChange(qIdx, 'passage', e.target.value)}
                        placeholder="Reading passage or listening transcript..."
                        rows={2}
                        className="w-full rounded-xl border border-input bg-background p-2 text-xs"
                        disabled={busy || deleted}
                      />
                    </div>

                    <div>
                      <label className="text-[11.5px] font-semibold block mb-2">Multiple Choice Options (Select 1 correct)</label>
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.map((c, cIdx) => (
                          <div
                            key={cIdx}
                            className={cn(
                              'flex items-center gap-2 rounded-xl border p-2 text-xs',
                              c.correct ? 'border-emerald-500 bg-emerald-50/50' : 'border-muted',
                            )}
                          >
                            <input
                              type="radio"
                              name={`q_${qIdx}_correct`}
                              checked={c.correct}
                              onChange={() => handleChoiceCorrect(qIdx, cIdx)}
                              disabled={busy || deleted}
                              className="accent-emerald-600 cursor-pointer"
                            />
                            <Input
                              value={c.content}
                              onChange={(e) => handleChoiceChange(qIdx, cIdx, e.target.value)}
                              placeholder={`Option ${cIdx + 1}`}
                              className="h-7 text-xs flex-1"
                              disabled={busy || deleted}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-[10px] border-t border-muted px-[22px] py-[16px]">
            <Button type="button" variant="ghost" className="flex-1" disabled={busy} onClick={onClose}>
              Cancel
            </Button>

            {mode === 'edit' && deleted && onRestore ? (
              <Button type="button" className="flex-1" disabled={busy} onClick={onRestore}>
                {busy ? 'Working…' : 'Restore Exam'}
              </Button>
            ) : null}

            {mode === 'edit' && !deleted && onDelete ? (
              <Button
                type="button"
                variant="dangerOutline"
                className="flex-1"
                disabled={busy}
                onClick={onDelete}
              >
                Disable
              </Button>
            ) : null}

            {!deleted ? (
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Exam Paper'}
              </Button>
            ) : null}
          </div>
        </form>
      </aside>
    </>
  )
}
