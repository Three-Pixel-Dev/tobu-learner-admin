import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { buttonVariants } from '@/components/ui/button'
import { ErrorPageShell } from '@/features/errors/components/error-page-shell'
import { cn } from '@/util/cn'

const QUICK_LINKS = [
  { to: '/lessons', label: '📘 Lessons' },
  { to: '/kana', label: 'あ Kana & Kanji' },
  { to: '/users', label: '👤 Users' },
  { to: '/codes', label: '🔑 Activation codes' },
] as const

export function NotFoundPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    if (!q) return
    navigate(`/users?q=${encodeURIComponent(q)}`)
  }

  return (
    <ErrorPageShell documentTitle="Page not found">
      <div className="relative mb-[8px] h-[140px] w-[180px]" aria-hidden>
        <div className="absolute top-0 left-[6px] flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-warning bg-card font-display text-[34px] font-bold text-warning-foreground">
          ?
        </div>
        <div className="absolute top-[10px] left-1/2 flex h-[96px] w-[96px] -translate-x-1/2 items-center justify-center rounded-[28px] bg-primary text-[52px] shadow-[0_10px_26px_rgba(34,197,94,0.28)]">
          🦉
        </div>
        <div className="absolute top-[18px] right-0 flex h-[52px] w-[52px] items-center justify-center rounded-full border-2 border-warning bg-card font-display text-[34px] font-bold text-warning-foreground">
          ?
        </div>
      </div>

      <p className="m-0 font-display text-[64px] font-bold leading-none" aria-hidden>
        404
      </p>

      <h1 className="m-0 mt-[14px] font-display text-[22px] font-bold outline-none">
        We couldn&apos;t find that page
      </h1>
      <p className="mx-auto mt-[8px] mb-[26px] max-w-[440px] text-[14.5px] text-muted-foreground">
        The page you&apos;re looking for might have been moved, renamed, or never existed. Let&apos;s
        get you back on track.
      </p>

      <form className="mb-[22px] w-full max-w-[420px]" role="search" onSubmit={onSearch}>
        <label htmlFor="error-search" className="sr-only">
          Search Tobu Admin
        </label>
        <div className="flex items-center gap-[8px] rounded-[14px] border-[1.5px] border-border bg-card py-[4px] pr-[4px] pl-[16px]">
          <span aria-hidden>🔍</span>
          <input
            id="error-search"
            type="search"
            value={query}
            autoFocus
            placeholder="Search lessons, users, settings…"
            className="min-w-0 flex-1 border-none bg-transparent py-[10px] font-body text-[14px] text-foreground outline-none placeholder:text-subtle"
            onChange={(event) => setQuery(event.target.value)}
          />
          <button
            type="submit"
            className="shrink-0 rounded-[11px] bg-primary px-[16px] py-[10px] text-[13.5px] font-semibold text-primary-foreground"
          >
            Search
          </button>
        </div>
        <p className="mt-[8px] text-[11.5px] text-subtle">Try searching for what you were looking for.</p>
      </form>

      <div className="mb-[34px] flex flex-wrap justify-center gap-[10px]">
        <Link to="/" className={cn(buttonVariants({ variant: 'primary' }), 'px-[20px] py-[11px]')}>
          🏠 Back to dashboard
        </Link>
        <button
          type="button"
          className={cn(buttonVariants({ variant: 'ghost' }), 'px-[20px] py-[11px]')}
          onClick={() => navigate(-1)}
        >
          ← Go back
        </button>
      </div>

      <nav
        className="w-full max-w-[460px] rounded-[18px] bg-card px-[22px] py-[18px] text-left shadow-[0_4px_14px_rgba(15,23,42,0.05)]"
        aria-label="Suggested pages"
      >
        <h2 className="m-0 mb-[10px] font-display text-[13px] font-bold">Or jump straight to</h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-[6px] p-0 sm:grid-cols-2">
          {QUICK_LINKS.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="flex items-center gap-[8px] rounded-[10px] px-[10px] py-[8px] text-[13px] text-foreground no-underline hover:bg-muted"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </ErrorPageShell>
  )
}
