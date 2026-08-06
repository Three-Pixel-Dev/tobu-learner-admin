import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { Field } from '@/components/common/field'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Switch } from '@/components/common/switch'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JlptLevelsSkeleton } from '@/features/jlpt-levels/components/jlpt-levels-skeleton'
import { useClientPagination } from '@/hooks/use-client-pagination'
import {
  useCreateJlptLevelMutation,
  useJlptLevelsQuery,
  useRestoreJlptLevelMutation,
  useSetJlptLevelHotMutation,
  useSetJlptLevelUnlockedMutation,
  useSoftDeleteJlptLevelMutation,
  useUpdateJlptLevelMutation,
} from '@/shared/queries/jlpt-level.query'
import type { JlptLevelDto } from '@/shared/services/jlpt-level.service'
import { cn } from '@/util/cn'

const ROW_GRID =
  'grid grid-cols-[90px_1.4fr_0.8fr_1fr_0.9fr_140px] items-center gap-[14px] px-[20px] py-[16px] text-[13px] max-md:grid-cols-1'

const codeFieldSchema = z
  .string()
  .trim()
  .min(1, 'Code is required')
  .max(30, 'Code is too long')
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/, 'Use letters, numbers, hyphens, or underscores')

const createSchema = z.object({
  code: codeFieldSchema,
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  nameMm: z.string().trim().min(1, 'Myanmar name is required').max(150, 'Myanmar name is too long'),
})

const editSchema = z.object({
  code: codeFieldSchema,
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  nameMm: z.string().trim().min(1, 'Myanmar name is required').max(150, 'Myanmar name is too long'),
})

type CreateFormValues = z.infer<typeof createSchema>
type EditFormValues = z.infer<typeof editSchema>

interface PendingAccessChange {
  id: number
  code: string
}

interface PendingFeatureChange {
  id: number
  code: string
  hot: boolean
}

interface PendingDisable {
  id: number
  code: string
}

export function JlptLevelsPage() {
  const levelsQuery = useJlptLevelsQuery()
  const createLevel = useCreateJlptLevelMutation()
  const updateLevel = useUpdateJlptLevelMutation()
  const setUnlocked = useSetJlptLevelUnlockedMutation()
  const setHot = useSetJlptLevelHotMutation()
  const softDelete = useSoftDeleteJlptLevelMutation()
  const restore = useRestoreJlptLevelMutation()

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<JlptLevelDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingLock, setPendingLock] = useState<PendingAccessChange | null>(null)
  const [pendingUnlock, setPendingUnlock] = useState<PendingAccessChange | null>(null)
  const [pendingFeature, setPendingFeature] = useState<PendingFeatureChange | null>(null)
  const [pendingDisable, setPendingDisable] = useState<PendingDisable | null>(null)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { code: '', name: '', nameMm: '' },
  })

  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: { code: '', name: '', nameMm: '' },
  })

  const levels = levelsQuery.data ?? []
  const pagination = useClientPagination(levels, 10)

  if (levelsQuery.isLoading && !levelsQuery.data) {
    return <JlptLevelsSkeleton />
  }

  if (levelsQuery.isError) {
    return (
      <>
        <PageHeader
          title="JLPT Levels"
          subtitle="Manage proficiency levels learners progress through, and control which are unlocked."
        />
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(levelsQuery.error, 'Failed to load JLPT levels.')}
        </p>
      </>
    )
  }

  const openCreate = () => {
    setEditing(null)
    createForm.reset({ code: '', name: '', nameMm: '' })
    setCreateOpen(true)
  }

  const openEdit = (level: JlptLevelDto) => {
    setCreateOpen(false)
    setEditing(level)
    editForm.reset({ code: level.code, name: level.name, nameMm: level.nameMm ?? '' })
  }

  const closeCreate = () => {
    setCreateOpen(false)
    createForm.reset({ code: '', name: '', nameMm: '' })
  }

  const closeEdit = () => {
    setEditing(null)
    editForm.reset({ code: '', name: '', nameMm: '' })
  }

  const isCodeTaken = (code: string, excludeId?: number) => {
    const normalized = code.trim().toUpperCase()
    return (levelsQuery.data ?? []).some(
      (level) => level.code.toUpperCase() === normalized && level.id !== excludeId,
    )
  }

  const onCreate = createForm.handleSubmit((values) => {
    const code = values.code.trim().toUpperCase()
    if (isCodeTaken(code)) {
      createForm.setError('code', { type: 'manual', message: `Code ${code} already exists` })
      return
    }
    createLevel.mutate(
      { code, name: values.name.trim(), nameMm: values.nameMm.trim() },
      {
        onSuccess: (created) => {
          closeCreate()
          setToast(`${created.code} added as locked.`)
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  const onEdit = editForm.handleSubmit((values) => {
    if (!editing) return
    const code = values.code.trim().toUpperCase()
    if (isCodeTaken(code, editing.id)) {
      editForm.setError('code', { type: 'manual', message: `Code ${code} already exists` })
      return
    }
    updateLevel.mutate(
      {
        id: editing.id,
        payload: { code, name: values.name.trim(), nameMm: values.nameMm.trim() },
      },
      {
        onSuccess: (updated) => {
          closeEdit()
          setToast(`${updated.code} updated.`)
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  return (
    <>
      <PageHeader
        title="JLPT Levels"
        subtitle="Manage proficiency levels learners progress through, and control which are unlocked."
      >
        <Button type="button" onClick={openCreate}>
          ＋ Add level
        </Button>
      </PageHeader>

      <div className="mb-[20px] flex items-start gap-[10px] rounded-[14px] border border-[#7DD3FC] bg-info-soft px-[16px] py-[12px] text-[12.5px] text-info-foreground">
        <span aria-hidden>💡</span>
        <span>
          Use standard codes like N5–N1, or add custom levels (e.g. code <strong>BIZ</strong>, name
          “Business English”). Locking hides a level from the learner picker without deleting progress.
        </span>
      </div>

      <div
        id="jlpt-levels-table"
        className="overflow-hidden rounded-[22px] bg-card shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
        role="table"
        aria-label="JLPT levels"
        aria-rowcount={levels.length}
      >
        <div
          className={cn(
            ROW_GRID,
            'bg-surface py-[12px] text-[10.5px] font-bold uppercase text-subtle max-md:hidden',
          )}
          role="row"
        >
          <div role="columnheader">Code</div>
          <div role="columnheader">Name</div>
          <div role="columnheader">Content</div>
          <div role="columnheader">Access</div>
          <div role="columnheader">Featured</div>
          <div role="columnheader" className="text-right">
            Actions
          </div>
        </div>

        {levels.length === 0 ? (
          <div className="px-[20px] py-[28px] text-center text-[13px] text-muted-foreground">
            No levels yet. Add N5–N1 or a custom level to get started.
          </div>
        ) : null}

        {pagination.items.map((level) => (
          <div
            key={level.id}
            className={cn(ROW_GRID, 'border-t border-muted', level.deleted && 'opacity-55')}
            role="row"
          >
            <div
              className={cn(
                'rounded-[10px] py-[6px] text-center font-display text-[14px] font-bold',
                level.deleted ? 'bg-muted text-muted-foreground' : 'bg-primary-soft text-primary-dark',
              )}
            >
              {level.deleted ? '—' : level.code}
            </div>
            <div>
              <div className="text-[14px] font-semibold">
                {level.name}
                {level.deleted ? (
                  <span className="ml-[8px] rounded-[20px] bg-muted px-[9px] py-[3px] text-[11px] font-bold text-muted-foreground">
                    Disabled
                  </span>
                ) : null}
              </div>
              <div className="mt-[1px] text-[11.5px] text-muted-foreground">
                {level.nameMm?.trim() ? level.nameMm : 'No Myanmar name'}
              </div>
            </div>
            <div className="text-[13px] text-muted-foreground">
              <b className="text-foreground">{level.lessonCount}</b> lessons
            </div>
            <div className="flex items-center gap-[8px]">
              {level.deleted ? (
                <span className="text-[12.5px] font-semibold text-muted-foreground">—</span>
              ) : (
                <>
                  <Switch
                    checked={level.unlocked}
                    label={`Unlock ${level.name} for learners`}
                    disabled={setUnlocked.isPending}
                    onCheckedChange={(next) => {
                      if (level.unlocked && !next) {
                        setPendingLock({ id: level.id, code: level.code })
                        return
                      }
                      if (!level.unlocked && next) {
                        setPendingUnlock({ id: level.id, code: level.code })
                      }
                    }}
                  />
                  <span
                    className={cn(
                      'text-[12.5px] font-semibold',
                      level.unlocked ? 'text-primary-dark' : 'text-muted-foreground',
                    )}
                  >
                    {level.unlocked ? 'Unlocked' : 'Locked'}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-[8px]">
              {level.deleted ? (
                <span className="text-[12.5px] font-semibold text-muted-foreground">—</span>
              ) : (
                <>
                  <Switch
                    checked={level.hot}
                    label={`Feature ${level.name}`}
                    disabled={setHot.isPending}
                    onCheckedChange={(next) => {
                      setPendingFeature({ id: level.id, code: level.code, hot: next })
                    }}
                  />
                  <span
                    className={cn(
                      'text-[12.5px] font-semibold',
                      level.hot ? 'text-primary-dark' : 'text-muted-foreground',
                    )}
                  >
                    {level.hot ? 'Featured' : 'Normal'}
                  </span>
                </>
              )}
            </div>
            <div className="flex justify-end">
              {level.deleted ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="px-[12px] py-[7px] text-[12.5px]"
                  disabled={restore.isPending}
                  onClick={() => {
                    restore.mutate(level.id, {
                      onSuccess: () => setToast(`Restored ${level.name}`),
                      onError: (error) => setToast(getApiErrorMessage(error)),
                    })
                  }}
                >
                  ↺ Restore
                </Button>
              ) : (
                <ActionMenu
                  label={`Actions for ${level.code}`}
                  items={[
                    {
                      id: 'edit',
                      label: 'Edit',
                      onSelect: () => openEdit(level),
                    },
                    {
                      id: 'disable',
                      label: 'Disable',
                      tone: 'danger',
                      onSelect: () => setPendingDisable({ id: level.id, code: level.code }),
                    },
                  ]}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      <TablePagination
        label="JLPT levels pagination"
        controlsId="jlpt-levels-table"
        meta={pagination.meta}
        busy={levelsQuery.isFetching}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />

      <FormDialog
        open={createOpen}
        title="Add level"
        description="New levels start locked. Add an English name and Myanmar subtitle for the learner app."
        onClose={() => {
          if (!createLevel.isPending) closeCreate()
        }}
      >
        <form onSubmit={onCreate} className="flex flex-col gap-[14px]" noValidate>
          <Field label="Code">
            <Input
              placeholder="e.g. BIZ"
              aria-invalid={Boolean(createForm.formState.errors.code)}
              {...createForm.register('code')}
            />
            {createForm.formState.errors.code ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.code.message}
              </p>
            ) : (
              <p className="mt-[5px] text-[11.5px] text-muted-foreground">
                Letters, numbers, hyphens, underscores. Saved in uppercase.
              </p>
            )}
          </Field>
          <Field label="Display name">
            <Input
              placeholder="e.g. JLPT N5"
              aria-invalid={Boolean(createForm.formState.errors.name)}
              {...createForm.register('name')}
            />
            {createForm.formState.errors.name ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.name.message}
              </p>
            ) : null}
          </Field>
          <Field label="Myanmar name">
            <Input
              placeholder="e.g. အခြေခံ အဆင့် ၁"
              aria-invalid={Boolean(createForm.formState.errors.nameMm)}
              {...createForm.register('nameMm')}
            />
            {createForm.formState.errors.nameMm ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {createForm.formState.errors.nameMm.message}
              </p>
            ) : (
              <p className="mt-[5px] text-[11.5px] text-muted-foreground">
                Shown under the level title in the mobile app.
              </p>
            )}
          </Field>
          <div className="flex justify-end gap-[10px] pt-[4px]">
            <Button type="button" variant="ghost" onClick={closeCreate} disabled={createLevel.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createLevel.isPending}>
              {createLevel.isPending ? 'Adding…' : 'Add level'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <FormDialog
        open={editing != null}
        title={editing ? `Edit ${editing.code}` : 'Edit level'}
        description="Update the code, English name, and Myanmar subtitle."
        onClose={() => {
          if (!updateLevel.isPending) closeEdit()
        }}
      >
        <form onSubmit={onEdit} className="flex flex-col gap-[14px]" noValidate>
          <Field label="Code">
            <Input
              placeholder="e.g. N5"
              aria-invalid={Boolean(editForm.formState.errors.code)}
              {...editForm.register('code')}
            />
            {editForm.formState.errors.code ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {editForm.formState.errors.code.message}
              </p>
            ) : (
              <p className="mt-[5px] text-[11.5px] text-muted-foreground">
                Letters, numbers, hyphens, underscores. Saved in uppercase.
              </p>
            )}
          </Field>
          <Field label="Display name">
            <Input
              placeholder="e.g. JLPT N5"
              aria-invalid={Boolean(editForm.formState.errors.name)}
              {...editForm.register('name')}
            />
            {editForm.formState.errors.name ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {editForm.formState.errors.name.message}
              </p>
            ) : null}
          </Field>
          <Field label="Myanmar name">
            <Input
              placeholder="e.g. အခြေခံ အဆင့် ၁"
              aria-invalid={Boolean(editForm.formState.errors.nameMm)}
              {...editForm.register('nameMm')}
            />
            {editForm.formState.errors.nameMm ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                ⚠ {editForm.formState.errors.nameMm.message}
              </p>
            ) : (
              <p className="mt-[5px] text-[11.5px] text-muted-foreground">
                Shown under the level title in the mobile app.
              </p>
            )}
          </Field>
          <div className="flex justify-end gap-[10px] pt-[4px]">
            <Button type="button" variant="ghost" onClick={closeEdit} disabled={updateLevel.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateLevel.isPending}>
              {updateLevel.isPending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <ConfirmDialog
        open={pendingLock != null}
        tone="primary"
        icon="🔒"
        title={pendingLock ? `Lock ${pendingLock.code}?` : 'Lock level?'}
        description="Learners will no longer see this level in the level picker. Anyone currently studying it keeps their existing streak, XP and progress."
        cancelLabel="Cancel"
        confirmLabel="Yes, lock it"
        busy={setUnlocked.isPending}
        onCancel={() => {
          if (!setUnlocked.isPending) setPendingLock(null)
        }}
        onConfirm={() => {
          if (!pendingLock) return
          setUnlocked.mutate(
            { id: pendingLock.id, unlocked: false },
            {
              onSuccess: () => {
                setToast(`${pendingLock.code} locked.`)
                setPendingLock(null)
              },
              onError: (error) => setToast(getApiErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={pendingUnlock != null}
        tone="primary"
        icon="🔓"
        title={pendingUnlock ? `Unlock ${pendingUnlock.code}?` : 'Unlock level?'}
        description="Learners will see this level in the level picker and can start studying it. Make sure its lessons are ready before unlocking."
        cancelLabel="Cancel"
        confirmLabel="Yes, unlock it"
        busy={setUnlocked.isPending}
        onCancel={() => {
          if (!setUnlocked.isPending) setPendingUnlock(null)
        }}
        onConfirm={() => {
          if (!pendingUnlock) return
          setUnlocked.mutate(
            { id: pendingUnlock.id, unlocked: true },
            {
              onSuccess: () => {
                setToast(`${pendingUnlock.code} unlocked for learners.`)
                setPendingUnlock(null)
              },
              onError: (error) => setToast(getApiErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={pendingFeature != null}
        tone="primary"
        icon={pendingFeature?.hot ? '⭐' : '☆'}
        title={
          pendingFeature
            ? pendingFeature.hot
              ? `Feature ${pendingFeature.code}?`
              : `Remove featured from ${pendingFeature.code}?`
            : 'Update featured?'
        }
        description={
          pendingFeature?.hot
            ? 'This level will be highlighted as featured in the learner app. Any other featured level will be cleared automatically.'
            : 'This level will no longer show as featured in the learner app.'
        }
        cancelLabel="Cancel"
        confirmLabel={pendingFeature?.hot ? 'Yes, feature it' : 'Yes featured'}
        busy={setHot.isPending}
        onCancel={() => {
          if (!setHot.isPending) setPendingFeature(null)
        }}
        onConfirm={() => {
          if (!pendingFeature) return
          setHot.mutate(
            { id: pendingFeature.id, hot: pendingFeature.hot },
            {
              onSuccess: () => {
                setToast(
                  pendingFeature.hot
                    ? `${pendingFeature.code} marked as featured.`
                    : `${pendingFeature.code} set to normal.`,
                )
                setPendingFeature(null)
              },
              onError: (error) => setToast(getApiErrorMessage(error)),
            },
          )
        }}
      />

      <ConfirmDialog
        open={pendingDisable != null}
        tone="danger"
        icon="⚠"
        title={pendingDisable ? `Disable ${pendingDisable.code}?` : 'Disable level?'}
        description="You can restore it later from the disabled row at the bottom of the list."
        cancelLabel="Cancel"
        confirmLabel="Disable level"
        busy={softDelete.isPending}
        onCancel={() => {
          if (!softDelete.isPending) setPendingDisable(null)
        }}
        onConfirm={() => {
          if (!pendingDisable) return
          softDelete.mutate(pendingDisable.id, {
            onSuccess: () => {
              setToast(`${pendingDisable.code} disabled. You can restore it anytime.`)
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
