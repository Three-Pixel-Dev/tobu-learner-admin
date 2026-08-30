import { Field, FieldRow } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { AudioSourceSelector } from '@/components/audio/audio-source-selector'
import { type AudioSourceType } from '@/shared/services/lesson.service'

export interface VocabDraft {
  key: string
  word: string
  reading: string
  mmMeaning: string
  enMeaning: string
  audioUrl: string | null
  audioFilename: string | null
  aiAudioUrl?: string | null
  aiAudioFilename?: string | null
  audioSourceType?: AudioSourceType | null
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
          <FieldRow>
            <Field label="Word (kanji/kana)">
              <Input value={item.word} onChange={(e) => update(index, { word: e.target.value })} />
            </Field>
            <Field label="Reading / Pronunciation (e.g. りょこう)">
              <Input
                value={item.reading}
                placeholder="りょこう"
                onChange={(e) => update(index, { reading: e.target.value })}
              />
            </Field>
          </FieldRow>
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
          <FieldRow className="mt-[10px]">
            <Field label="Audio Filename (Excel stem)">
              <Input
                value={item.audioFilename ?? ''}
                placeholder="n5_l01_v01.mp3"
                onChange={(e) => update(index, { audioFilename: e.target.value || null })}
              />
            </Field>
          </FieldRow>
          <div className="mt-[10px]">
            <AudioSourceSelector
              value={item.audioSourceType}
              onChange={(audioSourceType) => update(index, { audioSourceType })}
              transcript={item.reading || item.word}
              audioUrl={item.audioUrl}
              aiAudioUrl={item.aiAudioUrl}
              onAiAudioGenerated={({ url, filename }) =>
                update(index, { aiAudioUrl: url, aiAudioFilename: filename, audioSourceType: 'AI_GENERATED' })
              }
            />
          </div>
        </ItemCard>
      ))}
      <DashedButton
        type="button"
        onClick={() =>
          onChange([
            ...items,
            { key: newKey(), word: '', reading: '', mmMeaning: '', enMeaning: '', audioUrl: null, audioFilename: null },
          ])
        }
      >
        ＋ Add vocab item
      </DashedButton>
    </div>
  )
}
