import type { KanaRow } from '@/features/kana/kana.mock'
import { cn } from '@/util/cn'

interface KanaGridProps {
  row: KanaRow
}

export function KanaGrid({ row }: KanaGridProps) {
  return (
    <div>
      <div className="mb-[8px] text-[11px] font-bold uppercase text-subtle">{row.heading}</div>
      <div className="grid grid-cols-6 gap-[8px]">
        {row.tiles.map((tile, index) => (
          <div
            key={index}
            className={cn(
              'relative rounded-xl border-[1.5px] p-[10px] text-center',
              tile.missing ? 'border-2 border-dashed border-primary' : 'border-border bg-card',
            )}
          >
            <div className={cn('text-[22px]', tile.missing && 'text-primary')}>{tile.char}</div>
            <div className={cn('text-[10px]', tile.missing ? 'text-primary-dark' : 'text-muted-foreground')}>
              {tile.romaji}
            </div>
          </div>
        ))}
        <button
          type="button"
          className="flex items-center justify-center rounded-xl border-[1.5px] border-dashed border-disabled bg-surface p-[10px] text-center"
        >
          ＋
        </button>
      </div>
    </div>
  )
}
