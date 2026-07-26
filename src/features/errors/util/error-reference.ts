/** Stable-looking support code for 500 pages (not a real stack id). */
export function createErrorReference(prefix = 'TBU-500'): string {
  const hex = Math.random().toString(16).slice(2, 8).toUpperCase()
  return `${prefix}-${hex}`
}
