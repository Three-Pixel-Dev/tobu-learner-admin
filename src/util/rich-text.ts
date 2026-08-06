import DOMPurify from 'dompurify'

const ALLOWED_TAGS = ['p', 'br', 'ul', 'ol', 'li', 'span']
const ALLOWED_ATTR = ['style']

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  })
}

export function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

/** Plain legacy bodies become a single paragraph; HTML is sanitized. */
export function ensureRichTextHtml(body: string): string {
  const trimmed = body.trim()
  if (!trimmed) return '<p></p>'
  if (/<[a-z][\s\S]*>/i.test(trimmed)) {
    const clean = sanitizeRichText(trimmed)
    return clean.trim() ? clean : '<p></p>'
  }
  const paragraphs = trimmed
    .split(/\n{2,}/)
    .map((part) => `<p>${escapeHtml(part).replaceAll('\n', '<br>')}</p>`)
    .join('')
  return sanitizeRichText(paragraphs)
}

export function isRichTextEmpty(html: string): boolean {
  const text = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).replace(/\u00a0/g, ' ').trim()
  return text.length === 0
}
