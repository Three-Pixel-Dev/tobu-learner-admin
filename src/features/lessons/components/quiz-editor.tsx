import { Choice } from '@/components/common/choice'
import { Field } from '@/components/common/field'
import { ItemCard, ItemHead } from '@/components/common/item-card'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { QUIZ_ITEMS } from '@/features/lessons/lessons.mock'

export function QuizEditor() {
  return (
    <div>
      {QUIZ_ITEMS.map((item) => (
        <ItemCard key={item.id}>
          <ItemHead label={item.label}>
            <button type="button" className="cursor-pointer text-destructive">
              ✕
            </button>
          </ItemHead>
          <Field label="Sentence (use ＿＿ for blank)" className="mb-[10px]">
            <Input defaultValue={item.sentence} />
          </Field>
          <div className="grid grid-cols-2 gap-[10px]">
            {item.choices.map((choice, index) => (
              <Choice key={index} value={choice.value} correct={choice.correct} />
            ))}
          </div>
        </ItemCard>
      ))}
      <DashedButton>＋ Add quiz question</DashedButton>
    </div>
  )
}
