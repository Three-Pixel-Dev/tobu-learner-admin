import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'

import { cn } from '@/util/cn'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-[7px] rounded-xl font-body font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-[0_4px_12px_rgba(34,197,94,0.28)] hover:brightness-105',
        ghost: 'border-[1.5px] border-border bg-card text-foreground hover:bg-muted',
      },
      size: {
        md: 'px-[18px] py-[10px] text-[13.5px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
