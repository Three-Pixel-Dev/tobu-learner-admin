import { Field, FieldRow } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { AudioSourceField } from '@/features/lessons/components/audio-source-field'

export interface VocabDraft {
  key: string
  word: string
  mmMeaning: string
  enMeaning: string
  audioUrl: string | null
}

interface VocabEditorProps {
  items: VocabDraft[]
  onChange: (items: VocabDraft[]) => void
}

function newKey() {
  return `v-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

export function VocabEditor({ items, onChange }: VocabEditorProps) {
  const update = (index: number, patch: Partial<VocabDraft>) => {
    onChange(items.map((item, i) => (i === index ? { ...item, ...patch } : item)))
  }

  return (
    <div>
      {items.map((item, index) => (
        <ItemCard key={item.key}>
          <ItemHead label={`Vocab item ${index + 1}`}>
            <button
              type="button"
              className="cursor-pointer text-destructive"
              aria-label={`Remove vocab ${index + 1}`}
              onClick={() => onChange(items.filter((_, i) => i !== index))}
            >
              ✕
            </button>
          </ItemHead>
          <Field label="Word (kanji/kana)">
            <Input value={item.word} onChange={(e) => update(index, { word: e.target.value })} />
          </Field>
          <FieldRow className="mt-[10px]">
            <Field label="Myanmar meaning">
              <Input
                value={item.mmMeaning}
                onChange={(e) => update(index, { mmMeaning: e.target.value })}
              />
            </Field>
            <Field label="English meaning">
              <Input
                value={item.enMeaning}
                onChange={(e) => update(index, { enMeaning: e.target.value })}
              />
            </Field>
          </FieldRow>
          <AudioSourceField
            className="mt-[10px]"
            speakText={item.word}
            audioUrl={item.audioUrl}
            onChange={(audioUrl) => update(index, { audioUrl })}
          />
        </ItemCard>
      ))}
      <DashedButton
        type="button"
        onClick={() =>
          onChange([
            ...items,
            { key: newKey(), word: '', mmMeaning: '', enMeaning: '', audioUrl: null },
          ])
        }
      >
        ＋ Add vocab item
      </DashedButton>
    </div>
  )
}
