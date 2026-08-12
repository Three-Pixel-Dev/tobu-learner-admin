import { useDeferredValue, useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { TablePagination } from '@/components/common/table-pagination'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { Select } from '@/components/ui/select'
import { ReportsSkeleton } from '@/features/reports/components/reports-skeleton'
import { useUserReportsPageQuery } from '@/shared/queries/report.query'
import {
  REPORT_CATEGORY_CODES,
  REPORT_ENTITY_TYPES,
  REPORT_ISSUE_CODES,
  type ReportCategoryCode,
  type ReportEntityType,
  type ReportIssueCode,
  type UserReportDto,
} from '@/shared/services/report.service'
import { cn } from '@/util/cn'
import { formatRelativeTime } from '@/util/relative-time'

const ROW_GRID =
  'grid grid-cols-[0.5fr_1.2fr_0.9fr_0.7fr_0.7fr_2fr] items-center gap-[10px] px-[14px] py-[11px] text-[12.5px] max-lg:grid-cols-1'

function entityTypeLabel(code: string): string {
  return REPORT_ENTITY_TYPES.find((item) => item.value === code)?.label ?? code
}

function categoryLabel(code: string | null): string {
  if (!code) return '—'
  return REPORT_CATEGORY_CODES.find((item) => item.value === code)?.label ?? code
}

function issueLabel(code: string | null | undefined): string {
  if (!code) return '—'
  return REPORT_ISSUE_CODES.find((item) => item.value === code)?.label ?? code
}

function formatTarget(row: UserReportDto): string {
  if (row.entityType === 'SYSTEM') return 'App / settings'
  const parts = [entityTypeLabel(row.entityType)]
  if (row.entityId != null) parts.push(`#${row.entityId}`)
  if (row.categoryCode) parts.push(`(${categoryLabel(row.categoryCode)})`)
  return parts.join(' ')
}

function formatReportSubtitle(total: number | undefined): string {
  if (total == null) return 'Loading learner reports…'
  const formatted = new Intl.NumberFormat('en').format(total)
  return `${formatted} report${total === 1 ? '' : 's'} from learners`
}

export function ReportsPage() {
  const [search, setSearch] = useState('')
  const [entityType, setEntityType] = useState<ReportEntityType | ''>('')
  const [categoryCode, setCategoryCode] = useState<ReportCategoryCode | ''>('')
  const [issueCode, setIssueCode] = useState<ReportIssueCode | ''>('')
  const [userIdInput, setUserIdInput] = useState('')
  const [entityIdInput, setEntityIdInput] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const deferredSearch = useDeferredValue(search.trim())
  const parsedUserId = userIdInput.trim() ? Number.parseInt(userIdInput.trim(), 10) : undefined
  const parsedEntityId = entityIdInput.trim() ? Number.parseInt(entityIdInput.trim(), 10) : undefined

  const request = useMemo(
    () => ({
      pageNumber,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      filter: {
        search: deferredSearch || undefined,
        entityType: entityType || undefined,
        categoryCode: categoryCode || undefined,
        issueCode: issueCode || undefined,
        userId: Number.isFinite(parsedUserId) ? parsedUserId : undefined,
        entityId: Number.isFinite(parsedEntityId) ? parsedEntityId : undefined,
      },
    }),
    [pageNumber, pageSize, deferredSearch, entityType, categoryCode, issueCode, parsedUserId, parsedEntityId],
  )

  const reportsQuery = useUserReportsPageQuery(request)

  if (reportsQuery.isLoading && !reportsQuery.data) {
    return <ReportsSkeleton />
  }

  if (reportsQuery.isError) {
    return (
      <>
        <PageHeader title="Content reports" subtitle="Learner feedback on lessons and content" />
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(reportsQuery.error, 'Failed to load reports.')}
        </p>
      </>
    )
  }

  const rows = reportsQuery.data?.data ?? []
  const meta = reportsQuery.data?.meta ?? {
    page: 1,
    size: pageSize,
    totalElements: 0,
    totalPages: 0,
  }

  return (
    <>
      <PageHeader
        title="Content reports"
        subtitle={formatReportSubtitle(meta.totalElements)}
      />

      <div className="mb-[14px] flex flex-wrap items-end gap-[10px]">
        <label className="flex min-w-[140px] flex-col gap-[4px] text-[11px] font-semibold text-muted-foreground">
          Type
          <Select
            value={entityType}
            onChange={(event) => {
              setEntityType(event.target.value as ReportEntityType | '')
              setPageNumber(1)
            }}
          >
            {REPORT_ENTITY_TYPES.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex min-w-[140px] flex-col gap-[4px] text-[11px] font-semibold text-muted-foreground">
          Category
          <Select
            value={categoryCode}
            onChange={(event) => {
              setCategoryCode(event.target.value as ReportCategoryCode | '')
              setPageNumber(1)
            }}
          >
            {REPORT_CATEGORY_CODES.map((option) => (
              <option key={option.value || 'all'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex min-w-[140px] flex-col gap-[4px] text-[11px] font-semibold text-muted-foreground">
          Issue
          <Select
            value={issueCode}
            onChange={(event) => {
              setIssueCode(event.target.value as ReportIssueCode | '')
              setPageNumber(1)
            }}
          >
            {REPORT_ISSUE_CODES.map((option) => (
              <option key={option.value || 'all-issues'} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>

        <label className="flex min-w-[100px] flex-col gap-[4px] text-[11px] font-semibold text-muted-foreground">
          User ID
          <Input
            inputMode="numeric"
            placeholder="Any"
            value={userIdInput}
            onChange={(event) => {
              setUserIdInput(event.target.value)
              setPageNumber(1)
            }}
          />
        </label>

        <label className="flex min-w-[100px] flex-col gap-[4px] text-[11px] font-semibold text-muted-foreground">
          Entity ID
          <Input
            inputMode="numeric"
            placeholder="Any"
            value={entityIdInput}
            onChange={(event) => {
              setEntityIdInput(event.target.value)
              setPageNumber(1)
            }}
          />
        </label>

        <SearchBox
          placeholder="Search reason text"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPageNumber(1)
          }}
          className="min-w-[200px] flex-1"
        />
      </div>

      <Panel className="overflow-hidden p-0">
        {rows.length === 0 ? (
          <div className="px-[20px] py-[50px] text-center">
            <div className="mb-[10px] text-[30px]" aria-hidden>
              🚩
            </div>
            <h3 className="m-0 mb-[6px] text-[15px] font-semibold">No reports yet</h3>
            <p className="m-0 text-[13px] text-muted-foreground">
              Learner reports from the mobile app will appear here.
            </p>
          </div>
        ) : (
          <>
            <div
              className={cn(
                ROW_GRID,
                'border-b border-border/60 bg-muted/50 text-[10.5px] font-bold uppercase tracking-wide text-muted-foreground max-lg:hidden',
              )}
              role="row"
            >
              <span role="columnheader">ID</span>
              <span role="columnheader">Reporter</span>
              <span role="columnheader">Target</span>
              <span role="columnheader">Type</span>
              <span role="columnheader">When</span>
              <span role="columnheader">Reason</span>
            </div>

            <ul id="reports-table" className="m-0 list-none p-0">
              {rows.map((row) => (
                <li
                  key={row.id}
                  className={cn(ROW_GRID, 'border-t border-border/60 first:border-t-0 max-lg:py-[14px]')}
                >
                  <span className="font-mono text-[12px] text-muted-foreground max-lg:font-semibold max-lg:text-foreground">
                    <span className="mr-[6px] text-[10px] uppercase text-muted-foreground lg:hidden">
                      ID
                    </span>
                    {row.id}
                  </span>

                  <div>
                    <span className="mr-[6px] text-[10px] font-bold uppercase text-muted-foreground lg:hidden">
                      Reporter
                    </span>
                    <div className="font-semibold">{row.userName || '—'}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {row.userEmail || `user #${row.userId}`}
                    </div>
                  </div>

                  <div>
                    <span className="mr-[6px] text-[10px] font-bold uppercase text-muted-foreground lg:hidden">
                      Target
                    </span>
                    {formatTarget(row)}
                  </div>

                  <div>
                    <span className="mr-[6px] text-[10px] font-bold uppercase text-muted-foreground lg:hidden">
                      Type
                    </span>
                    <span className="inline-flex rounded-full bg-muted px-[8px] py-[3px] text-[11px] font-semibold">
                      {entityTypeLabel(row.entityType)}
                    </span>
                    {row.categoryCode ? (
                      <span className="ml-[6px] inline-flex rounded-full bg-info-soft px-[8px] py-[3px] text-[11px] font-semibold text-info-foreground">
                        {categoryLabel(row.categoryCode)}
                      </span>
                    ) : null}
                  </div>

                  <div className="text-[12px] text-muted-foreground">
                    <span className="mr-[6px] text-[10px] font-bold uppercase lg:hidden">When</span>
                    {formatRelativeTime(row.createdAt)}
                  </div>

                  <div className="whitespace-pre-wrap text-[13px] leading-snug">
                    <span className="mr-[6px] text-[10px] font-bold uppercase text-muted-foreground lg:hidden">
                      Reason
                    </span>
                    <span className="mb-[6px] inline-flex rounded-full bg-warning-soft px-[8px] py-[3px] text-[11px] font-semibold text-warning-foreground">
                      {issueLabel(row.issueCode)}
                    </span>
                    {row.reason ? (
                      <p className="m-0 mt-[6px] text-[13px]">{row.reason}</p>
                    ) : (
                      <p className="m-0 mt-[6px] text-[12px] text-muted-foreground">—</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </Panel>

      <TablePagination
        className="mt-[14px]"
        meta={meta}
        busy={reportsQuery.isFetching}
        label="Reports pagination"
        controlsId="reports-table"
        onPageChange={setPageNumber}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setPageNumber(1)
        }}
      />
    </>
  )
}
