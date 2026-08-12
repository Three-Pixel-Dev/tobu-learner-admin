import { ensureRichTextHtml, sanitizeRichText } from '@/util/rich-text'
import { cn } from '@/util/cn'

interface RichTextViewProps {
  html: string
  className?: string
  /** Accessible name for the formatted content region. */
  label?: string
}

export function RichTextView({ html, className, label = 'Content' }: RichTextViewProps) {
  const safeHtml = sanitizeRichText(ensureRichTextHtml(html))

  return (
    <div
      role="region"
      aria-label={label}
      className={cn(
        'rich-text-content overflow-x-hidden rounded-[12px] border-[1.5px] border-border bg-card px-[14px] py-[12px] text-[14px] leading-relaxed text-foreground',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  )
}
