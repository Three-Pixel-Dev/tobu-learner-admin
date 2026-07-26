import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/util/cn'

const quickCardVariants = cva(
  'mb-0 flex cursor-pointer items-center gap-[12px] rounded-[18px] border-2 p-[16px]',
  {
    variants: {
      tone: {
        primary: 'border-primary bg-primary-soft',
        warning: 'border-warning bg-warning-soft',
        info: 'border-info bg-info-soft',
      },
    },
    defaultVariants: {
      tone: 'primary',
    },
  },
)

interface QuickCardProps extends VariantProps<typeof quickCardVariants> {
  emoji: string
  title: string
  description: string
  onClick?: () => void
  className?: string
}

export function QuickCard({ emoji, title, description, tone, onClick, className }: QuickCardProps) {
  return (
    <div className={cn(quickCardVariants({ tone }), className)} onClick={onClick}>
      <div className="text-[26px]">{emoji}</div>
      <div>
        <b className="block font-display text-[13.5px]">{title}</b>
        <span className="text-[11.5px] text-muted-foreground">{description}</span>
      </div>
    </div>
  )
}
