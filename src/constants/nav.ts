export interface NavItem {
  to: string
  icon: string
  label: string
  badge?: string
}

export interface NavSection {
  label?: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    items: [{ to: '/', icon: '▦', label: 'Dashboard' }],
  },
  {
    label: 'Content',
    items: [
      { to: '/jlpt-levels', icon: '🎓', label: 'JLPT Levels' },
      { to: '/lessons', icon: '📘', label: 'Lessons' },
      { to: '/kana', icon: 'あ', label: 'Kana & Kanji' },
      { to: '/exams', icon: '📝', label: 'Exams' },
    ],
  },
  {
    label: 'People',
    items: [
      { to: '/users', icon: '👤', label: 'Users' },
      { to: '/codes', icon: '🔑', label: 'Activation codes' },
      { to: '/reminders', icon: '🔔', label: 'Reminders' },
      { to: '/badges', icon: '🏅', label: 'Badges' },
      { to: '/reports', icon: '🚩', label: 'Content reports' },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/content', icon: '📄', label: 'Content pages' },
      { to: '/jlpt-exam-info', icon: '📅', label: 'JLPT exam info' },
      { to: '/xp-rewards', icon: '💎', label: 'XP rewards' },
    ],
  },
]
