import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { StatCard } from '@/components/common/stat-card'
import { QuickCard } from '@/components/common/quick-card'
import { Button } from '@/components/ui/button'
import { DASHBOARD_STATS } from '@/features/dashboard/dashboard.mock'
import { LessonsTable } from '@/features/dashboard/components/lessons-table'
import { RecentActivity } from '@/features/dashboard/components/recent-activity'

export function DashboardPage() {
  const navigate = useNavigate()

  return (
    <>
      <PageHeader title="Dashboard" subtitle="ဒီနေ့ Tobu app ရဲ့ အခြေအနေ overview">
        <SearchBox placeholder="Search lessons, users, codes…" />
        <Button variant="ghost" onClick={() => navigate('/codes')}>
          🔑 New code
        </Button>
        <Button onClick={() => navigate('/lessons')}>＋ New lesson</Button>
      </PageHeader>

      <div className="mb-[26px] grid grid-cols-4 gap-[16px]">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-[1.65fr_1fr] items-start gap-[18px]">
        <LessonsTable />
        <div>
          <RecentActivity />
          <QuickCard
            tone="primary"
            emoji="🦉"
            title="字 Kanji queue"
            description="6 kanji need stroke-order guides for N3"
            onClick={() => navigate('/kana')}
            className="mb-[18px] p-[16px]"
          />
          <QuickCard
            tone="warning"
            emoji="📝"
            title="Exam review"
            description="N4 Mock Exam #2 awaiting publish approval"
            onClick={() => navigate('/exams')}
            className="p-[16px]"
          />
        </div>
      </div>
    </>
  )
}
