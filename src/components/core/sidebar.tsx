import { NavLink } from 'react-router-dom'

import { NAV_SECTIONS, type NavItem } from '@/constants/nav'
import { useLogoutMutation } from '@/shared/queries/auth.query'
import { useAuthStore } from '@/shared/stores/auth.store'
import { cn } from '@/util/cn'
import { getInitials } from '@/util/initials'

function SidebarLink({ to, icon, label, badge }: NavItem) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-[11px] rounded-xl px-[12px] py-[10px] text-[14px] font-medium transition',
          isActive
            ? 'bg-primary font-semibold text-primary-foreground'
            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-white',
        )
      }
    >
      <span className="w-[20px] text-center text-[15px]">{icon}</span>
      {label}
      {badge ? (
        <span className="ml-auto rounded-full bg-warning px-[7px] py-[2px] text-[10px] font-bold text-foreground">
          {badge}
        </span>
      ) : null}
    </NavLink>
  )
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user)
  const logout = useLogoutMutation()
  const displayName = user?.name?.trim() || 'Admin'
  const email = user?.email ?? ''
  const initials = getInitials(displayName, 'A')

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-[4px] overflow-y-auto bg-sidebar px-[16px] py-[22px] text-white">
      <div className="flex items-center gap-[10px] px-[10px] pb-[22px] pt-[6px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-xl bg-primary text-[20px]">
          🦉
        </div>
        <div className="font-display text-[19px] font-bold">
          Tobu <span className="text-warning">Admin</span>
        </div>
      </div>

      {NAV_SECTIONS.map((section, index) => (
        <div key={section.label ?? `section-${index}`} className="flex flex-col gap-[4px]">
          {section.label ? (
            <div className="px-[10px] pb-[6px] pt-[16px] text-[11px] font-medium uppercase tracking-[0.08em] text-sidebar-muted">
              {section.label}
            </div>
          ) : null}
          {section.items.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </div>
      ))}

      <div className="mt-auto flex flex-col gap-[8px]">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-[10px] rounded-[14px] bg-sidebar-accent p-[12px] transition',
              isActive ? 'ring-2 ring-primary' : 'hover:brightness-110',
            )
          }
        >
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-warning font-display font-bold text-foreground">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold">{displayName}</div>
            <div className="truncate text-[10.5px] text-subtle">{email}</div>
          </div>
        </NavLink>
        <button
          type="button"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
          className="rounded-xl px-[12px] py-[8px] text-left text-[12.5px] font-semibold text-sidebar-foreground transition hover:bg-sidebar-accent hover:text-white disabled:opacity-60"
        >
          {logout.isPending ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </aside>
  )
}
