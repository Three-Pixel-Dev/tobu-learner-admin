import { Choice } from '@/components/common/choice'
import { Field } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { AudioSourceField } from '@/features/lessons/components/audio-source-field'
import type { ExamSectionCode } from '@/shared/services/exam.service'

export interface ExamQuestionDraft {
  key: string
  /** Stable Excel / ZIP fallback key — preserved on save, not shown in UI. */
  externalCode?: string | null
  categoryCode: ExamSectionCode
  /** Pill label, e.g. もんだい 1 ・ Kanji reading */
  mondaiTitle: string
  /** Instruction / question text (green/white box above the stem or passage). */
  prompt: string
  /** Stem sentence with __underline__ markers (vocab / kanji reading). */
  sentenceStructure: string
  /** Reading passage only. */
  passage: string
  /** Listening audio URL. */
  audioUrl: string
  /** Normalized stem for ZIP matching — preserved on save. */
  audioFilename?: string | null
  /** Spoken dialogue for Browser TTS (and mobile fallback). */
  transcript: string
  furigana: string
  transMm: string
  transEn: string
  explainMm: string
  explainEn: string
  choices: Array<{ key: string; content: string; correct: boolean }>
}

interface ExamQuestionEditorProps {
  section: ExamSectionCode
  items: ExamQuestionDraft[]
  onChange: (items: ExamQuestionDraft[]) => void
}

function newKey() {
  return `eq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export const EXAM_SECTION_LABEL: Record<ExamSectionCode, string> = {
  VOCAB: 'Orthography',
  GRAMMAR: 'Kanji reading',
  READING: 'Reading',
  LISTENING: 'Listening',
}

const MONDAI_PLACEHOLDER: Record<ExamSectionCode, string> = {
  VOCAB: 'もんだい 1 ・ Orthography',
  GRAMMAR: 'もんだい 1 ・ Kanji reading',
  READING: 'どっかい ・ Short passage',
  LISTENING: 'ちょうかい ・ Listening',
}

function emptyChoices() {
  return [
    { key: newKey(), content: '', correct: true },
    { key: newKey(), content: '', correct: false },
    { key: newKey(), content: '', correct: false },
    { key: newKey(), content: '', correct: false },
  ]
}

export function ExamQuestionEditor({ section, items, onChange }: ExamQuestionEditorProps) {
  const update = (index: number, patch: Partial<ExamQuestionDraft>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const updateChoice = (
    qIndex: number,
    cIndex: number,
    patch: Partial<ExamQuestionDraft['choices'][number]>,
  ) => {
    onChange(
      items.map((item, i) => {
        if (i !== qIndex) return item
        const choices = item.choices.map((c, ci) => {
          if (ci !== cIndex) {
            if (patch.correct === true) return { ...c, correct: false }
            return c
          }
          return { ...c, ...patch }
        })
        return { ...item, choices }
      }),
    )
  }

  const isStemSection = section === 'VOCAB' || section === 'GRAMMAR'
  const isReading = section === 'READING'
  const isListening = section === 'LISTENING'

  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={item.key}>
          <ItemHead label={`${EXAM_SECTION_LABEL[section]} question ${index + 1}`}>
            <button
              type="button"
              className="cursor-pointer text-destructive"
              aria-label={`Remove question ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ✕
            </button>
          </ItemHead>

          <Field label="Section label (pill)" className="mb-[10px]">
            <Input
              value={item.mondaiTitle}
              placeholder={MONDAI_PLACEHOLDER[section]}
              onChange={(e) => update(index, { mondaiTitle: e.target.value })}
            />
          </Field>

          <Field
            label={isStemSection ? 'Instruction' : 'Question'}
            className="mb-[10px]"
          >
            <Input
              value={item.prompt}
              placeholder={
                isStemSection
                  ? '___ の ことばは ひらがなで どう かきますか。'
                  : isListening
                    ? 'きいて ください。あしたの てんきは どうですか。'
                    : 'この人は なんじに うちを でますか。'
              }
              onChange={(e) => update(index, { prompt: e.target.value })}
            />
          </Field>

          {isStemSection ? (
            <Field
              label="Sentence (wrap target in __double underscores__)"
              className="mb-[10px]"
            >
              <textarea
                value={item.sentenceStructure}
                rows={2}
                placeholder="きょうは くるまが __少ない__ ですね。"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { sentenceStructure: e.target.value })}
              />
              <p className="mt-1 text-[11px] text-muted-foreground">
                Mobile shows text between __ __ as bold + underlined.
              </p>
            </Field>
          ) : null}

          {isReading ? (
            <Field label="Reading passage" className="mb-[10px]">
              <textarea
                value={item.passage}
                rows={3}
                placeholder="わたしは まいあさ 7じに おきます。…"
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { passage: e.target.value })}
              />
            </Field>
          ) : null}

          {isListening ? (
            <AudioSourceField
              className="mb-[10px]"
              speakText={item.transcript}
              onSpeakTextChange={(transcript) => update(index, { transcript })}
              speakTextLabel="Listening text"
              speakTextPlaceholder="きいて ください。あしたは あめが ふります。…"
              audioUrl={item.audioUrl || null}
              onChange={(audioUrl) => update(index, { audioUrl: audioUrl ?? '' })}
            />
          ) : null}

          <label className="mb-[8px] block text-[12.5px] font-semibold">
            Choices (select 1 correct)
          </label>
          <div className="grid grid-cols-2 gap-[10px]">
            {item.choices.map((choice, cIndex) => (
              <Choice
                key={choice.key}
                value={choice.content}
                correct={choice.correct}
                onValueChange={(content) => updateChoice(index, cIndex, { content })}
                onCorrectChange={() => updateChoice(index, cIndex, { correct: true })}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Field label="Translation (MM)">
              <textarea
                value={item.transMm}
                rows={2}
                placeholder="Myanmar translation of the question/passage..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { transMm: e.target.value })}
              />
            </Field>
            <Field label="Translation (EN)">
              <textarea
                value={item.transEn}
                rows={2}
                placeholder="English translation..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { transEn: e.target.value })}
              />
            </Field>
            <Field label="Explanation (MM)">
              <textarea
                value={item.explainMm}
                rows={2}
                placeholder="Myanmar explanation of the answer..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { explainMm: e.target.value })}
              />
            </Field>
            <Field label="Explanation (EN)">
              <textarea
                value={item.explainEn}
                rows={2}
                placeholder="English explanation..."
                className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
                onChange={(e) => update(index, { explainEn: e.target.value })}
              />
            </Field>
            <Field label="Furigana (Optional)">
              <Input
                value={item.furigana}
                placeholder="Furigana hint if applicable..."
                onChange={(e) => update(index, { furigana: e.target.value })}
              />
            </Field>
          </div>

          <button
            type="button"
            className="mt-[10px] cursor-pointer text-[12px] font-semibold text-muted-foreground hover:text-foreground"
            onClick={() =>
              update(index, {
                choices: [
                  ...item.choices,
                  { key: newKey(), content: '', correct: item.choices.length === 0 },
                ],
              })
            }
          >
            ＋ Add choice
          </button>
        </ItemCard>
      ))}

      <DashedButton
        type="button"
        onClick={() =>
          onChange([
            ...items,
            {
              key: newKey(),
              categoryCode: section,
              mondaiTitle: '',
              prompt: '',
              sentenceStructure: '',
              passage: '',
              audioUrl: '',
              transcript: '',
              furigana: '',
              transMm: '',
              transEn: '',
              explainMm: '',
              explainEn: '',
              choices: emptyChoices(),
            },
          ])
        }
      >
        ＋ Add {EXAM_SECTION_LABEL[section].toLowerCase()} question
      </DashedButton>
    </div>
  )
}
