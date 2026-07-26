import type { InputHTMLAttributes } from 'react'

import { cn } from '@/util/cn'

export const controlClass =
  'w-full rounded-[9px] border-[1.5px] border-border bg-card px-[10px] py-[8px] font-body text-[13.5px] text-foreground outline-none transition focus:border-primary'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export function Input({ className, ...props }: InputProps) {
  return <input className={cn(controlClass, className)} {...props} />
}
