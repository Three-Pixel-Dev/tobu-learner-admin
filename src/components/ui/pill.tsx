import { cva, type VariantProps } from 'class-variance-authority'
import type { ReactNode } from 'react'

import { cn } from '@/util/cn'

const pillVariants = cva(
  'inline-flex items-center gap-[5px] rounded-full px-[9px] py-[4px] text-[11.5px] font-bold',
  {
    variants: {
      variant: {
        vocab: 'bg-info-soft text-info-foreground',
        grammar: 'bg-accent-soft text-accent-foreground',
        quiz: 'bg-warning-soft text-warning-foreground',
        success: 'bg-primary-soft text-primary-dark',
        danger: 'bg-destructive-soft text-destructive',
        neutral: 'border-[1.5px] border-border text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

interface PillProps extends VariantProps<typeof pillVariants> {
  children: ReactNode
  className?: string
}

export function Pill({ variant, className, children }: PillProps) {
  return <span className={cn(pillVariants({ variant }), className)}>{children}</span>
}
