import type { TabItem } from '@/components/common/tabs'

export interface KanaTile {
  char: string
  romaji: string
  missing?: boolean
}

export interface KanaRow {
  heading: string
  tiles: KanaTile[]
}

export const HIRAGANA_ROW: KanaRow = {
  heading: 'あ行',
  tiles: [
    { char: 'あ', romaji: 'a' },
    { char: 'い', romaji: 'i' },
    { char: 'う', romaji: 'u' },
    { char: 'え', romaji: 'missing audio', missing: true },
    { char: 'お', romaji: 'o' },
  ],
}

export const KATAKANA_ROW: KanaRow = {
  heading: 'ア行',
  tiles: [
    { char: 'ア', romaji: 'a' },
    { char: 'イ', romaji: 'i' },
    { char: 'ウ', romaji: 'missing audio', missing: true },
    { char: 'エ', romaji: 'e' },
    { char: 'オ', romaji: 'o' },
  ],
}

export interface KanjiDetail {
  heading: string
  char: string
  on: string
  kun: string
  mm: string
  en: string
}

export const KANJI_DETAIL: KanjiDetail = {
  heading: 'Kanji ・ N4 ・ 少',
  char: '少',
  on: 'ショウ',
  kun: 'すく.ない',
  mm: 'နည်းသော',
  en: 'few, little',
}

export const KANA_TABS: TabItem[] = [
  { value: 'hiragana', label: 'Hiragana' },
  { value: 'katakana', label: 'Katakana' },
  { value: 'kanji', label: 'Kanji' },
]
