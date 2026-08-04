import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { GrammarEditor, type GrammarDraft } from '@/features/lessons/components/grammar-editor'
import { QuizEditor, type QuizDraft } from '@/features/lessons/components/quiz-editor'
import { VocabEditor, type VocabDraft } from '@/features/lessons/components/vocab-editor'
import {
  useLessonDetailQuery,
  useSaveLessonContentMutation,
  useSetLessonPublishedMutation,
  useUpdateLessonMutation,
} from '@/shared/queries/lesson.query'

function draftKey(prefix: string, id: number | null | undefined, index: number) {
  return id != null ? `${prefix}-${id}` : `${prefix}-new-${index}`
}

export function LessonEditorPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const navigate = useNavigate()
  const detailQuery = useLessonDetailQuery(Number.isFinite(id) ? id : null)
  const updateMutation = useUpdateLessonMutation()
  const saveContentMutation = useSaveLessonContentMutation()
  const publishMutation = useSetLessonPublishedMutation()

  const [tab, setTab] = useState('vocab')
  const [title, setTitle] = useState('')
  const [vocabs, setVocabs] = useState<VocabDraft[]>([])
  const [grammars, setGrammars] = useState<GrammarDraft[]>([])
  const [quizzes, setQuizzes] = useState<QuizDraft[]>([])
  const [toast, setToast] = useState<string | null>(null)
  const [hydratedId, setHydratedId] = useState<number | null>(null)

  const lesson = detailQuery.data

  useEffect(() => {
    if (!lesson || hydratedId === lesson.id) return
    setTitle(lesson.title)
    setVocabs(
      lesson.vocabs.map((v, index) => ({
        key: draftKey('v', v.id, index),
        word: v.word ?? '',
        mmMeaning: v.mmMeaning ?? '',
        enMeaning: v.enMeaning ?? '',
        audioUrl: v.audioUrl ?? null,
      })),
    )
    setGrammars(
      lesson.grammars.map((g, index) => ({
        key: draftKey('g', g.id, index),
        pattern: g.pattern ?? '',
        mmDescription: g.mmDescription ?? '',
        enDescription: g.enDescription ?? '',
        examples: (g.examples ?? []).map((ex, ei) => ({
          key: draftKey('ge', ex.id, ei),
          japaneseText: ex.japaneseText ?? '',
          mmTranslation: ex.mmTranslation ?? '',
          audioUrl: ex.audioUrl ?? null,
        })),
      })),
    )
    setQuizzes(
      lesson.questions.map((q, index) => ({
        key: draftKey('q', q.id, index),
        mondai: q.mondai ?? '',
        prompt: q.prompt ?? '',
        choices: (q.choices?.length
          ? q.choices
          : [
              { id: null, choiceText: '', correct: true },
              { id: null, choiceText: '', correct: false },
            ]
        ).map((c, ci) => ({
          key: draftKey('c', c.id, ci),
          choiceText: c.choiceText ?? '',
          correct: Boolean(c.correct),
        })),
        explainMm: q.explainMm ?? '',
        explainEn: q.explainEn ?? '',
      })),
    )
    setHydratedId(lesson.id)
  }, [lesson, hydratedId])

  const tabs = useMemo(
    () => [
      { value: 'vocab', label: `Vocab (${vocabs.length})` },
      { value: 'grammar', label: `Grammar (${grammars.length})` },
      { value: 'quiz', label: `Quiz (${quizzes.length})` },
    ],
    [vocabs.length, grammars.length, quizzes.length],
  )

  if (detailQuery.isLoading) {
    return <div className="py-[40px] text-center text-[13px] text-muted-foreground">Loading…</div>
  }
  if (detailQuery.isError || !lesson) {
    return (
      <div className="py-[40px] text-center text-[13px] text-destructive">
        Could not load lesson.{' '}
        <Link to="/lessons" className="text-primary-dark">
          Back
        </Link>
      </div>
    )
  }

  const busy =
    updateMutation.isPending || saveContentMutation.isPending || publishMutation.isPending

  const saveAll = async (andPublish?: boolean) => {
    try {
      if (title.trim() && title.trim() !== lesson.title) {
        await updateMutation.mutateAsync({ id: lesson.id, payload: { title: title.trim() } })
      }
      await saveContentMutation.mutateAsync({
        id: lesson.id,
        payload: {
          vocabs: vocabs
            .filter((v) => v.word.trim())
            .map((v) => ({
              word: v.word.trim(),
              mmMeaning: v.mmMeaning.trim() || null,
              enMeaning: v.enMeaning.trim() || null,
              audioUrl: v.audioUrl,
            })),
          grammars: grammars
            .filter((g) => g.pattern.trim())
            .map((g) => ({
              pattern: g.pattern.trim(),
              mmDescription: g.mmDescription.trim() || null,
              enDescription: g.enDescription.trim() || null,
              examples: g.examples
                .filter((ex) => ex.japaneseText.trim())
                .map((ex, ei) => ({
                  japaneseText: ex.japaneseText.trim(),
                  mmTranslation: ex.mmTranslation.trim() || null,
                  audioUrl: ex.audioUrl,
                  sortOrder: ei,
                })),
            })),
          questions: quizzes
            .filter((q) => q.prompt.trim())
            .map((q, index) => ({
              questionType: 'MULTIPLE_CHOICE',
              mondai: q.mondai.trim() || null,
              prompt: q.prompt.trim(),
              choices: q.choices
                .filter((c) => c.choiceText.trim())
                .map((c) => ({
                  choiceText: c.choiceText.trim(),
                  correct: c.correct,
                })),
              explainMm: q.explainMm.trim() || null,
              explainEn: q.explainEn.trim() || null,
              sortOrder: index,
            })),
        },
      })
      if (andPublish && !lesson.published) {
        await publishMutation.mutateAsync({ id: lesson.id, published: true })
        setToast('Lesson published.')
      } else {
        setToast('Lesson saved.')
      }
      setHydratedId(null)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not save lesson.'))
    }
  }

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-[12px]">
        <span className="text-[12.5px] text-subtle">
          Content / <Link to="/lessons">Lessons</Link> / {lesson.jlptLevelCode} /{' '}
          <strong className="text-foreground">{title || lesson.title}</strong>
        </span>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Button type="button" variant="ghost" onClick={() => navigate(`/lessons/${lesson.id}`)}>
            ← Back
          </Button>
          <Button type="button" variant="ghost" disabled={busy} onClick={() => saveAll(false)}>
            {busy ? 'Saving…' : 'Save'}
          </Button>
          {!lesson.published ? (
            <Button type="button" disabled={busy} onClick={() => saveAll(true)}>
              {busy ? 'Saving…' : 'Save & publish'}
            </Button>
          ) : null}
        </div>
      </div>

      <PageHeader
        title="Lesson editor"
        subtitle={`${title || lesson.title} ・ ${lesson.jlptLevelCode} ・ ${
          lesson.published ? 'Published' : 'Draft'
        }`}
      />

      <Panel className="mb-[16px]">
        <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="editor-title">
          Lesson title
        </label>
        <Input
          id="editor-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="max-w-[480px]"
        />
      </Panel>

      <Panel>
        <Tabs items={tabs} value={tab} onValueChange={setTab} className="mb-[16px]" />
        {tab === 'vocab' ? <VocabEditor items={vocabs} onChange={setVocabs} /> : null}
        {tab === 'grammar' ? <GrammarEditor items={grammars} onChange={setGrammars} /> : null}
        {tab === 'quiz' ? <QuizEditor items={quizzes} onChange={setQuizzes} /> : null}
      </Panel>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
