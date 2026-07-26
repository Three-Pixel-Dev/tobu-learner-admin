import { useCallback, useState } from 'react'

import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Toast } from '@/components/common/toast'
import { ProfileGeneralForm } from '@/features/profile/components/profile-general-form'
import { ProfileHeaderCard } from '@/features/profile/components/profile-header-card'
import { ProfileSecurityForm } from '@/features/profile/components/profile-security-form'
import { ProfileSessionsPanel } from '@/features/profile/components/profile-sessions-panel'
import { ProfileSkeleton } from '@/features/profile/components/profile-skeleton'
import { useMeQuery } from '@/shared/queries/auth.query'

const TABS = [
  { value: 'general', label: 'General' },
  { value: 'security', label: 'Security' },
  { value: 'account', label: 'Account' },
]

export function ProfilePage() {
  const meQuery = useMeQuery()
  const [tab, setTab] = useState('general')
  const [toast, setToast] = useState<string | null>(null)

  const onSaved = useCallback((message: string) => {
    setToast(message)
  }, [])

  if (meQuery.isLoading || !meQuery.data) {
    return <ProfileSkeleton />
  }

  return (
    <div>
      <PageHeader
        title="My profile"
        subtitle="Manage your admin account details and security settings."
      />

      <ProfileHeaderCard me={meQuery.data} />

      <Tabs items={TABS} value={tab} onValueChange={setTab} className="mb-[20px]" />

      {tab === 'general' ? <ProfileGeneralForm me={meQuery.data} onSaved={onSaved} /> : null}
      {tab === 'security' ? <ProfileSecurityForm onSaved={onSaved} /> : null}
      {tab === 'account' ? <ProfileSessionsPanel /> : null}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
