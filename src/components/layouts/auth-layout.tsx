import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-[20px] py-[40px]">
      <div className="w-full max-w-[420px]">
        <div className="mb-[28px] flex flex-col items-center text-center">
          <div className="mb-[14px] flex h-[56px] w-[56px] items-center justify-center rounded-[16px] bg-primary text-[28px] shadow-[0_8px_20px_rgba(34,197,94,0.28)]">
            🦉
          </div>
          <div className="font-display text-[26px] font-bold">
            Tobu <span className="text-warning-foreground">Admin</span>
          </div>
          <p className="mt-[4px] text-[13.5px] text-muted-foreground">Sign in to manage lessons and users</p>
        </div>
        {children}
      </div>
    </div>
  )
}
