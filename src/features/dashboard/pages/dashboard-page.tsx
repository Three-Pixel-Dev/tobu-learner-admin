import { useNavigate } from 'react-router-dom'

import { PageHeader } from '@/components/common/page-header'
import { SearchBox } from '@/components/common/search-box'
import { StatCard } from '@/components/common/stat-card'
import { QuickCard } from '@/components/common/quick-card'
import { Button } from '@/components/ui/button'
import { useDashboardQuery } from '@/features/dashboard/dashboard.query'

export function DashboardPage() {
  const navigate = useNavigate()
  const { data: dashboard } = useDashboardQuery()

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
        <StatCard 
          icon="👥" 
          tone="primary"
          delta="—"
          deltaTone="neutral"
          label="Active learners" 
          value={dashboard?.activeLearners.toLocaleString() ?? '0'} 
        />
        <StatCard 
          icon="📘" 
          tone="info"
          delta="—"
          deltaTone="neutral"
          label="Published lessons" 
          value={dashboard?.publishedLessons.toLocaleString() ?? '0'} 
        />
        <StatCard 
          icon="🔑" 
          tone="warning"
          delta="—"
          deltaTone="neutral"
          label="Codes redeemed / mo" 
          value={dashboard?.codesRedeemedMonth.toLocaleString() ?? '0'} 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-[18px]">
        <QuickCard
          tone="primary"
          emoji="🦉"
          title="字 Kanji queue"
          description={`${dashboard?.kanjiQueueCount ?? 0} kanji need stroke-order guides`}
          onClick={() => navigate('/kana')}
          className="p-[16px]"
        />
        <QuickCard
          tone="warning"
          emoji="📝"
          title="Exam review"
          description={`${dashboard?.examReviewCount ?? 0} exams awaiting publish approval`}
          onClick={() => navigate('/exams')}
          className="p-[16px]"
        />
      </div>
    </>
  )
}

