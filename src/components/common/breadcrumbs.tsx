import { Link, useLocation } from 'react-router-dom'

import { resolveBreadcrumbs, type BreadcrumbItem } from '@/util/breadcrumbs'
import { cn } from '@/util/cn'

interface BreadcrumbsProps {
  items?: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const { pathname } = useLocation()
  const crumbs = items ?? resolveBreadcrumbs(pathname)

  if (crumbs.length === 0) return null

  return (
    <nav aria-label="Breadcrumb" className={cn('mb-[10px]', className)}>
      <ol className="m-0 flex list-none flex-wrap items-center gap-[6px] p-0 text-[12.5px] text-subtle">
        {crumbs.map((item, index) => {
          const isLast = index === crumbs.length - 1
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-[6px]">
              {index > 0 ? (
                <span aria-hidden className="text-subtle">
                  /
                </span>
              ) : null}
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="text-subtle no-underline transition hover:text-foreground hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(isLast ? 'font-semibold text-muted-foreground' : 'text-subtle')}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
