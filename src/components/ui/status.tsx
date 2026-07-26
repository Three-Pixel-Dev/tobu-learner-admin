import { cn } from '@/util/cn'

interface StatusProps {
  active: boolean
  label: string
}

export function Status({ active, label }: StatusProps) {
  return (
    <span className="inline-flex items-center gap-[6px] text-[12px] font-semibold">
      <span className={cn('h-[7px] w-[7px] rounded-full', active ? 'bg-primary' : 'bg-disabled')} />
      {label}
    </span>
  )
}
