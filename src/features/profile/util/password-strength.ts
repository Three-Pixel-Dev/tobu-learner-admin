export interface PasswordChecks {
  len: boolean
  caseMix: boolean
  num: boolean
  sym: boolean
}

export function getPasswordChecks(value: string): PasswordChecks {
  return {
    len: value.length >= 8,
    caseMix: /[a-z]/.test(value) && /[A-Z]/.test(value),
    num: /[0-9]/.test(value),
    sym: /[^A-Za-z0-9]/.test(value),
  }
}

export function getPasswordScore(checks: PasswordChecks): number {
  return Object.values(checks).filter(Boolean).length
}

const STRENGTH_LABELS = [
  'Enter a new password',
  'Weak password',
  'Fair password',
  'Good password',
  'Strong password',
] as const

const STRENGTH_COLORS = ['#DC2626', '#F59E0B', '#38BDF8', '#22C55E'] as const

export function getStrengthLabel(value: string, score: number): string {
  if (value.length === 0) return STRENGTH_LABELS[0]
  return STRENGTH_LABELS[score] ?? STRENGTH_LABELS[0]
}

export function getStrengthColor(score: number): string {
  if (score <= 0) return '#F3F4F6'
  return STRENGTH_COLORS[Math.max(score - 1, 0)] ?? STRENGTH_COLORS[0]
}
