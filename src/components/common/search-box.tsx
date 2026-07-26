import { cn } from '@/util/cn'

interface SearchBoxProps {
  placeholder: string
  className?: string
}

export function SearchBox({ placeholder, className }: SearchBoxProps) {
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
        className="w-full border-none bg-transparent text-[13px] text-foreground outline-none placeholder:text-subtle"
      />
    </label>
  )
}
