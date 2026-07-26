import type { ReactNode } from 'react'

import { cn } from '@/util/cn'

type Tone = 'primary' | 'warning' | 'info' | 'danger'

const ICON_TONE: Record<Tone, string> = {
  primary: 'bg-primary-soft',
  warning: 'bg-warning-soft',
  info: 'bg-info-soft',
  danger: 'bg-destructive-soft',
}

interface ActivityItemProps {
  icon?: string
  tone?: Tone
  text: ReactNode
  time: string
}

export function ActivityItem({ icon, tone = 'primary', text, time }: ActivityItemProps) {
  return (
    <div className="flex gap-[11px] border-b border-muted py-[11px] last:border-b-0 last:pb-0">
      {icon ? (
        <div
          className={cn(
            'flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-[15px]',
            ICON_TONE[tone],
          )}
        >
          {icon}
        </div>
      ) : null}
      <div>
        <div className="text-[13px] leading-[1.4]">{text}</div>
        <div className="mt-[1px] text-[11px] text-subtle">{time}</div>
      </div>
    </div>
  )
}
