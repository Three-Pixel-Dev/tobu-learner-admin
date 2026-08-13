import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmojiPickerField } from '@/components/common/emoji-picker-field'
import { Field } from '@/components/common/field'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ContentSkeleton } from '@/features/content/components/content-skeleton'
import {
  useCreateJlptExamInfoMutation,
  useJlptExamInfoListQuery,
  useRestoreJlptExamInfoMutation,
  useSoftDeleteJlptExamInfoMutation,
  useUpdateJlptExamInfoMutation,
} from '@/shared/queries/jlpt-exam-info.query'
import type { JlptExamInfoDto } from '@/shared/services/jlpt-exam-info.service'
import { resolveMediaUrl, uploadImage } from '@/shared/services/media.service'
import { cn } from '@/util/cn'

const schema = z.object({
  icon: z.string().trim().max(16).optional(),
  titleMm: z.string().trim().min(1, 'Myanmar title is required').max(200),
  titleEn: z.string().trim().min(1, 'English title is required').max(200),
  bodyMm: z.string().trim().min(1, 'Myanmar body is required'),
  bodyEn: z.string().trim().min(1, 'English body is required'),
  imageUrl: z.string().trim().max(500).optional(),
  sortOrder: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

const emptyValues: FormValues = {
  icon: '📅',
  titleMm: '',
  titleEn: '',
  bodyMm: '',
  bodyEn: '',
  imageUrl: '',
  sortOrder: '',
}

function toPayload(values: FormValues) {
  const sortRaw = values.sortOrder?.trim() ?? ''
  return {
    icon: values.icon?.trim() || null,
    titleMm: values.titleMm.trim(),
    titleEn: values.titleEn.trim(),
    bodyMm: values.bodyMm.trim(),
    bodyEn: values.bodyEn.trim(),
    imageUrl: values.imageUrl?.trim() || null,
    sortOrder: sortRaw ? Number.parseInt(sortRaw, 10) : undefined,
  }
}

function toFormValues(item: JlptExamInfoDto): FormValues {
  return {
    icon: item.icon ?? '',
    titleMm: item.titleMm,
    titleEn: item.titleEn,
    bodyMm: item.bodyMm,
    bodyEn: item.bodyEn,
    imageUrl: item.imageUrl ?? '',
    sortOrder: item.sortOrder != null ? String(item.sortOrder) : '',
  }
}

export function JlptExamInfoPage() {
  const listQuery = useJlptExamInfoListQuery()
  const createMutation = useCreateJlptExamInfoMutation()
  const updateMutation = useUpdateJlptExamInfoMutation()
  const deleteMutation = useSoftDeleteJlptExamInfoMutation()
  const restoreMutation = useRestoreJlptExamInfoMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<JlptExamInfoDto | null>(null)
  const [pendingDisable, setPendingDisable] = useState<JlptExamInfoDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  const items = listQuery.data ?? []
  const subtitle = useMemo(() => {
    const active = items.filter((i) => !i.deleted).length
    return `${active} active card${active === 1 ? '' : 's'} shown in the Learn → JLPT exam info screen`
  }, [items])

  if (listQuery.isLoading && !listQuery.data) {
    return <ContentSkeleton />
  }

  if (listQuery.isError) {
    return (
      <>
        <PageHeader title="JLPT exam info" subtitle="Cards shown in the learner app Learn tab." />
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(listQuery.error, 'Failed to load JLPT exam info.')}
        </p>
      </>
    )
  }

  const openCreate = () => {
    setEditing(null)
    form.reset({ ...emptyValues, sortOrder: String(items.length + 1) })
    setCreateOpen(true)
  }

  const openEdit = (item: JlptExamInfoDto) => {
    setCreateOpen(false)
    setEditing(item)
    form.reset(toFormValues(item))
  }

  const closeDialog = () => {
    setCreateOpen(false)
    setEditing(null)
    form.reset(emptyValues)
  }

  const imageUrl = form.watch('imageUrl')
  const previewUrl = resolveMediaUrl(imageUrl)
  const busy =
    createMutation.isPending || updateMutation.isPending || uploading || deleteMutation.isPending

  const onUploadImage = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const uploaded = await uploadImage(file)
      form.setValue('imageUrl', uploaded.url, { shouldDirty: true })
      setToast('Image uploaded.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Image upload failed.'))
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = form.handleSubmit((values) => {
    const payload = toPayload(values)
    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            closeDialog()
            setToast('Exam info card updated.')
          },
          onError: (err) => setToast(getApiErrorMessage(err, 'Could not update card.')),
        },
      )
      return
    }
    createMutation.mutate(payload, {
      onSuccess: () => {
        closeDialog()
        setToast('Exam info card created.')
      },
      onError: (err) => setToast(getApiErrorMessage(err, 'Could not create card.')),
    })
  })

  const dialogOpen = createOpen || editing != null

  return (
    <>
      <PageHeader title="JLPT exam info" subtitle={subtitle}>
        <Button type="button" onClick={openCreate}>
          + Add card
        </Button>
      </PageHeader>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex flex-wrap items-start justify-between gap-4 rounded-[16px] border border-muted bg-white px-5 py-4',
              item.deleted && 'opacity-60',
            )}
          >
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[18px]">{item.icon || '📄'}</span>
                <strong className="text-[14px] text-foreground">{item.titleEn}</strong>
                <span className="text-[12px] text-muted-foreground">・ {item.titleMm}</span>
                {item.deleted ? (
                  <span className="rounded-full bg-destructive-soft px-2 py-0.5 text-[11px] font-semibold text-destructive">
                    Disabled
                  </span>
                ) : null}
                <span className="text-[11px] text-subtle">Order {item.sortOrder}</span>
              </div>
              <p className="text-[13px] leading-5 text-muted-foreground line-clamp-2">{item.bodyEn}</p>
              {item.imageUrl ? (
                <img
                  src={resolveMediaUrl(item.imageUrl) ?? undefined}
                  alt=""
                  className="mt-1 h-20 w-auto max-w-[220px] rounded-lg object-cover"
                />
              ) : null}
            </div>
            <ActionMenu
              label={`Actions for ${item.titleEn}`}
              items={
                item.deleted
                  ? [
                      {
                        id: 'restore',
                        label: 'Restore',
                        onSelect: () =>
                          restoreMutation.mutate(item.id, {
                            onSuccess: () => setToast('Card restored.'),
                            onError: (err) =>
                              setToast(getApiErrorMessage(err, 'Could not restore.')),
                          }),
                      },
                    ]
                  : [
                      { id: 'edit', label: 'Edit', onSelect: () => openEdit(item) },
                      {
                        id: 'disable',
                        label: 'Disable',
                        tone: 'danger',
                        onSelect: () => setPendingDisable(item),
                      },
                    ]
              }
            />
          </div>
        ))}
        {items.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No exam info cards yet. Add the first one.</p>
        ) : null}
      </div>

      <FormDialog
        open={dialogOpen}
        title={editing ? 'Edit exam info card' : 'Add exam info card'}
        description="Shown on the learner app Learn → JLPT exam info screen (Myanmar + English)."
        onClose={busy ? () => undefined : closeDialog}
      >
        <form className="space-y-4" onSubmit={onSubmit}>
          <EmojiPickerField control={form.control} name="icon" label="Icon" />
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Title (EN)">
              <Input {...form.register('titleEn')} />
              {form.formState.errors.titleEn ? (
                <p className="mt-1 text-[12px] font-semibold text-destructive" role="alert">
                  {form.formState.errors.titleEn.message}
                </p>
              ) : null}
            </Field>
            <Field label="Title (MM)">
              <Input {...form.register('titleMm')} />
              {form.formState.errors.titleMm ? (
                <p className="mt-1 text-[12px] font-semibold text-destructive" role="alert">
                  {form.formState.errors.titleMm.message}
                </p>
              ) : null}
            </Field>
          </div>
          <Field label="Body (EN)">
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-muted bg-white px-3 py-2 text-[13px]"
              {...form.register('bodyEn')}
            />
            {form.formState.errors.bodyEn ? (
              <p className="mt-1 text-[12px] font-semibold text-destructive" role="alert">
                {form.formState.errors.bodyEn.message}
              </p>
            ) : null}
          </Field>
          <Field label="Body (MM)">
            <textarea
              className="min-h-[88px] w-full rounded-xl border border-muted bg-white px-3 py-2 text-[13px]"
              {...form.register('bodyMm')}
            />
            {form.formState.errors.bodyMm ? (
              <p className="mt-1 text-[12px] font-semibold text-destructive" role="alert">
                {form.formState.errors.bodyMm.message}
              </p>
            ) : null}
          </Field>
          <Field label="Sort order">
            <Input type="number" {...form.register('sortOrder')} />
          </Field>
          <Field label="Image (optional)">
            <div className="space-y-2">
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp"
                disabled={busy}
                onChange={(e) => void onUploadImage(e.target.files?.[0])}
                className="block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-semibold"
              />
              <Input placeholder="Or paste image URL" {...form.register('imageUrl')} />
              {previewUrl ? (
                <div className="flex items-start gap-3">
                  <img src={previewUrl} alt="" className="h-24 w-auto max-w-[240px] rounded-lg object-cover" />
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => form.setValue('imageUrl', '', { shouldDirty: true })}
                  >
                    Remove image
                  </Button>
                </div>
              ) : null}
              {uploading ? <p className="text-[12px] text-muted-foreground">Uploading…</p> : null}
            </div>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={closeDialog} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Saving…' : editing ? 'Save changes' : 'Create'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={pendingDisable != null}
        title="Disable this card?"
        description="It will no longer appear in the learner app until restored."
        confirmLabel="Disable"
        onCancel={() => setPendingDisable(null)}
        onConfirm={() => {
          if (!pendingDisable) return
          deleteMutation.mutate(pendingDisable.id, {
            onSuccess: () => {
              setPendingDisable(null)
              setToast('Card disabled.')
            },
            onError: (err) => setToast(getApiErrorMessage(err, 'Could not disable.')),
          })
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
