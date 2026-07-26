import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

import type { PageMeta } from '@/app/api/types'
import { cn } from '@/util/cn'
import { buildPageItems, formatPageRange } from '@/util/pagination'

const DEFAULT_PAGE_SIZES = [10, 20, 50] as const
const OTHER_VALUE = 'other'
const MIN_CUSTOM_SIZE = 1
const MAX_CUSTOM_SIZE = 100

export interface TablePaginationProps {
  meta: Pick<PageMeta, 'page' | 'size' | 'totalElements' | 'totalPages'>
  onPageChange: (page: number) => void
  /** Always provide so every table exposes the same rows-per-page control. */
  onPageSizeChange: (size: number) => void
  pageSizes?: readonly number[]
  /** Inclusive max for the Other custom size (default 100). */
  maxPageSize?: number
  busy?: boolean
  className?: string
  /** Accessible name for the nav landmark, e.g. "Users pagination". */
  label?: string
  /** Optional id of the table/list this pager controls (`aria-controls`). */
  controlsId?: string
}

export function TablePagination({
  meta,
  onPageChange,
  onPageSizeChange,
  pageSizes = DEFAULT_PAGE_SIZES,
  maxPageSize = MAX_CUSTOM_SIZE,
  busy = false,
  className,
  label = 'Table pagination',
  controlsId,
}: TablePaginationProps) {
  const rowsId = useId()
  const customId = useId()
  const statusId = useId()
  const customInputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.max(meta.totalPages, 1)
  const page = Math.min(Math.max(meta.page || 1, 1), totalPages)
  const size = meta.size || pageSizes[0] || 20
  const isPresetSize = pageSizes.includes(size)
  const [customMode, setCustomMode] = useState(!isPresetSize)
  const [customDraft, setCustomDraft] = useState(String(size))

  useEffect(() => {
    if (pageSizes.includes(size)) {
      setCustomMode(false)
      setCustomDraft(String(size))
      return
    }
    setCustomMode(true)
    setCustomDraft(String(size))
  }, [size, pageSizes])

  useEffect(() => {
    if (!customMode) return
    customInputRef.current?.focus()
    customInputRef.current?.select()
  }, [customMode])

  const totalElements = meta.totalElements ?? 0
  const range = formatPageRange(page, size, totalElements)
  const pageItems = buildPageItems(page, totalPages)
  const canPrev = page > 1 && totalElements > 0
  const canNext = page < totalPages && totalElements > 0
  const totalLabel = new Intl.NumberFormat('en').format(totalElements)
  const selectValue = customMode || !isPresetSize ? OTHER_VALUE : String(size)

  const statusText =
    totalElements === 0
      ? 'No results.'
      : `Showing ${range} of ${totalLabel}. Page ${page} of ${totalPages}.`

  const applyCustomSize = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    if (!Number.isFinite(parsed)) {
      setCustomDraft(String(size))
      return
    }
    const next = Math.min(maxPageSize, Math.max(MIN_CUSTOM_SIZE, parsed))
    setCustomDraft(String(next))
    if (next !== size) onPageSizeChange(next)
  }

  return (
    <nav
      aria-label={label}
      aria-controls={controlsId}
      aria-describedby={statusId}
      className={cn(
        'mt-[14px] flex flex-wrap items-center justify-between gap-x-[16px] gap-y-[10px] rounded-[16px] border-[1.5px] border-border bg-card px-[14px] py-[10px]',
        className,
      )}
    >
      <p id={statusId} className="sr-only" aria-live="polite" aria-atomic="true">
        {busy ? 'Updating results…' : statusText}
      </p>

      <div className="flex min-w-0 flex-wrap items-center gap-x-[14px] gap-y-[8px] text-[12.5px] text-muted-foreground">
        <span className="whitespace-nowrap" aria-hidden={totalElements > 0}>
          {totalElements === 0 ? (
            'No results'
          ) : (
            <>
              Showing <b className="font-semibold text-foreground">{range}</b> of{' '}
              <b className="font-semibold text-foreground">{totalLabel}</b>
            </>
          )}
        </span>

        <div className="flex items-center gap-[8px]">
          <label htmlFor={rowsId} className="whitespace-nowrap text-subtle">
            Rows
          </label>

          <div
            className={cn(
              'inline-flex h-[34px] items-stretch overflow-hidden rounded-[10px] border-[1.5px] border-border bg-card',
              'focus-within:border-primary',
              busy && 'opacity-60',
            )}
          >
            <select
              id={rowsId}
              aria-label="Rows per page"
              disabled={busy}
              value={selectValue}
              className={cn(
                'h-full appearance-none border-none bg-transparent px-[12px] pr-[28px] font-body text-[12.5px] font-semibold text-foreground outline-none',
                'bg-[length:12px] bg-[right_10px_center] bg-no-repeat',
                "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 fill=%22%2364748B%22%3E%3Cpath d=%22M3 4.5 6 8l3-3.5%22/%3E%3C/svg%3E')]",
                customMode ? 'min-w-[78px]' : 'min-w-[64px]',
              )}
              onChange={(event) => {
                const value = event.target.value
                if (value === OTHER_VALUE) {
                  setCustomMode(true)
                  setCustomDraft(isPresetSize ? '' : String(size))
                  return
                }
                setCustomMode(false)
                onPageSizeChange(Number(value))
              }}
            >
              {pageSizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value={OTHER_VALUE}>Other</option>
            </select>

            {customMode ? (
              <>
                <span className="w-px self-stretch bg-border" aria-hidden />
                <label htmlFor={customId} className="sr-only">
                  Custom rows per page
                </label>
                <input
                  ref={customInputRef}
                  id={customId}
                  type="number"
                  inputMode="numeric"
                  min={MIN_CUSTOM_SIZE}
                  max={maxPageSize}
                  step={1}
                  placeholder="…"
                  value={customDraft}
                  disabled={busy}
                  aria-label={`Custom rows per page, between ${MIN_CUSTOM_SIZE} and ${maxPageSize}`}
                  className="h-full w-[56px] border-none bg-transparent px-[10px] text-center font-body text-[12.5px] font-semibold text-foreground outline-none placeholder:text-subtle"
                  onChange={(event) => setCustomDraft(event.target.value)}
                  onBlur={() => applyCustomSize(customDraft)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      applyCustomSize(customDraft)
                      ;(event.target as HTMLInputElement).blur()
                    }
                  }}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-[6px]" role="group" aria-label="Page navigation">
        <PaginationButton
          aria-label="Go to previous page"
          disabled={!canPrev || busy}
          onClick={() => onPageChange(page - 1)}
        >
          ←
        </PaginationButton>

        {pageItems.map((item, index) =>
          item === '…' ? (
            <span
              key={`ellipsis-${index}`}
              className="px-[4px] text-[12.5px] font-semibold text-subtle"
              aria-hidden
            >
              …
            </span>
          ) : (
            <PaginationButton
              key={item}
              aria-label={item === page ? `Page ${item}, current page` : `Go to page ${item}`}
              aria-current={item === page ? 'page' : undefined}
              active={item === page}
              disabled={busy || totalElements === 0}
              onClick={() => onPageChange(item)}
            >
              {item}
            </PaginationButton>
          ),
        )}

        <PaginationButton
          aria-label="Go to next page"
          disabled={!canNext || busy}
          onClick={() => onPageChange(page + 1)}
        >
          →
        </PaginationButton>
      </div>
    </nav>
  )
}

interface PaginationButtonProps {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  'aria-label': string
  'aria-current'?: 'page'
}

function PaginationButton({
  children,
  onClick,
  disabled,
  active,
  ...aria
}: PaginationButtonProps) {
  return (
    <button
      type="button"
      {...aria}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-[10px] border-[1.5px] px-[8px] text-[12.5px] font-semibold transition',
        'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]',
        'disabled:cursor-not-allowed disabled:opacity-45',
        active
          ? 'border-primary bg-primary text-primary-foreground shadow-[0_2px_8px_rgba(34,197,94,0.28)]'
          : 'border-border bg-card text-foreground hover:bg-muted',
      )}
    >
      {children}
    </button>
  )
}
