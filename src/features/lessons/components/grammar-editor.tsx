import { Field, FieldRow } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { GRAMMAR_ITEMS } from '@/features/lessons/lessons.mock'

const LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export function GrammarEditor() {
  return (
    <div>
      {GRAMMAR_ITEMS.map((item, index) => (
        <ItemCard key={item.id}>
          <ItemHead label={`Grammar item ${index + 1}`}>
            <button type="button" className="cursor-pointer text-destructive">
              ✕
            </button>
          </ItemHead>
          <FieldRow>
            <Field label="Pattern">
              <Input defaultValue={item.pattern} />
            </Field>
            <Field label="JLPT level">
              <Select defaultValue={item.level}>
                {LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
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
      <DashedButton>＋ Add grammar item</DashedButton>
    </div>
  )
}
