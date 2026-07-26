import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/util/cn'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement>

export function IconButton({ className, type = 'button', ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-[9px] border-[1.5px] border-border bg-card text-[13px] text-muted-foreground transition hover:bg-muted',
        className,
      )}
      {...props}
    />
  )
}
