import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { CodesSkeleton } from '@/features/codes/components/codes-skeleton'
import {
  useActivationCodesPageQuery,
  useGenerateActivationCodesMutation,
} from '@/shared/queries/activation-code.query'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import type { ActivationCodeDto, ActivationCodeStatus } from '@/shared/services/activation-code.service'
import { cn } from '@/util/cn'

const ROW_GRID =
  'grid grid-cols-[1.3fr_1.2fr_0.8fr_1fr_0.8fr] items-center gap-[10px] px-[16px] py-[14px] text-[13px] max-md:grid-cols-1'

const STATUS_VARIANT: Record<ActivationCodeStatus, 'success' | 'quiz' | 'danger'> = {
  USED: 'success',
  UNUSED: 'quiz',
  EXPIRED: 'danger',
}

const STATUS_LABEL: Record<ActivationCodeStatus, string> = {
  USED: 'Used',
  UNUSED: 'Unused',
  EXPIRED: 'Expired',
}

const generateSchema = z.object({
  jlptLevelIds: z.array(z.number()).min(1, 'Select at least one JLPT level'),
  durationDays: z.coerce.number().int().min(1, 'Duration must be at least 1 day').max(3650),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(100),
})

type GenerateFormValues = z.infer<typeof generateSchema>

const MAX_VISIBLE_LEVEL_CHIPS = 3

function formatRedeemedSubtitle(count: number | undefined): string {
  if (count == null) return 'Loading codes…'
  const formatted = new Intl.NumberFormat('en').format(count)
  return `${formatted} redeemed this month`
}

function LevelChips({
  levels,
  muted = false,
}: {
  levels: ActivationCodeDto['levels']
  muted?: boolean
}) {
  const visible = levels.slice(0, MAX_VISIBLE_LEVEL_CHIPS)
  const overflow = levels.length - visible.length
  const overflowCodes = levels
    .slice(MAX_VISIBLE_LEVEL_CHIPS)
    .map((level) => level.code)
    .join(', ')

  if (levels.length === 0) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <div className="flex max-w-[220px] flex-wrap gap-[5px]">
      {visible.map((level) => (
        <span
          key={level.id}
          className={cn(
            'rounded-[8px] px-[8px] py-[3px] font-display text-[11px] font-semibold',
            muted ? 'bg-muted text-muted-foreground' : 'bg-info-soft text-info-foreground',
          )}
        >
          {level.code}
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className="rounded-[8px] bg-muted px-[8px] py-[3px] font-display text-[11px] font-semibold text-muted-foreground"
          title={`Also includes ${overflowCodes}`}
        >
          +{overflow} more
        </span>
      ) : null}
    </div>
  )
}

export function CodesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [toast, setToast] = useState<string | null>(null)

  const request = useMemo(
    () => ({
      pageNumber,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
    }),
    [pageNumber, pageSize],
  )

  const codesQuery = useActivationCodesPageQuery(request)
  const levelsQuery = useJlptLevelsQuery()
  const generateCodes = useGenerateActivationCodesMutation()

  const form = useForm<GenerateFormValues>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      jlptLevelIds: [],
      durationDays: 90,
      quantity: 10,
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

  const openGenerateForm = () => {
    const defaults = selectableLevels
      .filter((level) => level.unlocked)
      .slice(0, 2)
      .map((level) => level.id)
    form.reset({
      jlptLevelIds: defaults,
      durationDays: 90,
      quantity: 10,
    })
    setIsFormOpen(true)
  }

  const closeGenerateForm = () => {
    if (!generateCodes.isPending) {
      setIsFormOpen(false)
    }
  }

  if ((codesQuery.isLoading && !codesQuery.data) || (levelsQuery.isLoading && !levelsQuery.data)) {
    return <CodesSkeleton />
  }

  if (codesQuery.isError) {
    return (
      <>
        <PageHeader title="Activation codes" subtitle="Redeemable access codes">
          <Button type="button" onClick={openGenerateForm}>
            ＋ Generate
          </Button>
        </PageHeader>
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(codesQuery.error, 'Failed to load activation codes.')}
        </p>
      </>
    )
  }

  const rows = codesQuery.data?.data ?? []
  const meta = codesQuery.data?.meta

  const onGenerate = form.handleSubmit((values) => {
    generateCodes.mutate(
      {
        jlptLevelIds: values.jlptLevelIds,
        durationDays: values.durationDays,
        quantity: values.quantity,
      },
      {
        onSuccess: (created) => {
          setToast(`Generated ${created.length} code(s).`)
          setIsFormOpen(false)
          form.reset({
            jlptLevelIds: [],
            durationDays: 90,
            quantity: 10,
          })
          setPageNumber(1)
        },
        onError: (error) => setToast(getApiErrorMessage(error)),
      },
    )
  })

  return (
    <>
      <PageHeader title="Activation codes" subtitle={formatRedeemedSubtitle(meta?.redeemedThisMonth)}>
        <Button type="button" onClick={openGenerateForm}>
          ＋ Generate
        </Button>
      </PageHeader>

      <div className="mb-[18px] flex items-start gap-[10px] rounded-[14px] border border-[#7DD3FC] bg-info-soft px-[16px] py-[12px] text-[12.5px] text-info-foreground">
        <span aria-hidden>💡</span>
        <span>
          One code can unlock <strong>several JLPT levels at once</strong> — useful for bundle
          promotions (e.g. “N5 + N4 starter pack”) instead of issuing a separate code per level.
        </span>
      </div>

      <FormDialog
        open={isFormOpen}
        title="Generate activation codes"
        description="Pick every level this code should unlock. Duration applies the same to all selected levels."
        onClose={closeGenerateForm}
        className="w-[min(560px,94vw)]"
      >
        <form onSubmit={onGenerate} className="flex flex-col gap-[18px]" noValidate>
          <fieldset className="m-0 border-none p-0">
            <legend className="mb-[8px] flex w-full items-center justify-between gap-[8px] text-[12.5px] font-semibold text-foreground">
              <span>JLPT levels to include</span>
              <span className="flex gap-[8px]">
                <button
                  type="button"
                  className="text-[11.5px] font-semibold text-primary hover:underline disabled:opacity-50"
                  disabled={generateCodes.isPending}
                  onClick={() => {
                    const unlockedIds = selectableLevels
                      .filter((level) => level.unlocked)
                      .map((level) => level.id)
                    form.setValue('jlptLevelIds', unlockedIds, { shouldValidate: true })
                  }}
                >
                  Select all unlocked
                </button>
                <button
                  type="button"
                  className="text-[11.5px] font-semibold text-muted-foreground hover:underline disabled:opacity-50"
                  disabled={generateCodes.isPending || selectedIds.length === 0}
                  onClick={() => form.setValue('jlptLevelIds', [], { shouldValidate: true })}
                >
                  Clear
                </button>
              </span>
            </legend>
            <Controller
              control={form.control}
              name="jlptLevelIds"
              render={({ field }) => (
                <div
                  className="grid grid-cols-2 gap-[8px] sm:grid-cols-3"
                  role="group"
                  aria-label="JLPT levels to include"
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
                          disabled={locked || generateCodes.isPending}
                          checked={checked}
                          aria-label={`${level.code} ${level.name}${locked ? ' (locked)' : ''}`}
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
                        <span className="mt-[1px] block text-[10px] text-muted-foreground">
                          {locked ? 'Locked' : level.name.replace(/^JLPT\s+/i, '') || level.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
            <p className="mt-[10px] min-h-[16px] text-[12px] text-muted-foreground" role="status">
              {form.formState.errors.jlptLevelIds ? (
                <strong className="text-destructive">
                  {form.formState.errors.jlptLevelIds.message}
                </strong>
              ) : selectedCodes.length === 0 ? (
                <strong className="text-destructive">Select at least one level</strong>
              ) : (
                <>
                  Selected:{' '}
                  <strong className="text-foreground">{selectedCodes.join(', ')}</strong> (
                  {selectedCodes.length} level{selectedCodes.length === 1 ? '' : 's'})
                </>
              )}
            </p>
          </fieldset>

          <div className="grid grid-cols-1 gap-[16px] sm:grid-cols-2">
            <div>
              <label htmlFor="durationDays" className="mb-[6px] block text-[12.5px] font-semibold">
                Duration (days)
              </label>
              <Input
                id="durationDays"
                type="number"
                min={1}
                aria-invalid={Boolean(form.formState.errors.durationDays)}
                {...form.register('durationDays')}
              />
              <p className="mt-[6px] text-[11.5px] text-muted-foreground">
                Applies once — all selected levels expire together.
              </p>
              {form.formState.errors.durationDays ? (
                <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                  {form.formState.errors.durationDays.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="quantity" className="mb-[6px] block text-[12.5px] font-semibold">
                Quantity to generate
              </label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={100}
                aria-invalid={Boolean(form.formState.errors.quantity)}
                {...form.register('quantity')}
              />
              {form.formState.errors.quantity ? (
                <p className="mt-[5px] text-[12px] font-semibold text-destructive" role="alert">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-[10px] pt-[4px]">
            <Button
              type="button"
              variant="ghost"
              disabled={generateCodes.isPending}
              onClick={closeGenerateForm}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={generateCodes.isPending}>
              {generateCodes.isPending ? 'Generating…' : 'Generate codes'}
            </Button>
          </div>
        </form>
      </FormDialog>

      <Panel id="activation-codes-table" className="p-0" role="table" aria-label="Activation codes">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle max-md:hidden',
          )}
          role="row"
        >
          <div role="columnheader">Code</div>
          <div role="columnheader">Levels</div>
          <div role="columnheader">Duration</div>
          <div role="columnheader">Used by</div>
          <div role="columnheader">Status</div>
        </div>

        {rows.length === 0 ? (
          <div className="px-[16px] py-[28px] text-center text-[13px] text-muted-foreground">
            No activation codes yet. Generate a batch to get started.
          </div>
        ) : null}

        {rows.map((code) => (
          <div key={code.id} className={cn(ROW_GRID, 'border-t border-muted')} role="row">
            <div
              className={cn(
                'font-mono font-bold',
                code.status === 'EXPIRED' && 'text-subtle',
              )}
            >
              {code.code}
            </div>
            <div>
              <LevelChips levels={code.levels} muted={code.status === 'EXPIRED'} />
            </div>
            <div>{code.durationDays} days</div>
            <div>{code.usedByName?.trim() || '—'}</div>
            <div>
              <Pill variant={STATUS_VARIANT[code.status]}>{STATUS_LABEL[code.status]}</Pill>
            </div>
          </div>
        ))}
      </Panel>

      {meta ? (
        <TablePagination
          label="Activation codes pagination"
          controlsId="activation-codes-table"
          meta={meta}
          busy={codesQuery.isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPageNumber(1)
          }}
        />
      ) : null}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
