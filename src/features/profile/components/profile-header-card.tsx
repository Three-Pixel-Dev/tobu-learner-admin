import type { MeDto } from '@/app/api/types'
import { formatJoinedMonth } from '@/util/relative-time'
import { getInitials } from '@/util/initials'

interface ProfileHeaderCardProps {
  me: MeDto
}

export function ProfileHeaderCard({ me }: ProfileHeaderCardProps) {
  const initials = getInitials(me.name || me.email)

  return (
    <div className="mb-[20px] flex items-center gap-[20px] rounded-[22px] bg-card p-[24px] shadow-[0_4px_14px_rgba(15,23,42,0.05)]">
      <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-full bg-warning font-display text-[28px] font-bold text-foreground">
        {initials}
      </div>
      <div>
        <div className="font-display text-[19px] font-bold">{me.name}</div>
        <span className="mt-[5px] inline-flex items-center gap-[5px] rounded-[20px] bg-accent-soft px-[10px] py-[3px] text-[11.5px] font-bold text-accent-foreground">
          🛡 Admin
        </span>
        <div className="mt-[6px] text-[12.5px] text-muted-foreground">
          {me.email} · Joined {formatJoinedMonth(me.createdAt)}
        </div>
      </div>
    </div>
  )
}
