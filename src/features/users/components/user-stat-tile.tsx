import { Panel } from '@/components/ui/panel'
import { cn } from '@/util/cn'

interface UserStatTileProps {
  label: string
  value: string
  tone?: 'default' | 'primary'
}

export function UserStatTile({ label, value, tone = 'default' }: UserStatTileProps) {
  return (
    <Panel className="mb-0 p-[16px_18px]">
      <div className="text-[11px] font-bold uppercase text-subtle">{label}</div>
      <div
        className={cn(
          'mt-[8px] font-display text-[22px] font-bold',
          tone === 'primary' ? 'text-primary-dark' : 'text-foreground',
        )}
      >
        {value}
      </div>
    </Panel>
  )
}
