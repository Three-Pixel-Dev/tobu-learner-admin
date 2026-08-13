import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import type { ExamResultUserSummaryDto } from '@/app/api/types'
import { TablePagination } from '@/components/common/table-pagination'
import { Panel } from '@/components/ui/panel'
import { FilterChipGroup } from '@/features/users/components/filter-chip-group'
import { UserCertificateCard } from '@/features/users/components/user-certificate-card'
import { useExamResultsPageQuery } from '@/shared/queries/exam-result.query'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'

interface UserCertificateListProps {
  userId: number
  summary: ExamResultUserSummaryDto
  onCopied: (message: string) => void
}

const OUTCOME_ALL = ''
const OUTCOME_PASSED = 'passed'
const OUTCOME_FAILED = 'failed'

function parseOutcome(raw: string | null): boolean | undefined {
  if (raw === OUTCOME_PASSED) return true
  if (raw === OUTCOME_FAILED) return false
  return undefined
}

export function UserCertificateList({ userId, summary, onCopied }: UserCertificateListProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const levelFilter = searchParams.get('level') ?? ''
  const outcomeFilter = searchParams.get('outcome') ?? OUTCOME_ALL
  const levelsQuery = useJlptLevelsQuery()

  const request = useMemo(
    () => ({
      pageNumber,
      pageSize,
      sortBy: 'createdAt',
      sortOrder: 'DESC' as const,
      filter: {
        userId,
        jlptLevelCode: levelFilter || undefined,
        passed: parseOutcome(outcomeFilter),
      },
    }),
    [pageNumber, pageSize, userId, levelFilter, outcomeFilter],
  )

  const resultsQuery = useExamResultsPageQuery(request)

  const countByLevel = useMemo(() => {
    const map = new Map<string, number>()
    for (const row of summary.levels) {
      if (row.jlptLevelCode) map.set(row.jlptLevelCode.toUpperCase(), row.total)
    }
    return map
  }, [summary.levels])

  const levelOptions = useMemo(() => {
    const codes = new Set<string>()
    for (const level of levelsQuery.data ?? []) {
      if (!level.deleted) codes.add(level.code.toUpperCase())
    }
    for (const code of countByLevel.keys()) codes.add(code)
    const sorted = [...codes].sort((a, b) => b.localeCompare(a))
    return [
      { value: '', label: 'All levels', count: summary.total },
      ...sorted.map((code) => ({
        value: code,
        label: code,
        count: countByLevel.get(code) ?? 0,
      })),
    ]
  }, [levelsQuery.data, countByLevel, summary.total])

  const passedCount = summary.passed
  const failedCount = Math.max(0, summary.total - summary.passed)

  const setFilter = (key: 'level' | 'outcome', value: string) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next, { replace: true })
    setPageNumber(1)
  }

  const rows = resultsQuery.data?.data ?? []
  const meta = resultsQuery.data?.meta
  const filterLabel = [
    levelFilter || 'all levels',
    outcomeFilter === OUTCOME_PASSED
      ? 'passed'
      : outcomeFilter === OUTCOME_FAILED
        ? 'not passed'
        : 'all results',
  ].join(', ')

  return (
    <section aria-labelledby="certificates-heading">
      <div className="mb-[14px] flex flex-wrap items-end justify-between gap-[12px]">
        <div>
          <h2 id="certificates-heading" className="m-0 font-display text-[18px] text-foreground">
            Certificates
          </h2>
          <p className="mt-[2px] text-[13px] text-muted-foreground">
            Mock exam results saved for this learner. Filter by JLPT level or pass status.
          </p>
        </div>
      </div>

      <Panel className="mb-[14px]">
        <div className="flex flex-col gap-[16px]">
          <FilterChipGroup
            legend="JLPT level"
            name="certificate-level"
            value={levelFilter}
            options={levelOptions}
            onChange={(value) => setFilter('level', value)}
          />
          <FilterChipGroup
            legend="Result"
            name="certificate-outcome"
            value={outcomeFilter}
            options={[
              { value: OUTCOME_ALL, label: 'All results', count: summary.total },
              { value: OUTCOME_PASSED, label: 'Passed', count: passedCount },
              { value: OUTCOME_FAILED, label: 'Not passed', count: failedCount },
            ]}
            onChange={(value) => setFilter('outcome', value)}
          />
        </div>
      </Panel>

      <p className="sr-only" aria-live="polite">
        Showing certificates for {filterLabel}.
      </p>

      {resultsQuery.isError ? (
        <p
          className="rounded-[12px] border border-destructive bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(resultsQuery.error, 'Failed to load certificates.')}
        </p>
      ) : null}

      {resultsQuery.isLoading && !resultsQuery.data ? (
        <Panel className="py-[28px] text-center text-[13px] text-muted-foreground" role="status">
          Loading certificates…
        </Panel>
      ) : null}

      {!resultsQuery.isError && rows.length === 0 && !resultsQuery.isLoading ? (
        <Panel className="py-[36px] text-center">
          <p className="m-0 font-display text-[16px] text-foreground">No certificates yet</p>
          <p className="mt-[6px] text-[13px] text-muted-foreground">
            {levelFilter || outcomeFilter
              ? 'Nothing matches these filters. Try All levels or All results.'
              : 'This learner has not completed a mock exam.'}
          </p>
        </Panel>
      ) : null}

      <div id="user-certificates" className="flex flex-col gap-[12px]">
        {rows.map((result) => (
          <UserCertificateCard key={result.resultToken} result={result} onCopied={onCopied} />
        ))}
      </div>

      {meta && meta.totalElements > 0 ? (
        <TablePagination
          label="Certificates pagination"
          controlsId="user-certificates"
          meta={meta}
          busy={resultsQuery.isFetching}
          pageSizes={[10, 20, 50]}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPageNumber(1)
          }}
        />
      ) : null}
    </section>
  )
}
