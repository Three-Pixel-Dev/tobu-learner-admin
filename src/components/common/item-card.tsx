import type { ReactNode } from 'react'

import { cn } from '@/util/cn'

interface ItemCardProps {
  children: ReactNode
  className?: string
}

export function ItemCard({ children, className }: ItemCardProps) {
  return (
    <div className={cn('mb-[12px] rounded-2xl border-[1.5px] border-border bg-card p-[16px]', className)}>
      {children}
    </div>
  )
}

interface ItemHeadProps {
  label: string
  children?: ReactNode
  className?: string
}

export function ItemHead({ label, children, className }: ItemHeadProps) {
  return (
    <div className={cn('mb-[10px] flex items-center justify-between', className)}>
      <span className="text-[11px] font-bold uppercase text-subtle">{label}</span>
      {children}
    </div>
  )
}
