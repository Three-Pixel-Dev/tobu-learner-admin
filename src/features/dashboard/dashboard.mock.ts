export type StatTone = 'primary' | 'warning' | 'info' | 'accent'
export type DeltaTone = 'primary' | 'warning' | 'neutral' | 'danger'

export interface DashboardStat {
  icon: string
  tone: StatTone
  delta: string
  deltaTone: DeltaTone
  value: string
  label: string
}

export const DASHBOARD_STATS: DashboardStat[] = [
  { icon: '👥', tone: 'primary', delta: '+8.2%', deltaTone: 'primary', value: '2,481', label: 'Active learners' },
  { icon: '🔥', tone: 'warning', delta: '+3.1%', deltaTone: 'warning', value: '642', label: 'Streaks kept today' },
  { icon: '📘', tone: 'info', delta: '86 total', deltaTone: 'neutral', value: '74', label: 'Published lessons' },
  { icon: '🔑', tone: 'accent', delta: '5 expiring', deltaTone: 'danger', value: '312', label: 'Codes redeemed / mo' },
]

export interface LessonRow {
  id: string
  name: string
  sub: string
  vocab: number
  grammar: number
  quiz: number
  published: boolean
}

export const DASHBOARD_LESSONS: LessonRow[] = [
  { id: 'l1', name: 'Lesson 1 ・ あいさつ', sub: '挨拶表現 ・ 11 items', vocab: 6, grammar: 1, quiz: 4, published: true },
  { id: 'l2', name: 'Lesson 2 ・ かぞく', sub: '家族の 呼び方 ・ 9 items', vocab: 5, grammar: 2, quiz: 2, published: true },
  { id: 'l3', name: 'Lesson 3 ・ かいもの', sub: '買い物 会話 ・ 8 items', vocab: 4, grammar: 1, quiz: 3, published: false },
]

export interface ActivitySegment {
  text: string
  bold?: boolean
}

export interface ActivityRow {
  id: string
  icon: string
  tone: 'primary' | 'warning' | 'info' | 'danger'
  segments: ActivitySegment[]
  time: string
}

export const DASHBOARD_ACTIVITY: ActivityRow[] = [
  {
    id: 'a1',
    icon: '🔑',
    tone: 'primary',
    segments: [{ text: 'Mya Thandar', bold: true }, { text: ' activated code TOBU-N4' }],
    time: '3 minutes ago',
  },
  {
    id: 'a2',
    icon: '🏆',
    tone: 'warning',
    segments: [{ text: 'Kyaw Zin', bold: true }, { text: ' reached Level 5, 500 XP' }],
    time: '22 minutes ago',
  },
  {
    id: 'a3',
    icon: '📘',
    tone: 'info',
    segments: [{ text: 'Admin published ' }, { text: 'Lesson 5 ・ しごと', bold: true }],
    time: '1 hour ago',
  },
  {
    id: 'a4',
    icon: '⚠️',
    tone: 'danger',
    segments: [{ text: '5 activation codes expiring this week' }],
    time: 'Today, 09:00',
  },
]

export const LEVEL_TABS = [
  { value: 'N5', label: 'N5' },
  { value: 'N4', label: 'N4' },
  { value: 'N3', label: 'N3' },
  { value: 'N2', label: 'N2' },
  { value: 'N1', label: 'N1' },
]

export interface LevelCount {
  level: string
  count: number
}

export const LEVEL_LEGEND: LevelCount[] = [
  { level: 'N5', count: 18 },
  { level: 'N4', count: 22 },
  { level: 'N3', count: 16 },
  { level: 'N2', count: 14 },
  { level: 'N1', count: 16 },
]
