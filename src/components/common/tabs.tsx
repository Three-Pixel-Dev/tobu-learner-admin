import { cn } from '@/util/cn'

export interface TabItem {
  value: string
  label: string
}

interface TabsProps {
  items: TabItem[]
  value: string
  onValueChange: (value: string) => void
  className?: string
}

export function Tabs({ items, value, onValueChange, className }: TabsProps) {
  return (
    <div className={cn('flex w-fit gap-[6px] rounded-xl bg-muted p-[4px]', className)}>
      {items.map((item) => {
        const isActive = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onValueChange(item.value)}
            className={cn(
              'cursor-pointer rounded-[9px] px-[14px] py-[7px] text-[12.5px] font-semibold transition',
              isActive
                ? 'bg-card text-primary-dark shadow-[0_2px_6px_rgba(15,23,42,0.08)]'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
