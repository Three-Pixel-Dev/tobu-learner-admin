/** Build a compact page list with ellipsis gaps, e.g. [1, '…', 4, 5, 6, '…', 20]. */
export function buildPageItems(current: number, totalPages: number, siblingCount = 1): Array<number | '…'> {
  const total = Math.max(totalPages, 1)
  const page = Math.min(Math.max(current, 1), total)

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const firstPage = 1
  const lastPage = total
  const left = Math.max(page - siblingCount, firstPage + 1)
  const right = Math.min(page + siblingCount, lastPage - 1)

  const items: Array<number | '…'> = [firstPage]

  if (left > firstPage + 1) {
    items.push('…')
  } else if (left === firstPage + 1) {
    items.push(firstPage + 1)
  }

  for (let p = left; p <= right; p += 1) {
    if (p !== firstPage && p !== lastPage) {
      items.push(p)
    }
  }

  if (right < lastPage - 1) {
    items.push('…')
  } else if (right === lastPage - 1) {
    items.push(lastPage - 1)
  }

  if (lastPage !== firstPage) {
    items.push(lastPage)
  }

  return items
}

export function formatPageRange(page: number, size: number, totalElements: number): string {
  if (totalElements <= 0) return '0'
  const safePage = Math.max(page, 1)
  const from = (safePage - 1) * size + 1
  const to = Math.min(safePage * size, totalElements)
  return from === to ? String(from) : `${from}–${to}`
}
