import { useState, type InputHTMLAttributes } from 'react'

import { Input } from '@/components/ui/input'
import { cn } from '@/util/cn'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  toggleLabel?: string
}

export function PasswordInput({ className, toggleLabel = 'password', ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-[52px]', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-[6px] top-1/2 -translate-y-1/2 rounded-md px-[8px] py-[6px] text-[12.5px] font-semibold text-muted-foreground hover:bg-muted"
        aria-label={`${visible ? 'Hide' : 'Show'} ${toggleLabel}`}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  )
}
