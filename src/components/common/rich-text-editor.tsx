import Placeholder from '@tiptap/extension-placeholder'
import { Color, FontSize, TextStyle } from '@tiptap/extension-text-style'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect, type ReactNode } from 'react'

import { ensureRichTextHtml, isRichTextEmpty, sanitizeRichText } from '@/util/rich-text'
import { cn } from '@/util/cn'

const FONT_SIZES = [
  { label: 'Small', value: '14px' },
  { label: 'Normal', value: '16px' },
  { label: 'Large', value: '18px' },
  { label: 'Extra large', value: '22px' },
] as const

const TEXT_COLORS = [
  { label: 'Default', value: null, swatch: '#0F172A' },
  { label: 'Gray', value: '#4B5563', swatch: '#4B5563' },
  { label: 'Green', value: '#15803D', swatch: '#22C55E' },
  { label: 'Blue', value: '#0369A1', swatch: '#38BDF8' },
  { label: 'Red', value: '#DC2626', swatch: '#EF4444' },
  { label: 'Orange', value: '#B45309', swatch: '#FFD34D' },
] as const

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  onBlur?: () => void
  invalid?: boolean
  placeholder?: string
  className?: string
  label?: string
  minHeightClassName?: string
}

interface ToolbarButtonProps {
  label: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}

function ToolbarButton({ label, pressed = false, onClick, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className={cn(
        'inline-flex h-[36px] min-w-[36px] items-center justify-center rounded-[10px] px-[10px] text-[13px] font-semibold transition',
        'text-foreground hover:bg-card focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]',
        pressed && 'bg-primary-soft text-primary-dark',
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  invalid = false,
  placeholder = 'Write your content here…',
  className,
  label = 'Content editor',
  minHeightClassName = 'min-h-[160px]',
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
        strike: false,
        code: false,
        codeBlock: false,
        heading: false,
        blockquote: false,
        horizontalRule: false,
        link: false,
        underline: false,
      }),
      TextStyle,
      Color,
      FontSize,
      Placeholder.configure({ placeholder }),
    ],
    content: ensureRichTextHtml(value),
    editorProps: {
      attributes: {
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': label,
        class: cn(
          'rich-text-content px-[14px] py-[12px] outline-none',
          minHeightClassName,
          'text-[14px] leading-relaxed text-foreground',
        ),
      },
    },
    onUpdate: ({ editor: current }) => {
      const html = sanitizeRichText(current.getHTML())
      onChange(isRichTextEmpty(html) ? '' : html)
    },
    onBlur: () => onBlur?.(),
  })

  useEffect(() => {
    if (!editor) return
    const next = ensureRichTextHtml(value)
    if (sanitizeRichText(editor.getHTML()) !== sanitizeRichText(next)) {
      editor.commands.setContent(next, { emitUpdate: false })
    }
  }, [value, editor])

  if (!editor) {
    return (
      <div
        className={cn(
          'rounded-[12px] border-[1.5px] border-border bg-muted px-[14px] py-[12px] text-[13px] text-muted-foreground',
          minHeightClassName,
          className,
        )}
        aria-busy="true"
      >
        Loading editor…
      </div>
    )
  }

  const activeFontSize = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? ''
  const activeColor = (editor.getAttributes('textStyle').color as string | undefined) ?? null

  return (
    <div className={cn('flex flex-col gap-[8px]', className)}>
      <div
        role="toolbar"
        aria-label="Text formatting"
        className="flex flex-wrap items-center gap-[6px] rounded-[12px] border-[1.5px] border-border bg-muted p-[6px]"
      >
        <div className="flex flex-wrap items-center gap-[4px]" role="group" aria-label="Text size">
          <span className="px-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
            Size
          </span>
          {FONT_SIZES.map((size) => (
            <ToolbarButton
              key={size.value}
              label={`Text size ${size.label}`}
              pressed={activeFontSize === size.value || (size.value === '16px' && !activeFontSize)}
              onClick={() => {
                if (size.value === '16px') {
                  editor.chain().focus().unsetFontSize().run()
                  return
                }
                editor.chain().focus().setFontSize(size.value).run()
              }}
            >
              {size.label}
            </ToolbarButton>
          ))}
        </div>

        <div className="mx-[4px] hidden h-[24px] w-px bg-border sm:block" aria-hidden />

        <div className="flex flex-wrap items-center gap-[4px]" role="group" aria-label="Text color">
          <span className="px-[6px] text-[11px] font-semibold uppercase tracking-[0.06em] text-subtle">
            Color
          </span>
          {TEXT_COLORS.map((color) => {
            const pressed = color.value === null ? !activeColor : activeColor === color.value
            return (
              <button
                key={color.label}
                type="button"
                aria-label={`Text color ${color.label}`}
                aria-pressed={pressed}
                title={color.label}
                onClick={() => {
                  if (color.value == null) {
                    editor.chain().focus().unsetColor().run()
                    return
                  }
                  editor.chain().focus().setColor(color.value).run()
                }}
                className={cn(
                  'flex h-[36px] w-[36px] items-center justify-center rounded-[10px] transition hover:bg-card focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]',
                  pressed && 'ring-2 ring-primary ring-offset-2 ring-offset-muted',
                )}
              >
                <span
                  aria-hidden
                  className="h-[18px] w-[18px] rounded-full border border-border"
                  style={{ background: color.swatch }}
                />
              </button>
            )
          })}
        </div>

        <div className="mx-[4px] hidden h-[24px] w-px bg-border sm:block" aria-hidden />

        <div className="flex flex-wrap items-center gap-[4px]" role="group" aria-label="Lists">
          <ToolbarButton
            label="Bullet list"
            pressed={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToolbarButton>
          <ToolbarButton
            label="Numbered list"
            pressed={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </ToolbarButton>
        </div>
      </div>

      <p className="m-0 text-[12px] text-muted-foreground">
        Tip: select text first, then tap Size, Color, or List.
      </p>

      <div
        className={cn(
          'overflow-hidden rounded-[12px] border-[1.5px] bg-card transition',
          invalid ? 'border-destructive bg-[#FFFAFA]' : 'border-border focus-within:border-primary',
        )}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
