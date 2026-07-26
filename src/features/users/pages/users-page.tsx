import { Avatar } from '@/components/common/avatar'
import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { Panel } from '@/components/ui/panel'
import { USERS } from '@/features/users/users.mock'
import { cn } from '@/util/cn'

const ROW_GRID = 'grid grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.6fr] items-center px-[14px] py-[11px] text-[12.5px]'

export function UsersPage() {
  return (
    <>
      <PageHeader title="Users" subtitle="2,481 active learners">
        <SearchBox placeholder="Search by name or email" />
      </PageHeader>

      <Panel className="p-0">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle',
          )}
        >
          <div>User</div>
          <div>Level</div>
          <div>Streak</div>
          <div>XP</div>
          <div />
        </div>

        {USERS.map((user) => (
          <div key={user.id} className={cn(ROW_GRID, 'border-t border-muted')}>
            <div className="flex items-center gap-[8px]">
              <Avatar initials={user.initials} tone={user.tone} />
              <div>
                <div className={cn('font-semibold', user.deleted && 'text-subtle')}>{user.name}</div>
                <div className="text-[10.5px] text-subtle">{user.detail}</div>
              </div>
            </div>
            <div className={cn('font-semibold', user.deleted && 'font-normal text-disabled')}>
              {user.level}
            </div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.streak}</div>
            <div className={cn(user.deleted && 'text-disabled')}>{user.xp}</div>
            <div className="text-muted-foreground">{user.deleted ? '↺' : '⋯'}</div>
          </div>
        ))}
      </Panel>
    </>
  )
}
