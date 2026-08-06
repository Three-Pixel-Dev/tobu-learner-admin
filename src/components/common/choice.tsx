import { cn } from '@/util/cn'

interface ChoiceProps {
  value: string
  correct?: boolean
  onValueChange?: (value: string) => void
  onCorrectChange?: () => void
}

export function Choice({ value, correct = false, onValueChange, onCorrectChange }: ChoiceProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-[6px] rounded-[9px] border-[1.5px] px-[10px] py-[7px]',
        correct ? 'border-primary bg-primary-soft' : 'border-border',
      )}
    >
      <button
        type="button"
        className="w-[18px] cursor-pointer border-none bg-transparent p-0 text-[13px] text-primary-dark"
        aria-label={correct ? 'Correct answer' : 'Mark as correct'}
        onClick={onCorrectChange}
      >
        {correct ? '✓' : '○'}
      </button>
      <input
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        className="w-full border-none bg-transparent text-[13px] text-foreground outline-none"
      />
    </div>
  )
}
