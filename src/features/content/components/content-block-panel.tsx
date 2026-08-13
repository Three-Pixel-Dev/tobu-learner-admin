import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useId, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Field } from '@/components/common/field'
import { RichTextEditor } from '@/components/common/rich-text-editor'
import { RichTextView } from '@/components/common/rich-text-view'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { useUpdateContentMutation } from '@/shared/queries/content.query'
import { contentKeyMeta, type AppContentDto } from '@/shared/services/content.service'
import { cn } from '@/util/cn'
import { formatRelativeTime } from '@/util/relative-time'
import { ensureRichTextHtml, isRichTextEmpty } from '@/util/rich-text'

const schema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title is too long'),
  body: z.string().refine((value) => !isRichTextEmpty(value), 'Please write some content'),
})

type FormValues = z.infer<typeof schema>

interface ContentBlockPanelProps {
  content: AppContentDto
  onSaved: (message: string) => void
}

export function ContentBlockPanel({ content, onSaved }: ContentBlockPanelProps) {
  const [editing, setEditing] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [overflows, setOverflows] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewId = useId()
  const updateContent = useUpdateContentMutation()
  const meta = contentKeyMeta(content.contentKey)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: content.title,
      body: ensureRichTextHtml(content.body),
    },
  })

  useEffect(() => {
    reset({
      title: content.title,
      body: ensureRichTextHtml(content.body),
    })
    setEditing(false)
    setExpanded(false)
  }, [content.id, content.title, content.body, content.updatedAt, reset])

  useEffect(() => {
    if (editing || expanded) return
    const node = previewRef.current
    if (!node) return
    const measure = () => {
      setOverflows(node.scrollHeight > node.clientHeight + 12)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [content.body, editing, expanded])

  const onSubmit = handleSubmit((values) => {
    updateContent.mutate(
      {
        contentKey: content.contentKey,
        payload: {
          title: values.title,
          body: ensureRichTextHtml(values.body),
        },
      },
      {
        onSuccess: () => {
          setEditing(false)
          onSaved(`${content.title} saved.`)
        },
      },
    )
  })

  const cancel = () => {
    reset({
      title: content.title,
      body: ensureRichTextHtml(content.body),
    })
    setEditing(false)
  }

  const updatedLabel = content.updatedAt ? formatRelativeTime(content.updatedAt) : null

  return (
    <Panel>
      <form onSubmit={onSubmit}>
        <PanelHead>
          <div className="min-w-0">
            <div className="mb-[6px] flex flex-wrap items-center gap-[8px]">
              <span className="inline-flex rounded-full bg-muted px-[8px] py-[2px] text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground">
                {meta.label}
              </span>
              {updatedLabel ? (
                <span className="text-[11.5px] text-subtle">Updated {updatedLabel}</span>
              ) : null}
            </div>
            <PanelTitle className="line-clamp-1" title={content.title}>
              {editing ? `Edit ${content.title}` : content.title}
            </PanelTitle>
            <p className="mt-[4px] text-[12.5px] text-muted-foreground">{meta.description}</p>
          </div>
          {editing ? (
            <div className="flex items-center gap-[8px]">
              <Button type="button" variant="ghost" onClick={cancel} disabled={updateContent.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={!isDirty || updateContent.isPending}>
                {updateContent.isPending ? 'Saving…' : 'Save'}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              aria-expanded={editing}
              onClick={() => setEditing(true)}
            >
              ✎ Edit
            </Button>
          )}
        </PanelHead>

        {editing ? (
          <div className="flex flex-col gap-[16px]">
            <Field label="Title">
              <Input
                id={`${previewId}-title`}
                aria-invalid={Boolean(errors.title)}
                {...register('title')}
              />
              {errors.title ? (
                <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                  {errors.title.message}
                </p>
              ) : null}
            </Field>

            <Field label="Body">
              <Controller
                name="body"
                control={control}
                render={({ field }) => (
                  <RichTextEditor
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    invalid={Boolean(errors.body)}
                    label={`${content.title} body`}
                    placeholder="Write the page content…"
                    minHeightClassName="min-h-[280px] max-h-[min(60vh,520px)] overflow-y-auto"
                  />
                )}
              />
              {errors.body ? (
                <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                  {errors.body.message}
                </p>
              ) : null}
            </Field>
          </div>
        ) : (
          <div>
            <div className="relative">
              <div
                ref={previewRef}
                id={previewId}
                className={cn('overflow-x-hidden', expanded ? '' : 'max-h-[7.5rem] overflow-hidden')}
              >
                <RichTextView
                  html={content.body}
                  label={`${content.title} preview`}
                  className="border-0 bg-transparent p-0"
                />
              </div>
              {!expanded && overflows ? (
                <div
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-[56px] bg-gradient-to-t from-card to-transparent"
                  aria-hidden
                />
              ) : null}
            </div>
            {overflows ? (
              <button
                type="button"
                className="mt-[10px] cursor-pointer border-0 bg-transparent p-0 font-body text-[14px] font-bold text-primary-dark hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                aria-expanded={expanded}
                aria-controls={previewId}
                onClick={() => setExpanded((value) => !value)}
              >
                {expanded ? 'Show less' : 'Show more'}
              </button>
            ) : null}
          </div>
        )}

        {updateContent.error ? (
          <p className="mt-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
            {getApiErrorMessage(updateContent.error)}
          </p>
        ) : null}
      </form>
    </Panel>
  )
}
