import { cn } from '@/util/cn'

interface ChoiceProps {
  value: string
  correct?: boolean
}

export function Choice({ value, correct = false }: ChoiceProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-[6px] rounded-[9px] border-[1.5px] px-[10px] py-[7px]',
        correct ? 'border-primary bg-primary-soft' : 'border-border',
      )}
    >
      <span className="w-[13px] text-[13px] text-primary-dark">{correct ? '✓' : ''}</span>
      <input
        defaultValue={value}
        className="w-full border-none bg-transparent text-[13px] text-foreground outline-none"
      />
    </div>
  )
}
