import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/util/cn'

type PanelProps = HTMLAttributes<HTMLDivElement>

export function Panel({ className, ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'mb-[18px] rounded-[22px] bg-card p-[22px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]',
        className,
      )}
      {...props}
    />
  )
}

interface PanelHeadProps {
  children: ReactNode
  className?: string
}

export function PanelHead({ children, className }: PanelHeadProps) {
  return (
    <div className={cn('mb-4 flex flex-wrap items-center justify-between gap-[10px]', className)}>
      {children}
    </div>
  )
}

interface PanelTitleProps {
  children: ReactNode
  className?: string
}

export function PanelTitle({ children, className }: PanelTitleProps) {
  return <h3 className={cn('m-0 font-display text-[16.5px]', className)}>{children}</h3>
}
