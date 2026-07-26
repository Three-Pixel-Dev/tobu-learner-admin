import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/util/cn'

type DashedButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function DashedButton({ className, type = 'button', ...props }: DashedButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex w-full cursor-pointer items-center justify-center gap-[6px] rounded-[14px] border-[1.5px] border-dashed border-disabled bg-surface p-[12px] text-[13px] font-semibold text-muted-foreground transition hover:bg-muted',
        className,
      )}
      {...props}
    />
  )
}
