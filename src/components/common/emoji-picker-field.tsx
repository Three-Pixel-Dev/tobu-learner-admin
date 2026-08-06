import { useEffect, useRef, useState } from 'react'
import type { EmojiClickData } from 'emoji-picker-react'
import EmojiPicker from 'emoji-picker-react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'

import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { cn } from '@/util/cn'

interface EmojiPickerFieldProps<T extends FieldValues> {
  control: Control<T>
  name: FieldPath<T>
  label?: string
}

export function EmojiPickerField<T extends FieldValues>({
  control,
  name,
  label = 'Icon',
}: EmojiPickerFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field label={label}>
          <EmojiPickerInput
            value={typeof field.value === 'string' ? field.value : ''}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        </Field>
      )}
    />
  )
}

interface EmojiPickerInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
}

function EmojiPickerInput({ value, onChange, error }: EmojiPickerInputProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const onEmojiClick = (data: EmojiClickData) => {
    onChange(data.emoji)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-[10px]">
        <div
          className={cn(
            'flex h-[44px] w-[44px] items-center justify-center rounded-[12px] border border-muted bg-surface text-[22px]',
            error && 'border-destructive',
          )}
          aria-hidden
        >
          {value || '🏅'}
        </div>
        <Button type="button" variant="ghost" onClick={() => setOpen((prev) => !prev)}>
          {value ? 'Change emoji' : 'Pick emoji'}
        </Button>
        {value ? (
          <Button type="button" variant="ghost" onClick={() => onChange('')}>
            Clear
          </Button>
        ) : null}
      </div>
      {error ? (
        <p className="mt-[4px] text-[11px] font-semibold text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {open ? (
        <div className="absolute left-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-[14px] border border-muted shadow-[0_8px_24px_rgba(15,23,42,0.12)]">
          <EmojiPicker onEmojiClick={onEmojiClick} width={320} height={360} />
        </div>
      ) : null}
    </div>
  )
}
