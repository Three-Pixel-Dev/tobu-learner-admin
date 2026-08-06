import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
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
import type { AppContentDto } from '@/shared/services/content.service'
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
  const updateContent = useUpdateContentMutation()
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
  }, [content.id, content.title, content.body, content.updatedAt, reset])

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
          onSaved('Content saved successfully.')
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

  return (
    <Panel>
      <form onSubmit={onSubmit}>
        <PanelHead>
          <PanelTitle>{editing ? 'Edit content' : content.title}</PanelTitle>
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
            <Button type="button" variant="ghost" onClick={() => setEditing(true)}>
              ✎ Edit
            </Button>
          )}
        </PanelHead>

        {editing ? (
          <div className="flex flex-col gap-[16px]">
            <Field label="Title">
              <Input aria-invalid={Boolean(errors.title)} {...register('title')} />
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
          <RichTextView html={content.body} label={`${content.title} preview`} />
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
