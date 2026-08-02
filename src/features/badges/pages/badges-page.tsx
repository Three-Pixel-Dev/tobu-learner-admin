import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { EmojiPickerField } from '@/components/common/emoji-picker-field'
import { Field } from '@/components/common/field'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BadgesSkeleton } from '@/features/badges/components/badges-skeleton'
import { useClientPagination } from '@/hooks/use-client-pagination'
import {
  useBadgesQuery,
  useCreateBadgeMutation,
  useRestoreBadgeMutation,
  useSoftDeleteBadgeMutation,
  useUpdateBadgeMutation,
} from '@/shared/queries/badge.query'
import type { BadgeCriteriaType, BadgeDto } from '@/shared/services/badge.service'
import { cn } from '@/util/cn'

const ROW_GRID =
  'grid grid-cols-[56px_1.2fr_1.1fr_0.9fr_0.8fr_0.7fr_120px] items-center gap-[14px] px-[20px] py-[16px] text-[13px] max-md:grid-cols-1'

const CRITERIA_OPTIONS: { value: BadgeCriteriaType | ''; label: string }[] = [
  { value: '', label: 'None (manual award only)' },
  { value: 'STREAK_DAYS', label: 'Streak days' },
  { value: 'TOTAL_XP', label: 'Total XP' },
  { value: 'LESSONS_COMPLETED', label: 'Lessons completed' },
]

const codeFieldSchema = z
  .string()
  .trim()
  .min(1, 'Code is required')
  .max(50, 'Code is too long')
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Use letters, numbers, hyphens, or underscores')

const badgeFieldsSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(150, 'Name is too long'),
    icon: z.string().trim().min(1, 'Pick an emoji icon'),
    descriptionMm: z.string().trim().min(1, 'Myanmar label is required').max(500, 'Label is too long'),
    descriptionEn: z.string().trim().max(500, 'Description is too long').optional(),
    criteriaType: z.enum(['', 'STREAK_DAYS', 'TOTAL_XP', 'LESSONS_COMPLETED']),
    criteriaValue: z.string().optional(),
  })
  .superRefine((values, ctx) => {
    const hasType = values.criteriaType !== ''
    const raw = values.criteriaValue?.trim() ?? ''
    if (hasType && !raw) {
      ctx.addIssue({ code: 'custom', message: 'Criteria value is required', path: ['criteriaValue'] })
      return
    }
    if (!hasType && raw) {
      ctx.addIssue({ code: 'custom', message: 'Select a criteria type', path: ['criteriaType'] })
      return
    }
    if (hasType) {
      const num = Number(raw)
      if (!Number.isInteger(num) || num < 1) {
        ctx.addIssue({
          code: 'custom',
          message: 'Criteria value must be a whole number ≥ 1',
          path: ['criteriaValue'],
        })
      }
    }
  })

const createSchema = badgeFieldsSchema.extend({
  code: codeFieldSchema,
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof badgeFieldsSchema>

interface PendingDisable {
  id: number
  code: string
}

function formatCriteria(type: BadgeCriteriaType | null, value: number | null): string {
  if (!type || value == null) return 'Manual'
  const label = CRITERIA_OPTIONS.find((o) => o.value === type)?.label ?? type
  return `${label} ≥ ${value}`
}

function toPayload(values: CreateFormValues | EditFormValues) {
  const criteriaType = values.criteriaType === '' ? null : values.criteriaType
  const criteriaValue =
    criteriaType && values.criteriaValue?.trim()
      ? Number.parseInt(values.criteriaValue.trim(), 10)
      : null
  return {
    name: values.name.trim(),
    icon: values.icon.trim(),
    descriptionMm: values.descriptionMm.trim(),
    descriptionEn: values.descriptionEn?.trim() || undefined,
    criteriaType,
    criteriaValue,
  }
}

function badgeToFormValues(badge: BadgeDto): EditFormValues {
  return {
    name: badge.name,
    icon: badge.icon ?? '🏅',
    descriptionMm: badge.descriptionMm ?? '',
    descriptionEn: badge.descriptionEn ?? '',
    criteriaType: badge.criteriaType ?? '',
    criteriaValue: badge.criteriaValue != null ? String(badge.criteriaValue) : '',
  }
}

export function BadgesPage() {
  const badgesQuery = useBadgesQuery()
  const createBadge = useCreateBadgeMutation()
  const updateBadge = useUpdateBadgeMutation()
  const softDelete = useSoftDeleteBadgeMutation()
  const restore = useRestoreBadgeMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<BadgeDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingDisable, setPendingDisable] = useState<PendingDisable | null>(null)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      name: '',
      icon: '🏅',
      descriptionMm: '',
      descriptionEn: '',
      criteriaType: '',
      criteriaValue: '',
    },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(badgeFieldsSchema),
    defaultValues: {
      name: '',
      icon: '🏅',
      descriptionMm: '',
      descriptionEn: '',
      criteriaType: '',
      criteriaValue: '',
    },
  })

  const createCriteriaType = createForm.watch('criteriaType')
  const editCriteriaType = editForm.watch('criteriaType')

  const badges = badgesQuery.data ?? []
  const pagination = useClientPagination(badges, 10)

  const subtitle = useMemo(() => {
    const active = badges.filter((b) => !b.disabled).length
    const earnedTotal = badges.reduce((sum, b) => sum + b.usersEarnedCount, 0)
    return `${active} active badge${active === 1 ? '' : 's'} ・ ${earnedTotal} total user awards`
  }, [badges])

  if (badgesQuery.isLoading && !badgesQuery.data) {
    return <BadgesSkeleton />
  }

  if (badgesQuery.isError) {
    return (
      <>
        <PageHeader title="Badges" subtitle="Manage learner achievement badges and track how many users earned each." />
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(badgesQuery.error, 'Failed to load badges.')}
        </p>
      </>
    )
  }

  const openCreate = () => {
    setEditing(null)
    createForm.reset({
      code: '',
      name: '',
      icon: '🏅',
      descriptionMm: '',
      descriptionEn: '',
      criteriaType: '',
      criteriaValue: '',
    })
    setCreateOpen(true)
  }

  const openEdit = (badge: BadgeDto) => {
    setCreateOpen(false)
    setEditing(badge)
    editForm.reset(badgeToFormValues(badge))
  }

  const closeCreate = () => {
    setCreateOpen(false)
    createForm.reset()
  }

  const closeEdit = () => {
    setEditing(null)
    editForm.reset()
  }

  const isCodeTaken = (code: string) => {
    const normalized = code.trim().toUpperCase()
    return badges.some((badge) => badge.code.toUpperCase() === normalized)
  }

  const onCreate = createForm.handleSubmit((values) => {
    const code = values.code.trim().toUpperCase()
    if (isCodeTaken(code)) {
      createForm.setError('code', { type: 'manual', message: `Code ${code} already exists` })
      return
    }
    createBadge.mutate(
      { code, ...toPayload(values) },
      {
        onSuccess: (created) => {
          closeCreate()
          setToast(`${created.name} created.`)
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  const onEdit = editForm.handleSubmit((values) => {
    if (!editing) return
    updateBadge.mutate(
      { id: editing.id, payload: toPayload(values) },
      {
        onSuccess: (updated) => {
          closeEdit()
          setToast(`${updated.name} updated.`)
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  return (
    <>
      <PageHeader title="Badges" subtitle={subtitle}>
        <Button type="button" onClick={openCreate}>
          ＋ Add badge
        </Button>
      </PageHeader>

      <div className="mb-[20px] flex items-start gap-[10px] rounded-[14px] border border-[#7DD3FC] bg-info-soft px-[16px] py-[12px] text-[12.5px] text-info-foreground">
        <span aria-hidden>💡</span>
        <span>
          Criteria fields are metadata for a future auto-award engine. Users earn badges when a row
          exists in <strong>tobu_user_badge</strong> — counts below reflect that table.
        </span>
      </div>

      <div
        id="badges-table"
        className="overflow-hidden rounded-[22px] bg-card shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
        role="table"
        aria-label="Badges"
        aria-rowcount={badges.length}
      >
        <div
          className={cn(
            ROW_GRID,
            'bg-surface py-[12px] text-[10.5px] font-bold uppercase text-subtle max-md:hidden',
          )}
          role="row"
        >
          <div role="columnheader">Icon</div>
          <div role="columnheader">Badge</div>
          <div role="columnheader">Labels</div>
          <div role="columnheader">Criteria</div>
          <div role="columnheader">Users earned</div>
          <div role="columnheader">Status</div>
          <div role="columnheader" className="text-right">
            Actions
          </div>
        </div>

        {badges.length === 0 ? (
          <div className="px-[20px] py-[28px] text-center text-[13px] text-muted-foreground">
            No badges yet. Restart the server to seed defaults, or add one here.
          </div>
        ) : null}

        {pagination.items.map((badge) => (
          <div
            key={badge.id}
            className={cn(ROW_GRID, 'border-t border-muted', badge.disabled && 'opacity-55')}
            role="row"
          >
            <div
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px] bg-surface text-[24px]"
              aria-hidden
            >
              {badge.icon ?? '🏅'}
            </div>
            <div>
              <div className="text-[14px] font-semibold">
                {badge.name}
                {badge.disabled ? (
                  <span className="ml-[8px] rounded-[20px] bg-muted px-[9px] py-[3px] text-[11px] font-bold text-muted-foreground">
                    Disabled
                  </span>
                ) : null}
              </div>
              <div className="mt-[1px] font-mono text-[11px] text-muted-foreground">{badge.code}</div>
            </div>
            <div className="text-[12.5px] text-muted-foreground">
              <div>{badge.descriptionMm?.trim() || '—'}</div>
              {badge.descriptionEn?.trim() ? (
                <div className="mt-[2px] text-[11px]">{badge.descriptionEn}</div>
              ) : null}
            </div>
            <div className="text-[12.5px] text-muted-foreground">
              {formatCriteria(badge.criteriaType, badge.criteriaValue)}
            </div>
            <div className="text-[14px] font-semibold text-foreground">
              {badge.usersEarnedCount.toLocaleString()}
            </div>
            <div className="text-[12.5px] font-semibold text-muted-foreground">
              {badge.disabled ? 'Disabled' : 'Active'}
            </div>
            <div className="flex justify-end">
              {badge.disabled ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-[12px] py-[7px] text-[12.5px]"
                  disabled={restore.isPending}
                  onClick={() => {
                    restore.mutate(badge.id, {
                      onSuccess: () => setToast(`Restored ${badge.name}`),
                      onError: (error) => setToast(getApiErrorMessage(error)),
                    })
                  }}
                >
                  ↺ Restore
                </Button>
              ) : (
                <ActionMenu
                  label={`Actions for ${badge.code}`}
                  items={[
                    { id: 'edit', label: 'Edit', onSelect: () => openEdit(badge) },
                    {
                      id: 'disable',
                      label: 'Disable',
                      tone: 'danger',
                      onSelect: () => setPendingDisable({ id: badge.id, code: badge.code }),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <TablePagination
        label="Badges pagination"
        controlsId="badges-table"
        meta={pagination.meta}
        busy={badgesQuery.isFetching}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <FormDialog
        open={createOpen}
        title="Add badge"
        description="Create a new achievement badge. Pick an emoji and optional auto-award criteria."
        onClose={() => {
          if (!createBadge.isPending) closeCreate()
        }}
        className="w-[min(520px,92vw)]"
      >
        <form onSubmit={onCreate} className="flex flex-col gap-[14px]" noValidate>
          <EmojiPickerField control={createForm.control} name="icon" />
          <Field label="Code">
            <Input
              placeholder="e.g. FIRST_STEP"
              aria-invalid={Boolean(createForm.formState.errors.code)}
              {...createForm.register('code')}
            />
            {createForm.formState.errors.code ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.code.message}
              </p>
            ) : null}
          </Field>
          <Field label="Name (English)">
            <Input
              placeholder="e.g. First Step"
              aria-invalid={Boolean(createForm.formState.errors.name)}
              {...createForm.register('name')}
            />
            {createForm.formState.errors.name ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.name.message}
              </p>
            ) : null}
          </Field>
          <Field label="Label (Myanmar)">
            <Input
              placeholder="e.g. ပထမခြေလှမ်း"
              aria-invalid={Boolean(createForm.formState.errors.descriptionMm)}
              {...createForm.register('descriptionMm')}
            />
            {createForm.formState.errors.descriptionMm ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.descriptionMm.message}
              </p>
            ) : null}
          </Field>
          <Field label="Description (English, optional)">
            <Input placeholder="Optional longer description" {...createForm.register('descriptionEn')} />
          </Field>
          {renderCriteriaFields(
            createForm as unknown as ReturnType<typeof useForm<EditFormValues>>,
            'create',
            createCriteriaType,
          )}
          <div className="flex justify-end gap-[8px] pt-[4px]">
            <Button type="button" variant="ghost" onClick={closeCreate} disabled={createBadge.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createBadge.isPending}>
              {createBadge.isPending ? 'Saving…' : 'Create badge'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <FormDialog
        open={Boolean(editing)}
        title={editing ? `Edit ${editing.name}` : 'Edit badge'}
        description="Code cannot be changed after creation."
        onClose={() => {
          if (!updateBadge.isPending) closeEdit()
        }}
        className="w-[min(520px,92vw)]"
      >
        <form onSubmit={onEdit} className="flex flex-col gap-[14px]" noValidate>
          {editing ? (
            <p className="rounded-[10px] bg-muted px-[12px] py-[8px] font-mono text-[12px] text-muted-foreground">
              Code: {editing.code}
            </p>
          ) : null}
          <EmojiPickerField control={editForm.control} name="icon" />
          <Field label="Name (English)">
            <Input
              aria-invalid={Boolean(editForm.formState.errors.name)}
              {...editForm.register('name')}
            />
            {editForm.formState.errors.name ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {editForm.formState.errors.name.message}
              </p>
            ) : null}
          </Field>
          <Field label="Label (Myanmar)">
            <Input
              aria-invalid={Boolean(editForm.formState.errors.descriptionMm)}
              {...editForm.register('descriptionMm')}
            />
            {editForm.formState.errors.descriptionMm ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {editForm.formState.errors.descriptionMm.message}
              </p>
            ) : null}
          </Field>
          <Field label="Description (English, optional)">
            <Input {...editForm.register('descriptionEn')} />
          </Field>
          {renderCriteriaFields(editForm, 'edit', editCriteriaType)}
          <div className="flex justify-end gap-[8px] pt-[4px]">
            <Button type="button" variant="ghost" onClick={closeEdit} disabled={updateBadge.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateBadge.isPending}>
              {updateBadge.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(pendingDisable)}
        title="Disable badge?"
        description={
          pendingDisable
            ? `${pendingDisable.code} will be hidden from learners. Existing user awards are kept.`
            : ''
        }
        confirmLabel="Disable"
        tone="danger"
        busy={softDelete.isPending}
        onCancel={() => setPendingDisable(null)}
        onConfirm={() => {
          if (!pendingDisable) return
          softDelete.mutate(pendingDisable.id, {
            onSuccess: () => {
              setToast(`Disabled ${pendingDisable.code}`)
              setPendingDisable(null)
            },
            onError: (error) => setToast(getApiErrorMessage(error)),
          })
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}

function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-2 gap-[10px]">{children}</div>
}

function renderCriteriaFields(
  form: ReturnType<typeof useForm<EditFormValues>>,
  idPrefix: string,
  criteriaType: EditFormValues['criteriaType'],
) {
  return (
    <FieldRow>
      <Field label="Criteria type">
        <select
          id={`${idPrefix}-criteria-type`}
          className="h-[40px] w-full rounded-xl border border-border bg-card px-[12px] text-[13px]"
          {...form.register('criteriaType')}
        >
          {CRITERIA_OPTIONS.map((option) => (
            <option key={option.value || 'none'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Criteria value">
        <Input
          type="number"
          min={1}
          placeholder="e.g. 7"
          disabled={criteriaType === ''}
          aria-invalid={Boolean(form.formState.errors.criteriaValue)}
          {...form.register('criteriaValue')}
        />
        {form.formState.errors.criteriaValue ? (
          <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
            ⚠ {form.formState.errors.criteriaValue.message}
          </p>
        ) : null}
      </Field>
    </FieldRow>
  )
}
