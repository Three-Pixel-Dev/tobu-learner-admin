export function formatRelativeTime(iso: string, now = Date.now()): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'Unknown'

  const diffSec = Math.round((then - now) / 1000)
  const abs = Math.abs(diffSec)
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

  if (abs < 60) return rtf.format(diffSec, 'second')
  const diffMin = Math.round(diffSec / 60)
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, 'minute')
  const diffHour = Math.round(diffMin / 60)
  if (Math.abs(diffHour) < 24) return rtf.format(diffHour, 'hour')
  const diffDay = Math.round(diffHour / 24)
  if (Math.abs(diffDay) < 30) return rtf.format(diffDay, 'day')
  const diffMonth = Math.round(diffDay / 30)
  if (Math.abs(diffMonth) < 12) return rtf.format(diffMonth, 'month')
  return rtf.format(Math.round(diffMonth / 12), 'year')
}

export function formatJoinedMonth(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en', { month: 'short', year: 'numeric' })
}
