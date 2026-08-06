import { zodResolver } from '@hookform/resolvers/zod'
import { useDeferredValue, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import type { UserAdminDto } from '@/app/api/types'
import { Avatar } from '@/components/common/avatar'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { UsersSkeleton } from '@/features/users/components/users-skeleton'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import {
  useCreateUserWithLoginCodeMutation,
  useRestoreUserMutation,
  useSoftDeleteUserMutation,
  useUsersPageQuery,
} from '@/shared/queries/user.query'
import { cn } from '@/util/cn'
import { getInitials } from '@/util/initials'
import { formatRelativeTime } from '@/util/relative-time'

const ROW_GRID = 'grid grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.6fr] items-center px-[14px] py-[11px] text-[12.5px]'

interface PendingRemove {
  id: number
  name: string
}

const createSchema = z.object({
  loginCode: z
    .string()
    .trim()
    .min(4, 'Login code must be at least 4 characters')
    .max(50, 'Login code is too long'),
  jlptLevelIds: z.array(z.number()).min(1, 'Select at least one JLPT level'),
  durationDays: z.number().int().min(1, 'Duration must be at least 1 day').max(3650),
})

type CreateFormValues = z.infer<typeof createSchema>

function formatActiveSubtitle(count: number | undefined): string {
  if (count == null) return 'Loading learners…'
  const formatted = new Intl.NumberFormat('en').format(count)
  return `${formatted} active learner${count === 1 ? '' : 's'}`
}

function toRowView(user: UserAdminDto) {
  const deleted = user.deleted
  const detailParts = [
    deleted ? `removed ${formatRelativeTime(user.updatedAt)}` : user.email,
    user.loginCode ? `code ${user.loginCode}` : null,
  ].filter(Boolean)
  return {
    id: user.id,
    name: deleted ? `${user.name} (deleted)` : user.name,
    displayName: user.name,
    detail: detailParts.join(' · '),
    initials: getInitials(user.name, '?'),
    tone: deleted ? ('danger' as const) : user.id % 2 === 0 ? ('info' as const) : ('primary' as const),
    level: deleted || !user.level ? '—' : user.level,
    streak: deleted ? '—' : `🔥 ${user.currentStreak}`,
    xp: deleted ? '—' : String(user.totalXp),
    deleted,
  }
}

export function UsersPage() {
  const [keyword, setKeyword] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [toast, setToast] = useState<string | null>(null)
  const [pendingRemove, setPendingRemove] = useState<PendingRemove | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const deferredKeyword = useDeferredValue(keyword.trim())

  const request = useMemo(
    () => ({
      pageNumber,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      filter: { keyword: deferredKeyword || undefined },
    }),
    [pageNumber, pageSize, deferredKeyword],
  )

  const usersQuery = useUsersPageQuery(request)
  const levelsQuery = useJlptLevelsQuery()
  const createUser = useCreateUserWithLoginCodeMutation()
  const softDelete = useSoftDeleteUserMutation()
  const restore = useRestoreUserMutation()

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      loginCode: '',
      jlptLevelIds: [],
      durationDays: 90,
    },
  })

  const selectableLevels = useMemo(
    () => (levelsQuery.data ?? []).filter((level) => !level.deleted),
    [levelsQuery.data],
  )
  const selectedIds = form.watch('jlptLevelIds')
  const selectedCodes = selectableLevels
    .filter((level) => selectedIds.includes(level.id))
    .map((level) => level.code)

  const openCreateForm = () => {
    const defaults = selectableLevels
      .filter((level) => level.unlocked)
      .slice(0, 1)
      .map((level) => level.id)
    form.reset({
      loginCode: '',
      jlptLevelIds: defaults,
      durationDays: 90,
    })
    setIsCreateOpen(true)
  }

  const closeCreateForm = () => {
    if (!createUser.isPending) setIsCreateOpen(false)
  }

  const onCreate = form.handleSubmit((values) => {
    createUser.mutate(
      {
        loginCode: values.loginCode,
        jlptLevelIds: values.jlptLevelIds,
        durationDays: values.durationDays,
      },
      {
        onSuccess: (user) => {
          setIsCreateOpen(false)
          setPageNumber(1)
          setToast(
            user.loginCode
              ? `Created ${user.name} — login code ${user.loginCode}`
              : `Created ${user.name}`,
          )
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  if ((usersQuery.isLoading && !usersQuery.data) || (levelsQuery.isLoading && !levelsQuery.data)) {
    return <UsersSkeleton />
  }

  if (usersQuery.isError) {
    return (
      <>
        <PageHeader title="Users" subtitle="Learners">
          <SearchBox
            placeholder="Search by name or email"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPageNumber(1)
            }}
          />
        </PageHeader>
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(usersQuery.error, 'Failed to load users.')}
        </p>
      </>
    )
  }

  const rows = (usersQuery.data?.data ?? []).map(toRowView)
  const meta = usersQuery.data?.meta
  const busyId = softDelete.isPending
    ? softDelete.variables
    : restore.isPending
      ? restore.variables
      : null

  return (
    <>
      <PageHeader title="Users" subtitle={formatActiveSubtitle(meta?.activeCount)}>
        <div className="flex flex-wrap items-center gap-[10px]">
          <SearchBox
            placeholder="Search by name or email"
            value={keyword}
            onChange={(event) => {
              setKeyword(event.target.value)
              setPageNumber(1)
            }}
            aria-label="Search users by name or email"
          />
          <Button type="button" onClick={openCreateForm}>
            ＋ Create login-code user
          </Button>
        </div>
      </PageHeader>

      <div className="mb-[18px] flex items-start gap-[10px] rounded-[14px] border border-[#7DD3FC] bg-info-soft px-[16px] py-[12px] text-[12.5px] text-info-foreground">
        <span aria-hidden>🔑</span>
        <span>
          Pre-create a learner with a <strong>reusable login code</strong> and one or more JLPT
          levels. They log in with that code in the app anytime (like voice-dictation). Batch
          unused codes for self-claim still live under Activation codes.
        </span>
      </div>

      <FormDialog
        open={isCreateOpen}
        title="Create user with login code"
        description="Creates the account now and unlocks the selected JLPT level(s). The learner signs in with this code."
        onClose={closeCreateForm}
        className="w-[min(560px,94vw)]"
      >
        <form onSubmit={onCreate} className="flex flex-col gap-[18px]" noValidate>
          <div>
            <label htmlFor="loginCode" className="mb-[6px] block text-[12.5px] font-semibold">
              Login code
            </label>
            <Input
              id="loginCode"
              placeholder="e.g. TOBU-N4-ABC1"
              autoCapitalize="characters"
              aria-invalid={Boolean(form.formState.errors.loginCode)}
              {...form.register('loginCode', {
                setValueAs: (value) => String(value ?? '').trim().toUpperCase(),
              })}
            />
            {form.formState.errors.loginCode ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                {form.formState.errors.loginCode.message}
              </p>
            ) : null}
          </div>

          <fieldset className="m-0 border-none p-0">
            <legend className="mb-[8px] text-[12.5px] font-semibold text-foreground">
              JLPT levels to unlock
            </legend>
            <Controller
              control={form.control}
              name="jlptLevelIds"
              render={({ field }) => (
                <div
                  className="grid grid-cols-2 gap-[8px] sm:grid-cols-3"
                  role="group"
                  aria-label="JLPT levels to unlock"
                >
                  {selectableLevels.map((level) => {
                    const locked = !level.unlocked
                    const checked = field.value.includes(level.id)
                    return (
                      <label
                        key={level.id}
                        className={cn(
                          'relative cursor-pointer rounded-[12px] border-[1.5px] border-border px-[8px] py-[10px] text-center transition',
                          checked && 'border-primary bg-primary-soft',
                          locked && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <input
                          type="checkbox"
                          className="absolute inset-0 m-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
                          disabled={locked || createUser.isPending}
                          checked={checked}
                          aria-label={`${level.code}${locked ? ' (locked)' : ''}`}
                          onChange={(event) => {
                            if (event.target.checked) {
                              field.onChange([...field.value, level.id])
                            } else {
                              field.onChange(field.value.filter((id) => id !== level.id))
                            }
                          }}
                        />
                        <span
                          className={cn(
                            'block font-display text-[14px] font-bold',
                            checked ? 'text-primary-dark' : 'text-foreground',
                          )}
                        >
                          {level.code}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
            <p className="mt-[10px] text-[12px] text-muted-foreground" role="status">
              {form.formState.errors.jlptLevelIds ? (
                <strong className="text-destructive">
                  {form.formState.errors.jlptLevelIds.message}
                </strong>
              ) : selectedCodes.length === 0 ? (
                <strong className="text-destructive">Select at least one level</strong>
              ) : (
                <>
                  Selected: <strong className="text-foreground">{selectedCodes.join(', ')}</strong>
                </>
              )}
            </p>
          </fieldset>

          <div>
            <label htmlFor="durationDays" className="mb-[6px] block text-[12.5px] font-semibold">
              Duration (days)
            </label>
            <Input
              id="durationDays"
              type="number"
              min={1}
              aria-invalid={Boolean(form.formState.errors.durationDays)}
              {...form.register('durationDays', { valueAsNumber: true })}
            />
            {form.formState.errors.durationDays ? (
              <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                {form.formState.errors.durationDays.message}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end gap-[10px]">
            <Button type="button" variant="ghost" onClick={closeCreateForm} disabled={createUser.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUser.isPending}>
              {createUser.isPending ? 'Creating…' : 'Create user'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <Panel id="users-table" className="p-0" role="table" aria-label="Users">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle',
          )}
          role="row"
        >
          <div>User</div>
          <div>Level</div>
          <div>Streak</div>
          <div>XP</div>
          <div />
        </div>

        {rows.length === 0 ? (
          <div className="px-[14px] py-[28px] text-center text-[13px] text-muted-foreground">
            {deferredKeyword ? 'No users match your search.' : 'No learners yet.'}
          </div>
        ) : null}

        {rows.map((user) => (
          <div key={user.id} className={cn(ROW_GRID, 'border-t border-muted')}>
            <div className="flex items-center gap-[8px]">
              <Avatar initials={user.initials} tone={user.tone} />
              <div>
                <div className={cn('font-semibold', user.deleted && 'text-subtle')}>{user.name}</div>
                <div className="text-[10.5px] text-subtle">{user.detail}</div>
              </div>
            </div>
            <div className={cn('font-semibold', user.deleted && 'font-normal text-disabled')}>
              {user.level}
            </div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.streak}</div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.xp}</div>
            <div>
              {user.deleted ? (
                <IconButton
                  aria-label={`Restore ${user.displayName}`}
                  title="Restore user"
                  disabled={busyId === user.id}
                  onClick={() => {
                    restore.mutate(user.id, {
                      onSuccess: () => setToast('User restored.'),
                      onError: (error) => setToast(getApiErrorMessage(error)),
                    })
                  }}
                >
                  ↺
                </IconButton>
              ) : (
                <IconButton
                  aria-label={`Remove ${user.displayName}`}
                  title="Remove user"
                  disabled={busyId === user.id}
                  onClick={() => setPendingRemove({ id: user.id, name: user.displayName })}
                >
                  ⋯
                </IconButton>
              )}
            </div>
          </div>
        ))}
      </Panel>

      {meta ? (
        <TablePagination
          label="Users pagination"
          controlsId="users-table"
          meta={meta}
          busy={usersQuery.isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPageNumber(1)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={pendingRemove != null}
        tone="danger"
        icon="⚠"
        title={pendingRemove ? `Remove ${pendingRemove.name}?` : 'Remove user?'}
        description="This hides the learner from the app, but nothing is permanently deleted. You can restore them later from this list."
        cancelLabel="Cancel"
        confirmLabel="Remove user"
        busy={softDelete.isPending}
        onCancel={() => {
          if (!softDelete.isPending) setPendingRemove(null)
        }}
        onConfirm={() => {
          if (!pendingRemove) return
          softDelete.mutate(pendingRemove.id, {
            onSuccess: () => {
              setPendingRemove(null)
              setToast('User removed.')
            },
            onError: (error) => setToast(getApiErrorMessage(error)),
          })
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
