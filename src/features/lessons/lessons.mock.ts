import type { TabItem } from '@/components/common/tabs'

export interface VocabItem {
  id: string
  word: string
  reading: string
  mm: string
  en: string
}

export interface GrammarItem {
  id: string
  pattern: string
  level: string
  mm: string
  en: string
}

export interface QuizChoice {
  value: string
  correct?: boolean
}

export interface QuizItem {
  id: string
  label: string
  sentence: string
  choices: QuizChoice[]
}

export const VOCAB_ITEMS: VocabItem[] = [
  { id: 'v1', word: '少ない', reading: 'すくない', mm: 'နည်းသော', en: 'few' },
  { id: 'v2', word: '毎日', reading: 'まいにち', mm: 'နေ့တိုင်း', en: 'every day' },
]

export const GRAMMAR_ITEMS: GrammarItem[] = [
  { id: 'g1', pattern: '〜ですね', level: 'N4', mm: '“…နော်” — သဘောတူညီမှုပြ', en: 'sentence-final ね' },
]

export const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 'q1',
    label: 'Quiz question 1 ・ もんだい1',
    sentence: 'きょうは くるまが ＿＿ ですね。',
    choices: [
      { value: 'すくない', correct: true },
      { value: 'すこない' },
      { value: 'すきない' },
      { value: 'すかない' },
    ],
  },
]

export const LESSON_TABS: TabItem[] = [
  { value: 'vocab', label: `Vocab (${VOCAB_ITEMS.length})` },
  { value: 'grammar', label: `Grammar (${GRAMMAR_ITEMS.length})` },
  { value: 'quiz', label: `Quiz (${QUIZ_ITEMS.length})` },
]
