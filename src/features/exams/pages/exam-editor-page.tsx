import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { ExamBatchUploadModal } from '@/features/exams/components/exam-batch-upload-modal'
import { ExamAudioZipUploadModal } from '@/features/exams/components/exam-audio-zip-upload-modal'
import {
  EXAM_SECTION_LABEL,
  ExamQuestionEditor,
  type ExamQuestionDraft,
} from '@/features/exams/components/exam-question-editor'
import { useExamDetail, useUpdateExam } from '@/features/exams/exam.query'
import type { ExamSectionCode } from '@/shared/services/exam.service'

const SECTIONS: ExamSectionCode[] = ['VOCAB', 'GRAMMAR', 'READING', 'LISTENING']

function draftKey(prefix: string, id: number | null | undefined, index: number) {
  return id != null ? `${prefix}-${id}` : `${prefix}-new-${index}`
}

function normalizeSection(code?: string | null): ExamSectionCode {
  const upper = (code || '').toUpperCase()
  if (upper === 'GRAMMAR') return 'GRAMMAR'
  if (upper === 'READING') return 'READING'
  if (upper === 'LISTENING') return 'LISTENING'
  return 'VOCAB'
}

function emptyChoices(keyPrefix: string) {
  return [
    { key: `${keyPrefix}-c0`, content: '', correct: true },
    { key: `${keyPrefix}-c1`, content: '', correct: false },
    { key: `${keyPrefix}-c2`, content: '', correct: false },
    { key: `${keyPrefix}-c3`, content: '', correct: false },
  ]
}

function isQuestionReady(q: ExamQuestionDraft) {
  if (!q.prompt.trim()) return false
  if (q.categoryCode === 'VOCAB' || q.categoryCode === 'GRAMMAR') {
    return q.sentenceStructure.trim().length > 0
  }
  if (q.categoryCode === 'READING') {
    return q.passage.trim().length > 0
  }
  if (q.categoryCode === 'LISTENING') {
    return q.transcript.trim().length > 0 || q.audioUrl.trim().length > 0
  }
  return true
}

export function ExamEditorPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const detailQuery = useExamDetail(Number.isFinite(id) && id > 0 ? id : undefined)
  const updateMutation = useUpdateExam()

  const [tab, setTab] = useState<ExamSectionCode>('VOCAB')
  const [title, setTitle] = useState('')
  const [titleJp, setTitleJp] = useState('')
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(300)
  const [passScore, setPassScore] = useState(80)
  const [totalScore, setTotalScore] = useState(180)
  const [published, setPublished] = useState(true)
  const [comingSoon, setComingSoon] = useState(false)
  const [questions, setQuestions] = useState<ExamQuestionDraft[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [hydratedKey, setHydratedKey] = useState<string | null>(null)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [audioZipModalOpen, setAudioZipModalOpen] = useState(false)

  const exam = detailQuery.data
  const examHydrateKey = exam
    ? `${exam.id}:${exam.updatedAt}:${exam.questions?.length ?? 0}:${exam.questions?.map((q) => `${q.id}:${q.audioUrl ?? ''}`).join(',') ?? ''}`
    : null

  useEffect(() => {
    if (!exam || !examHydrateKey || hydratedKey === examHydrateKey) return
    setTitle(exam.title || '')
    setTitleJp(exam.titleJp || '')
    setTimeLimitSeconds(exam.timeLimitSeconds || 300)
    setPassScore(exam.passScore || 80)
    setTotalScore(exam.totalScore || 180)
    setPublished(Boolean(exam.published))
    setComingSoon(Boolean(exam.comingSoon))
    setQuestions(
      (exam.questions || []).map((q, index) => {
        const key = draftKey('q', q.id, index)
        const choices =
          q.choices?.length > 0
            ? q.choices.map((c, ci) => ({
                key: draftKey('c', c.id, ci),
                content: c.content ?? '',
                correct: Boolean(c.correct),
              }))
            : emptyChoices(key)
        return {
          key,
          externalCode: q.externalCode ?? null,
          categoryCode: normalizeSection(q.categoryCode),
          mondaiTitle: q.mondaiTitle ?? '',
          prompt: q.prompt ?? '',
          sentenceStructure: q.sentenceStructure ?? '',
          passage: q.passage ?? '',
          audioUrl: q.audioUrl ?? '',
          audioFilename: q.audioFilename ?? null,
          transcript: q.transcript ?? '',
          furigana: q.furigana ?? '',
          transMm: q.transMm ?? '',
          transEn: q.transEn ?? '',
          explainMm: q.explainMm ?? '',
          explainEn: q.explainEn ?? '',
          choices,
        }
      }),
    )
    setHydratedKey(examHydrateKey)
    const firstWithQuestions = SECTIONS.find((code) =>
      (exam.questions || []).some((q) => normalizeSection(q.categoryCode) === code),
    )
    if (firstWithQuestions) setTab(firstWithQuestions)
  }, [exam, examHydrateKey, hydratedKey])

  const bySection = useMemo(() => {
    const map: Record<ExamSectionCode, ExamQuestionDraft[]> = {
      VOCAB: [],
      GRAMMAR: [],
      READING: [],
      LISTENING: [],
    }
    for (const q of questions) {
      map[q.categoryCode].push(q)
    }
    return map
  }, [questions])

  const tabs = useMemo(
    () =>
      SECTIONS.map((code) => ({
        value: code,
        label: `${EXAM_SECTION_LABEL[code]} (${bySection[code].length})`,
      })),
    [bySection],
  )

  if (detailQuery.isLoading) {
    return <div className="py-[40px] text-center text-[13px] text-muted-foreground">Loading…</div>
  }
  if (detailQuery.isError || !exam) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive">
        Could not load exam.{' '}
        <Link to="/exams" className="text-primary-dark">
          Back
        </Link>
      </div>
    )
  }

  const busy = updateMutation.isPending

  const setSectionQuestions = (sectionCode: ExamSectionCode, sectionItems: ExamQuestionDraft[]) => {
    const tagged = sectionItems.map((item) => ({ ...item, categoryCode: sectionCode }))
    setQuestions((prev) => [...prev.filter((q) => q.categoryCode !== sectionCode), ...tagged])
  }

  const saveAll = async () => {
    if (!title.trim()) {
      setToast('Exam title is required.')
      return
    }
    try {
      await updateMutation.mutateAsync({
        id: exam.id,
        payload: {
          jlptLevelId: exam.jlptLevelId,
          title: title.trim(),
          titleJp: titleJp.trim() || undefined,
          timeLimitSeconds,
          passScore,
          totalScore,
          published,
          comingSoon,
          questions: questions.filter(isQuestionReady).map((q, index) => ({
            externalCode: q.externalCode?.trim() || undefined,
            categoryCode: q.categoryCode,
            mondaiTitle: q.mondaiTitle.trim() || undefined,
            prompt: q.prompt.trim(),
            sentenceStructure:
              q.categoryCode === 'VOCAB' || q.categoryCode === 'GRAMMAR'
                ? q.sentenceStructure.trim() || undefined
                : undefined,
            passage: q.categoryCode === 'READING' ? q.passage.trim() || undefined : undefined,
            audioUrl: q.categoryCode === 'LISTENING' ? q.audioUrl.trim() || undefined : undefined,
            audioFilename: q.audioFilename?.trim() || undefined,
            transcript: q.categoryCode === 'LISTENING' ? q.transcript.trim() || undefined : undefined,
            furigana: q.furigana.trim() || undefined,
            transMm: q.transMm.trim() || undefined,
            transEn: q.transEn.trim() || undefined,
            explainMm: q.explainMm.trim() || undefined,
            explainEn: q.explainEn.trim() || undefined,
            sortOrder: index + 1,
            choices: q.choices
              .filter((c) => c.content.trim().length > 0)
              .map((c, ci) => ({
                content: c.content.trim(),
                correct: c.correct,
                sortOrder: ci + 1,
              })),
          })),
        },
      })
      setToast('Exam saved.')
      setHydratedKey(null)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not save exam.'))
    }
  }

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        <span className="text-[12.5px] text-subtle">
          Content / <Link to="/exams">Exams</Link> / {exam.jlptLevelCode} /{' '}
          <strong className="text-foreground">{title || exam.title}</strong>
        </span>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Button type="button" variant="ghost" onClick={() => setUploadModalOpen(true)}>
            Batch Upload
          </Button>
          <Button type="button" variant="ghost" onClick={() => setAudioZipModalOpen(true)}>
            Upload audio ZIP
          </Button>
          <Button type="button" variant="ghost" onClick={() => navigate('/exams')}>
            ← Back
          </Button>
          <Button type="button" disabled={busy} onClick={() => void saveAll()}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <PageHeader
        title="Exam editor"
        subtitle={`${title || exam.title} ・ ${exam.jlptLevelCode} ・ ${
          published ? 'Published' : 'Draft'
        }`}
      />

      <Panel className="mb-[16px] space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="exam-title">
              Exam title
            </label>
            <Input id="exam-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="exam-title-jp">
              Title (JP)
            </label>
            <Input
              id="exam-title-jp"
              value={titleJp}
              onChange={(e) => setTitleJp(e.target.value)}
              placeholder="だい１かい"
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-[6px] block text-[12.5px] font-semibold">Time limit (sec)</label>
            <Input
              type="number"
              value={timeLimitSeconds}
              onChange={(e) => setTimeLimitSeconds(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-[6px] block text-[12.5px] font-semibold">Pass score</label>
            <Input
              type="number"
              value={passScore}
              onChange={(e) => setPassScore(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="mb-[6px] block text-[12.5px] font-semibold">Total score</label>
            <Input
              type="number"
              value={totalScore}
              onChange={(e) => setTotalScore(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 rounded-xl border border-muted bg-muted/40 p-3">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-muted text-primary"
            />
            Published
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-[13px] font-semibold">
            <input
              type="checkbox"
              checked={comingSoon}
              onChange={(e) => setComingSoon(e.target.checked)}
              className="rounded border-muted text-primary"
            />
            Coming soon
          </label>
        </div>
      </Panel>

      <Panel>
        <Tabs
          items={tabs}
          value={tab}
          onValueChange={(v) => setTab(v as ExamSectionCode)}
          className="mb-[16px]"
        />
        <ExamQuestionEditor
          section={tab}
          items={bySection[tab]}
          onChange={(items) => setSectionQuestions(tab, items)}
        />
      </Panel>

      <ExamBatchUploadModal
        examId={id}
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={() => {
          setUploadModalOpen(false)
          setHydratedKey(null)
          setToast('Questions uploaded successfully.')
        }}
        onError={(msg) => setToast(msg)}
      />

      <ExamAudioZipUploadModal
        examId={id}
        open={audioZipModalOpen}
        onClose={() => setAudioZipModalOpen(false)}
        onSuccess={(result) => {
          setAudioZipModalOpen(false)
          setHydratedKey(null)
          const parts = [`Uploaded ${result.uploaded}/${result.matched} matched`]
          if (result.unmatchedFiles.length) {
            parts.push(`unmatched files: ${result.unmatchedFiles.slice(0, 5).join(', ')}`)
          }
          if (result.errors.length) {
            parts.push(`errors: ${result.errors.slice(0, 3).join('; ')}`)
          }
          setToast(parts.join(' · '))
        }}
        onError={(msg) => setToast(msg)}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
