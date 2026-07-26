import { Outlet } from 'react-router-dom'

import { Sidebar } from '@/components/core/sidebar'

export function DashboardLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr]">
      <Sidebar />
      <main className="px-[34px] pb-[60px] pt-[26px]">
        {/* Each route brings its own Suspense boundary + feature skeleton. */}
        <Outlet />
      </main>
    </div>
  )
}
