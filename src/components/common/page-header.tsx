import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  children?: ReactNode
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-[26px] flex flex-wrap items-center justify-between gap-[12px]">
      <div>
        <h1 className="m-0 font-display text-[24px] text-foreground">{title}</h1>
        {subtitle ? <p className="mt-[2px] text-[13px] text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children ? <div className="flex items-center gap-[10px]">{children}</div> : null}
    </div>
  )
}
