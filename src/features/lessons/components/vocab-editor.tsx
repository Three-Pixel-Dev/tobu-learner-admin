import { Field, FieldRow } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { VOCAB_ITEMS } from '@/features/lessons/lessons.mock'

export function VocabEditor() {
  return (
    <div>
      {VOCAB_ITEMS.map((item, index) => (
        <ItemCard key={item.id}>
          <ItemHead label={`Vocab item ${index + 1}`}>
            <button type="button" className="cursor-pointer text-destructive">
              ✕
            </button>
          </ItemHead>
          <FieldRow>
            <Field label="Word (kanji/kana)">
              <Input defaultValue={item.word} />
            </Field>
            <Field label="Reading">
              <Input defaultValue={item.reading} />
            </Field>
          </FieldRow>
          <FieldRow className="mb-0">
            <Field label="Myanmar meaning">
              <Input defaultValue={item.mm} />
            </Field>
            <Field label="English meaning">
              <Input defaultValue={item.en} />
            </Field>
          </FieldRow>
        </ItemCard>
      ))}
      <DashedButton>＋ Add vocab item</DashedButton>
    </div>
  )
}
