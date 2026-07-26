import { Field, FieldRow } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KANJI_DETAIL } from '@/features/kana/kana.mock'

export function KanjiDetail() {
  return (
    <div>
      <div className="mb-[10px] text-[11px] font-bold uppercase text-subtle">{KANJI_DETAIL.heading}</div>
      <div className="grid grid-cols-[120px_1fr] gap-[16px]">
        <div className="flex flex-col items-center justify-center rounded-xl bg-muted p-[10px]">
          <div className="text-[52px] leading-none">{KANJI_DETAIL.char}</div>
          <div className="mt-[6px] text-[10px] text-muted-foreground">stroke guide</div>
        </div>
        <div>
          <FieldRow>
            <Field label="On'yomi">
              <Input defaultValue={KANJI_DETAIL.on} />
            </Field>
            <Field label="Kun'yomi">
              <Input defaultValue={KANJI_DETAIL.kun} />
            </Field>
          </FieldRow>
          <FieldRow>
            <Field label="Meaning (mm)">
              <Input defaultValue={KANJI_DETAIL.mm} />
            </Field>
            <Field label="Meaning (en)">
              <Input defaultValue={KANJI_DETAIL.en} />
            </Field>
          </FieldRow>
          <div className="flex gap-[8px]">
            <Button variant="ghost">✎ Draw stroke order</Button>
            <Button variant="ghost">🎤 Upload audio</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
