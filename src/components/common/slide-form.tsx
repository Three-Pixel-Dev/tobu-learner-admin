import type { ReactNode } from 'react'

import { cn } from '@/util/cn'

interface SlideFormProps {
  open: boolean
  children: ReactNode
}

export function SlideForm({ open, children }: SlideFormProps) {
  return (
    <div
      className={cn(
        'overflow-hidden transition-[max-height] duration-[250ms] ease',
        open ? 'mb-[18px] max-h-[900px]' : 'max-h-0',
      )}
    >
      {children}
    </div>
  )
}
