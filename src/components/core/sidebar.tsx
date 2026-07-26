import { NavLink } from 'react-router-dom'

import { NAV_SECTIONS, type NavItem } from '@/constants/nav'
import { cn } from '@/util/cn'

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

      <div className="mt-auto flex items-center gap-[10px] rounded-[14px] bg-sidebar-accent p-[12px]">
        <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-warning font-display font-bold text-foreground">
          A
        </div>
        <div>
          <div className="text-[12.5px] font-semibold">Admin Team</div>
          <div className="text-[10.5px] text-subtle">admin@tabu.co.jp</div>
        </div>
      </div>
    </aside>
  )
}
