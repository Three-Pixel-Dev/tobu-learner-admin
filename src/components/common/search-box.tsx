import type { ChangeEventHandler } from 'react'

import { cn } from '@/util/cn'

interface SearchBoxProps {
  placeholder: string
  value?: string
  onChange?: ChangeEventHandler<HTMLInputElement>
  className?: string
  'aria-label'?: string
}

export function SearchBox({
  placeholder,
  value,
  onChange,
  className,
  'aria-label': ariaLabel = 'Search',
}: SearchBoxProps) {
  return (
    <label
      className={cn(
        'flex w-[230px] items-center gap-[8px] rounded-xl border-[1.5px] border-border bg-card px-[14px] py-[9px] text-[13px] text-subtle',
        className,
      )}
    >
      <span aria-hidden>🔍</span>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className="w-full border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-subtle"
      />
    </label>
  )
}
