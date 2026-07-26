export const CODE_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

export type CodeStatus = 'used' | 'unused' | 'expired'

export interface CodeRow {
  id: string
  code: string
  level: string
  duration: string
  usedBy: string
  status: CodeStatus
}

export const CODES: CodeRow[] = [
  { id: 'c1', code: 'TOBU-N4-771', level: 'N4', duration: '90 days', usedBy: 'Mya Thandar', status: 'used' },
  { id: 'c2', code: 'TOBU-N5-208', level: 'N5', duration: '30 days', usedBy: '—', status: 'unused' },
  { id: 'c3', code: 'TOBU-N3-045', level: 'N3', duration: '60 days', usedBy: '—', status: 'expired' },
]

export const CODE_STATUS_LABEL: Record<CodeStatus, string> = {
  used: 'Used',
  unused: 'Unused',
  expired: 'Expired',
}
