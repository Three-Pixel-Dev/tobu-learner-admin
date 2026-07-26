import { Outlet } from 'react-router-dom'

import { Breadcrumbs } from '@/components/common/breadcrumbs'
import { Sidebar } from '@/components/core/sidebar'

export function DashboardLayout() {
  return (
    <div className="grid min-h-screen grid-cols-[250px_1fr]">
      <Sidebar />
      <main className="px-[34px] pb-[60px] pt-[26px]">
        <Breadcrumbs />
        {/* Each route brings its own Suspense boundary + feature skeleton. */}
        <Outlet />
      </main>
    </div>
  )
}
