import type { TabItem } from '@/components/common/tabs'

export const KANA_TABS: TabItem[] = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'katakana', label: 'Katakana' },
  { value: 'kanji', label: 'Kanji' },
]

export const KANA_SUBTITLES: Record<string, string> = {
  hiragana: 'Manage Hiragana characters: romaji, Myanmar reading, and pronunciation audio.',
  katakana: 'Manage Katakana characters: romaji, Myanmar reading, and pronunciation audio.',
  kanji: 'Kanji has meaning, readings, stroke count, and a stroke-order guide — a separate entity from kana.',
}
