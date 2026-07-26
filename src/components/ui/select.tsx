import type { SelectHTMLAttributes } from 'react'

import { cn } from '@/util/cn'
import { controlClass } from '@/components/ui/input'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <select className={cn(controlClass, className)} {...props}>
      {children}
    </select>
  )
}
