import { Panel } from '@/components/ui/panel'
import { cn } from '@/util/cn'

type Tone = 'primary' | 'warning' | 'info' | 'accent'
type DeltaTone = 'primary' | 'warning' | 'neutral' | 'danger'

const ICON_TONE: Record<Tone, string> = {
  primary: 'bg-primary-soft',
  warning: 'bg-warning-soft',
  info: 'bg-info-soft',
  accent: 'bg-accent-soft',
}

const DELTA_TONE: Record<DeltaTone, string> = {
  primary: 'bg-primary-soft text-primary-dark',
  warning: 'bg-warning-soft text-warning-foreground',
  neutral: 'bg-muted text-muted-foreground',
  danger: 'bg-destructive-soft text-destructive',
}

interface StatCardProps {
  icon: string
  tone: Tone
  delta: string
  deltaTone: DeltaTone
  value: string
  label: string
}

export function StatCard({ icon, tone, delta, deltaTone, value, label }: StatCardProps) {
  return (
    <Panel className="mb-0 rounded-[20px] p-[18px_20px]">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            'flex h-[38px] w-[38px] items-center justify-center rounded-xl text-[18px]',
            ICON_TONE[tone],
          )}
        >
          {icon}
        </div>
        <div className={cn('rounded-full px-[8px] py-[3px] text-[11.5px] font-bold', DELTA_TONE[deltaTone])}>
          {delta}
        </div>
      </div>
      <div className="mt-[14px] mb-[2px] font-display text-[26px] font-bold">{value}</div>
      <div className="text-[12.5px] text-muted-foreground">{label}</div>
    </Panel>
  )
}
