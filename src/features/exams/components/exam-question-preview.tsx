import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Pill } from '@/components/ui/pill'
import { EXAM_SECTION_LABEL } from '@/features/exams/components/exam-question-editor'
import {
  type ExamQuestionDto,
  type ExamSectionCode,
} from '@/shared/services/exam.service'
import { speakJapanese } from '@/shared/lib/speak-japanese'
import { resolveMediaUrl } from '@/shared/services/media.service'
import { cn } from '@/util/cn'

function sectionCode(q: ExamQuestionDto): ExamSectionCode {
  const upper = (q.categoryCode || '').toUpperCase()
  if (upper === 'GRAMMAR') return 'GRAMMAR'
  if (upper === 'READING') return 'READING'
  if (upper === 'LISTENING') return 'LISTENING'
  return 'VOCAB'
}

/** Renders `きょうは __少ない__ ですね。` with the marked span bold + underlined. */
function renderMarkedText(text: string): ReactNode {
  const parts = text.split(/(__[^_]+__)/g)
  return parts.map((part, i) => {
    const match = part.match(/^__(.+)__$/)
    if (match) {
      return (
        <strong key={i} className="font-extrabold underline decoration-2 underline-offset-2">
          {match[1]}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

function InstructionBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-[#86EFAC] bg-[#F0FDF4]/60 px-3 py-2.5 text-[13px] leading-relaxed text-foreground">
      {children}
    </div>
  )
}

function ContentBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-muted bg-card px-3 py-2.5 text-[13px] leading-relaxed text-foreground',
        className,
      )}
    >
      {children}
    </div>
  )
}

function ListeningPlayer({ audioUrl }: { audioUrl: string }) {
  const url = resolveMediaUrl(audioUrl)
  if (!url) return null

  return (
    <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
      <audio controls preload="metadata" className="w-full" src={url}>
        Your browser does not support audio playback.
      </audio>
    </div>
  )
}

function ListeningTtsPreview({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
      <Button
        type="button"
        variant="ghost"
        className="!px-[12px] !py-[6px] text-[12px]"
        onClick={() => speakJapanese(text)}
      >
        ▶ Play TTS
      </Button>
    </div>
  )
}

export function ExamQuestionPreview({
  question,
  index,
}: {
  question: ExamQuestionDto
  index: number
}) {
  const section = sectionCode(question)
  const label = EXAM_SECTION_LABEL[section]
  const isStem = section === 'VOCAB' || section === 'GRAMMAR'
  const isReading = section === 'READING'
  const isListening = section === 'LISTENING'

  return (
    <div className="space-y-3 rounded-2xl border border-muted bg-card p-4">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="font-bold text-primary">Question #{index + 1}</span>
        <Pill variant="vocab">{label}</Pill>
      </div>

      {question.mondaiTitle ? (
        <span className="inline-flex rounded-full bg-[#DBEAFE] px-2.5 py-1 text-[11px] font-bold text-[#1D4ED8]">
          {question.mondaiTitle}
        </span>
      ) : null}

      {question.prompt ? (
        isStem || isListening ? (
          <InstructionBox>{question.prompt}</InstructionBox>
        ) : (
          <ContentBox className="border-[#86EFAC] bg-[#F0FDF4]/40 font-semibold">
            {question.prompt}
          </ContentBox>
        )
      ) : null}

      {isStem && question.sentenceStructure ? (
        <ContentBox className="text-[14px]">{renderMarkedText(question.sentenceStructure)}</ContentBox>
      ) : null}

      {isReading && question.passage ? (
        <ContentBox className="whitespace-pre-wrap leading-relaxed">{question.passage}</ContentBox>
      ) : null}

      {isListening ? (
        question.audioUrl ? (
          <ListeningPlayer audioUrl={question.audioUrl} />
        ) : question.transcript?.trim() ? (
          <ListeningTtsPreview text={question.transcript} />
        ) : (
          <div className="rounded-2xl border border-dashed border-muted px-4 py-6 text-center text-[12px] text-muted-foreground">
            No audio or listening text for this question.
          </div>
        )
      ) : null}

      <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-2">
        {(question.choices ?? []).map((c, cIdx) => (
          <div
            key={c.id ?? cIdx}
            className={cn(
              'flex items-center gap-2 rounded-xl border p-2.5 text-xs',
              c.correct
                ? 'border-emerald-500 bg-emerald-50/70 font-bold text-emerald-900'
                : 'border-muted text-muted-foreground',
            )}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold">
              {cIdx + 1}
            </span>
            <span>{c.content}</span>
            {c.correct ? <span className="ml-auto font-extrabold text-emerald-600">✓</span> : null}
          </div>
        ))}
      </div>
    </div>
  )
}
