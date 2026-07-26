export interface UserRow {
  id: string
  name: string
  detail: string
  initials: string
  tone: 'primary' | 'info' | 'danger'
  level: string
  streak: string
  xp: string
  deleted?: boolean
}

export const USERS: UserRow[] = [
  {
    id: 'u1',
    name: 'Mya Thandar',
    detail: 'mya.t@mail.com',
    initials: 'MT',
    tone: 'primary',
    level: 'N4',
    streak: '🔥 12',
    xp: '380',
  },
  {
    id: 'u2',
    name: 'Kyaw Zin',
    detail: 'kyaw.z@mail.com',
    initials: 'KZ',
    tone: 'info',
    level: 'N5',
    streak: '🔥 3',
    xp: '500',
  },
  {
    id: 'u3',
    name: 'Su Wai (deleted)',
    detail: 'removed 2 days ago',
    initials: 'SW',
    tone: 'danger',
    level: '—',
    streak: '—',
    xp: '—',
    deleted: true,
  },
]
