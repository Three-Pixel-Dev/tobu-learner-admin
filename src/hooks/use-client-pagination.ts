import { useCallback, useEffect, useMemo, useState } from 'react'

import type { PageMeta } from '@/app/api/types'

export interface ClientPaginationResult<T> {
  items: T[]
  meta: PageMeta
  page: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

/** Client-side slice for lists that are not yet backed by a pageable API. */
export function useClientPagination<T>(
  items: readonly T[],
  initialPageSize = 20,
): ClientPaginationResult<T> {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSizeState] = useState(initialPageSize)

  const totalElements = items.length
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / pageSize)

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const pageItems = useMemo(() => {
    const start = (Math.max(page, 1) - 1) * pageSize
    return items.slice(start, start + pageSize) as T[]
  }, [items, page, pageSize])

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size)
    setPage(1)
  }, [])

  return {
    items: pageItems,
    meta: {
      page: totalPages === 0 ? 1 : Math.min(page, totalPages),
      size: pageSize,
      totalElements,
      totalPages,
    },
    page,
    pageSize,
    setPage,
    setPageSize,
  }
}
