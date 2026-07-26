export interface SentReminder {
  id: string
  text: string
  meta: string
}

export const SENT_REMINDERS: SentReminder[] = [
  { id: 'r1', text: "Don't lose your streak!", meta: '640 recipients ・ yesterday' },
  { id: 'r2', text: 'New N3 lessons are live', meta: '1,204 recipients ・ 3 days ago' },
]

export const AUDIENCE_OPTIONS = [
  { label: 'Inactive users', active: true },
  { label: 'All', active: false },
  { label: 'By level', active: false },
]
