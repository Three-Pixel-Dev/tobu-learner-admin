import { useCallback, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { XpRewardFormPanel } from '@/features/xp-reward/components/xp-reward-form-panel'
import { XpRewardSkeleton } from '@/features/xp-reward/components/xp-reward-skeleton'
import { useXpRewardSettingsQuery } from '@/shared/queries/xp-reward.query'

export function XpRewardPage() {
  const settingsQuery = useXpRewardSettingsQuery()
  const [toast, setToast] = useState<string | null>(null)

  const onSaved = useCallback((message: string) => {
    setToast(message)
  }, [])

  if (settingsQuery.isLoading) {
    return <XpRewardSkeleton />
  }

  if (settingsQuery.isError || !settingsQuery.data) {
    return (
      <>
        <PageHeader title="XP rewards" subtitle="Configure how learners earn XP" />
        <p
          className="rounded-[12px] border border-[#FCA5A5] bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(settingsQuery.error, 'Failed to load XP reward settings.')}
        </p>
      </>
    )
  }

  return (
    <>
      <PageHeader title="XP rewards" subtitle="Configure how learners earn XP" />
      <XpRewardFormPanel settings={settingsQuery.data} onSaved={onSaved} />
      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
