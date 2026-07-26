import { useEffect, useRef, type ReactNode } from 'react'

interface ErrorPageShellProps {
  /** Document title suffix, e.g. "Page not found". */
  documentTitle: string
  children: ReactNode
}

/** Full-bleed status page (no sidebar) — matches the Tobu Admin error mocks. */
export function ErrorPageShell({ documentTitle, children }: ErrorPageShellProps) {
  const mainRef = useRef<HTMLElement>(null)

  useEffect(() => {
    document.title = `${documentTitle} — Tobu Admin`
    const heading = mainRef.current?.querySelector('h1')
    if (heading instanceof HTMLElement) {
      heading.setAttribute('tabindex', '-1')
      heading.focus({ preventScroll: true })
    }
  }, [documentTitle])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a
        href="#main"
        className="absolute left-[-999px] top-0 z-[100] rounded-br-[10px] bg-sidebar px-[16px] py-[10px] text-[13px] font-semibold text-primary-foreground focus:left-0"
      >
        Skip to main content
      </a>

      <main
        ref={mainRef}
        id="main"
        className="flex min-h-screen flex-col items-center justify-center px-[24px] py-[40px] text-center"
      >
        {children}
      </main>
    </div>
  )
}
