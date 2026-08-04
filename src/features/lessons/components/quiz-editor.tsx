import { Choice } from '@/components/common/choice'
import { Field } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export interface QuizDraft {
  key: string
  mondai: string
  prompt: string
  choices: Array<{ key: string; choiceText: string; correct: boolean }>
  explainMm: string
  explainEn: string
}

interface QuizEditorProps {
  items: QuizDraft[]
  onChange: (items: QuizDraft[]) => void
}

function newKey() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function QuizEditor({ items, onChange }: QuizEditorProps) {
  const update = (index: number, patch: Partial<QuizDraft>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  const updateChoice = (
    qIndex: number,
    cIndex: number,
    patch: Partial<QuizDraft['choices'][number]>,
  ) => {
    onChange(
      items.map((item, i) => {
        if (i !== qIndex) return item
        const choices = item.choices.map((c, ci) => {
          if (ci !== cIndex) {
            // radio: only one correct
            if (patch.correct === true) return { ...c, correct: false }
            return c
          }
          return { ...c, ...patch }
        })
        return { ...item, choices }
      }),
    )
  }

  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={item.key}>
          <ItemHead label={`Quiz question ${index + 1}`}>
            <button
              type="button"
              className="cursor-pointer text-destructive"
              aria-label={`Remove quiz ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ✕
            </button>
          </ItemHead>
          <Field label="Group label (mondai)" className="mb-[10px]">
            <Input
              value={item.mondai}
              placeholder="もんだい1"
              onChange={(e) => update(index, { mondai: e.target.value })}
            />
          </Field>
          <Field label="Sentence (use ＿＿ for blank)" className="mb-[10px]">
            <Input
              value={item.prompt}
              placeholder="きょうは くるまが ＿＿ ですね。"
              onChange={(e) => update(index, { prompt: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-[10px]">
            {item.choices.map((choice, cIndex) => (
              <Choice
                key={choice.key}
                value={choice.choiceText}
                correct={choice.correct}
                onValueChange={(choiceText) => updateChoice(index, cIndex, { choiceText })}
                onCorrectChange={() => updateChoice(index, cIndex, { correct: true })}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-[10px] cursor-pointer text-[12px] font-semibold text-muted-foreground hover:text-foreground"
            onClick={() =>
              update(index, {
                choices: [
                  ...item.choices,
                  { key: newKey(), choiceText: '', correct: item.choices.length === 0 },
                ],
              })
            }
          >
            ＋ Add choice
          </button>
          <div className="mt-[12px] grid grid-cols-1 gap-[10px] md:grid-cols-2">
            <Field label="Explain (Myanmar)">
              <Textarea
                value={item.explainMm}
                rows={3}
                placeholder="မှန်တဲ့အဖြေကို ရှင်းပြပါ…"
                onChange={(e) => update(index, { explainMm: e.target.value })}
              />
            </Field>
            <Field label="Explain (English)">
              <Textarea
                value={item.explainEn}
                rows={3}
                placeholder="Explain the correct answer…"
                onChange={(e) => update(index, { explainEn: e.target.value })}
              />
            </Field>
          </div>
        </ItemCard>
      ))}
      <DashedButton
        type="button"
        onClick={() =>
          onChange([
            ...items,
            {
              key: newKey(),
              mondai: '',
              prompt: '',
              choices: [
                { key: newKey(), choiceText: '', correct: true },
                { key: newKey(), choiceText: '', correct: false },
              ],
              explainMm: '',
              explainEn: '',
            },
          ])
        }
      >
        ＋ Add quiz question
      </DashedButton>
    </div>
  )
}
