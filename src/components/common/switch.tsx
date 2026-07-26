import { cn } from '@/util/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

export function Switch({ checked, onCheckedChange, label, disabled = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-[24px] w-[42px] shrink-0 rounded-[20px] border-none p-0 transition',
        'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]',
        'disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary' : 'bg-disabled',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'absolute top-[3px] h-[18px] w-[18px] rounded-full bg-card shadow-[0_1px_3px_rgba(0,0,0,0.25)] transition-[left] duration-150 motion-reduce:transition-none',
          checked ? 'left-[21px]' : 'left-[3px]',
        )}
      />
    </button>
  )
}
