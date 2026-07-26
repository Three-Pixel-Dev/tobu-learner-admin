import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/util/cn'
import { controlClass } from '@/components/ui/input'

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>

export function Textarea({ className, ...props }: TextareaProps) {
  return <textarea className={cn(controlClass, 'resize-y', className)} {...props} />
}
