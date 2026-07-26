import { cn } from '@/util/cn'

type AvatarTone = 'primary' | 'info' | 'danger'

const TONE: Record<AvatarTone, string> = {
  primary: 'bg-primary-soft text-primary-dark',
  info: 'bg-info-soft text-info-foreground',
  danger: 'bg-destructive-soft text-destructive',
}

interface AvatarProps {
  initials: string
  tone: AvatarTone
  className?: string
}

export function Avatar({ initials, tone, className }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex h-[26px] w-[26px] items-center justify-center rounded-full text-[11px] font-bold',
        TONE[tone],
        className,
      )}
    >
      {initials}
    </div>
  )
}
