import { NAV_SECTIONS } from '@/constants/nav'

export interface BreadcrumbItem {
  label: string
  /** Omit `to` for the current (non-link) crumb. */
  to?: string
}

/**
 * Resolve admin breadcrumbs from the active pathname + sidebar nav.
 * Shape matches the mock: "Content / JLPT Levels".
 */
export function resolveBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const path = normalizePath(pathname)

  if (path === '/') {
    return [{ label: 'Dashboard' }]
  }

  if (path === '/profile') {
    return [{ label: 'Dashboard', to: '/' }, { label: 'Profile' }]
  }

  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (normalizePath(item.to) === path) {
        const crumbs: BreadcrumbItem[] = [{ label: 'Dashboard', to: '/' }]
        if (section.label) {
          crumbs.push({ label: section.label })
        }
        crumbs.push({ label: item.label })
        return crumbs
      }
    }
  }

  return [{ label: 'Dashboard', to: '/' }, { label: 'Page' }]
}

function normalizePath(path: string): string {
  if (!path || path === '/') return '/'
  return path.endsWith('/') ? path.slice(0, -1) : path
}
