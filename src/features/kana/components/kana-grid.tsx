import { useMemo } from 'react'

import { speakKana } from '@/features/kana/kana-tts'
import type { KanaDto, KanaType } from '@/shared/services/kana.service'
import { cn } from '@/util/cn'

/** Slot in a 5-column gojūon / dakuten row — `null` = empty cell (e.g. い/え in や行). */
type ChartSlot = string | null

interface ChartSection {
  id: string
  label: string
  slots: ChartSlot[]
}

const HIRAGANA_CHART: ChartSection[] = [
  { id: 'a', label: 'あ行', slots: ['あ', 'い', 'う', 'え', 'お'] },
  { id: 'ka', label: 'か行', slots: ['か', 'き', 'く', 'け', 'こ'] },
  { id: 'sa', label: 'さ行', slots: ['さ', 'し', 'す', 'せ', 'そ'] },
  { id: 'ta', label: 'た行', slots: ['た', 'ち', 'つ', 'て', 'と'] },
  { id: 'na', label: 'な行', slots: ['な', 'に', 'ぬ', 'ね', 'の'] },
  { id: 'ha', label: 'は行', slots: ['は', 'ひ', 'ふ', 'へ', 'ほ'] },
  { id: 'ma', label: 'ま行', slots: ['ま', 'み', 'む', 'め', 'も'] },
  { id: 'ya', label: 'や行', slots: ['や', null, 'ゆ', null, 'よ'] },
  { id: 'ra', label: 'ら行', slots: ['ら', 'り', 'る', 'れ', 'ろ'] },
  // Matches reference poster: わ · を · ん
  { id: 'wa', label: 'わ行', slots: ['わ', null, 'を', null, 'ん'] },
  { id: 'ga', label: 'が行', slots: ['が', 'ぎ', 'ぐ', 'げ', 'ご'] },
  { id: 'za', label: 'ざ行', slots: ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'] },
  { id: 'da', label: 'だ行', slots: ['だ', 'ぢ', 'づ', 'で', 'ど'] },
  { id: 'ba', label: 'ば行', slots: ['ば', 'び', 'ぶ', 'べ', 'ぼ'] },
  { id: 'pa', label: 'ぱ行', slots: ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'] },
]

const KATAKANA_CHART: ChartSection[] = [
  { id: 'a', label: 'ア行', slots: ['ア', 'イ', 'ウ', 'エ', 'オ'] },
  { id: 'ka', label: 'カ行', slots: ['カ', 'キ', 'ク', 'ケ', 'コ'] },
  { id: 'sa', label: 'サ行', slots: ['サ', 'シ', 'ス', 'セ', 'ソ'] },
  { id: 'ta', label: 'タ行', slots: ['タ', 'チ', 'ツ', 'テ', 'ト'] },
  { id: 'na', label: 'ナ行', slots: ['ナ', 'ニ', 'ヌ', 'ネ', 'ノ'] },
  { id: 'ha', label: 'ハ行', slots: ['ハ', 'ヒ', 'フ', 'ヘ', 'ホ'] },
  { id: 'ma', label: 'マ行', slots: ['マ', 'ミ', 'ム', 'メ', 'モ'] },
  { id: 'ya', label: 'ヤ行', slots: ['ヤ', null, 'ユ', null, 'ヨ'] },
  { id: 'ra', label: 'ラ行', slots: ['ラ', 'リ', 'ル', 'レ', 'ロ'] },
  { id: 'wa', label: 'ワ行', slots: ['ワ', null, 'ヲ', null, 'ン'] },
  { id: 'ga', label: 'ガ行', slots: ['ガ', 'ギ', 'グ', 'ゲ', 'ゴ'] },
  { id: 'za', label: 'ザ行', slots: ['ザ', 'ジ', 'ズ', 'ゼ', 'ゾ'] },
  { id: 'da', label: 'ダ行', slots: ['ダ', 'ヂ', 'ヅ', 'デ', 'ド'] },
  { id: 'ba', label: 'バ行', slots: ['バ', 'ビ', 'ブ', 'ベ', 'ボ'] },
  { id: 'pa', label: 'パ行', slots: ['パ', 'ピ', 'プ', 'ペ', 'ポ'] },
]

interface KanaGridProps {
  type: KanaType
  items: KanaDto[]
  onAdd: () => void
  onEdit: (item: KanaDto) => void
}

function chartFor(type: KanaType): ChartSection[] {
  return type === 'HIRAGANA' ? HIRAGANA_CHART : KATAKANA_CHART
}

export function KanaGrid({ type, items, onAdd, onEdit }: KanaGridProps) {
  const byChar = useMemo(() => {
    const map = new Map<string, KanaDto>()
    for (const item of items) {
      if (!map.has(item.character)) {
        map.set(item.character, item)
      }
    }
    return map
  }, [items])

  const chart = chartFor(type)
  const chartChars = useMemo(() => {
    const set = new Set<string>()
    for (const section of chart) {
      for (const slot of section.slots) {
        if (slot) set.add(slot)
      }
    }
    return set
  }, [chart])

  const extras = items.filter((item) => !chartChars.has(item.character))

  return (
    <div className="mb-[8px]">
      <div className="flex flex-col gap-[22px]">
        {chart.map((section) => {
          const isDakuten = ['ga', 'za', 'da', 'ba', 'pa'].includes(section.id)
          const hasAny = section.slots.some((slot) => slot && byChar.has(slot))
          // Always show gojūon structure; only show dakuten rows once any of that row exists.
          if (isDakuten && !hasAny) return null

          return (
            <section key={section.id} aria-label={section.label}>
              <div className="mb-[10px] text-[12px] font-bold text-subtle">{section.label}</div>
              <div className="grid grid-cols-5 gap-[10px]">
                {section.slots.map((slot, index) => {
                  if (!slot) {
                    return <div key={`${section.id}-empty-${index}`} aria-hidden className="min-h-[74px]" />
                  }
                  const item = byChar.get(slot)
                  if (!item) {
                    return (
                      <div
                        key={`${section.id}-missing-${slot}`}
                        className="flex min-h-[74px] flex-col items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-border bg-surface opacity-45"
                        aria-hidden
                      >
                        <span className="text-[26px] leading-[1.1] text-muted-foreground">{slot}</span>
                      </div>
                    )
                  }
                  return <KanaChartTile key={item.id} item={item} onEdit={onEdit} />
                })}
              </div>
            </section>
          )
        })}

        <section aria-label="Extra characters">
          {extras.length > 0 ? (
            <div className="mb-[10px] text-[12px] font-bold text-subtle">Other characters</div>
          ) : null}
          <div className="grid grid-cols-5 gap-[10px]">
            {extras.map((item) => (
              <KanaChartTile key={item.id} item={item} onEdit={onEdit} />
            ))}
            <button
              type="button"
              className="flex min-h-[74px] cursor-pointer items-center justify-center rounded-[14px] border-[1.5px] border-dashed border-[#CBD5E1] bg-surface text-muted-foreground transition hover:border-primary hover:text-primary-dark"
              aria-label={`Add new ${type === 'HIRAGANA' ? 'Hiragana' : 'Katakana'} character`}
              onClick={onAdd}
            >
              <span className="text-[20px]">＋</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function KanaChartTile({
  item,
  onEdit,
}: {
  item: KanaDto
  onEdit: (item: KanaDto) => void
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[14px] border-[1.5px] border-border bg-card transition',
        'hover:border-[#CBD5E1]',
        item.deleted && 'opacity-50',
      )}
    >
      {!item.deleted ? (
        <button
          type="button"
          className="absolute top-[6px] right-[6px] z-2 flex h-[22px] w-[22px] cursor-pointer items-center justify-center rounded-full border-none bg-muted text-[10px] text-muted-foreground hover:bg-primary-soft hover:text-primary-dark"
          aria-label={`Listen: ${item.character}, romaji ${item.romaji}`}
          onClick={(event) => {
            event.stopPropagation()
            speakKana(item.character)
          }}
        >
          🔊
        </button>
      ) : null}
      <button
        type="button"
        className="flex w-full cursor-pointer flex-col items-center gap-[2px] border-none bg-transparent px-[8px] pt-[14px] pb-[10px] font-body"
        aria-label={
          item.deleted
            ? `${item.character}, disabled. Restore.`
            : `${item.character}, romaji ${item.romaji}. Edit.`
        }
        onClick={() => onEdit(item)}
      >
        <span className="text-[26px] leading-[1.1] text-foreground">{item.character}</span>
        <span className="text-[11px] font-semibold text-muted-foreground">{item.romaji}</span>
        {item.deleted ? (
          <span className="mt-[2px] text-[10px] font-bold text-muted-foreground">Disabled</span>
        ) : null}
      </button>
    </div>
  )
}
