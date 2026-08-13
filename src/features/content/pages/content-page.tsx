import { useCallback, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { ContentBlockPanel } from '@/features/content/components/content-block-panel'
import { ContentSkeleton } from '@/features/content/components/content-skeleton'
import { useContentListQuery } from '@/shared/queries/content.query'

export function ContentPage() {
  const contentQuery = useContentListQuery()
  const [toast, setToast] = useState<string | null>(null)

  const onSaved = useCallback((message: string) => {
    setToast(message)
  }, [])

  if (contentQuery.isLoading) {
    return <ContentSkeleton />
  }

  if (contentQuery.isError) {
    return (
      <>
        <PageHeader title="Content pages" subtitle="Static app content shown to users" />
        <p
          className="rounded-[12px] border border-destructive bg-destructive-soft px-[14px] py-[12px] text-[13px] font-semibold text-destructive"
          role="alert"
        >
          {getApiErrorMessage(contentQuery.error, 'Failed to load content pages.')}
        </p>
      </>
    )
  }

  const items = contentQuery.data ?? []

  return (
    <>
      <PageHeader title="Content pages" subtitle="Static app content shown to users" />

      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">No content pages found.</p>
      ) : null}

      {items.map((item) => (
        <ContentBlockPanel key={item.id} content={item} onSaved={onSaved} />
      ))}

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
