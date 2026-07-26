import type { ReactNode } from 'react'

import { cn } from '@/util/cn'

interface FieldProps {
  label?: string
  children: ReactNode
  className?: string
}

export function Field({ label, children, className }: FieldProps) {
  return (
    <div className={cn('flex flex-col', className)}>
      {label ? <label className="mb-[3px] block text-[11px] text-subtle">{label}</label> : null}
      {children}
    </div>
  )
}

interface FieldRowProps {
  children: ReactNode
  columns?: 2 | 3
  className?: string
}

export function FieldRow({ children, columns = 2, className }: FieldRowProps) {
  const columnClass = columns === 3 ? 'grid-cols-3' : 'grid-cols-2'
  return <div className={cn('mb-[10px] grid gap-[10px]', columnClass, className)}>{children}</div>
}
