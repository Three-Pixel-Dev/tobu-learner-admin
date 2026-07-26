import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { KanaDrawer, type KanaFormValues } from '@/features/kana/components/kana-drawer'
import { KanaGrid } from '@/features/kana/components/kana-grid'
import { KanjiDetail } from '@/features/kana/components/kanji-detail'
import { KANA_SUBTITLES, KANA_TABS } from '@/features/kana/kana.mock'
import {
  useCreateKanaMutation,
  useKanaListQuery,
  useRestoreKanaMutation,
  useSoftDeleteKanaMutation,
  useUpdateKanaMutation,
} from '@/shared/queries/kana.query'
import type { KanaDto, KanaType } from '@/shared/services/kana.service'

type DrawerState =
  | { open: false }
  | { open: true; mode: 'add' }
  | { open: true; mode: 'edit'; item: KanaDto }

function tabToType(tab: string): KanaType | null {
  if (tab === 'hiragana') return 'HIRAGANA'
  if (tab === 'katakana') return 'KATAKANA'
  return null
}

export function KanaPage() {
  const [tab, setTab] = useState('hiragana')
  const [drawer, setDrawer] = useState<DrawerState>({ open: false })
  const [pendingDisable, setPendingDisable] = useState<KanaDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const kanaType = tabToType(tab)
  const listQuery = useKanaListQuery(kanaType ?? 'HIRAGANA', Boolean(kanaType))
  const createMutation = useCreateKanaMutation()
  const updateMutation = useUpdateKanaMutation()
  const softDeleteMutation = useSoftDeleteKanaMutation()
  const restoreMutation = useRestoreKanaMutation()

  const items = useMemo(() => listQuery.data ?? [], [listQuery.data])
  const busy =
    createMutation.isPending ||
    updateMutation.isPending ||
    softDeleteMutation.isPending ||
    restoreMutation.isPending

  const openAdd = () => setDrawer({ open: true, mode: 'add' })
  const openEdit = (item: KanaDto) => setDrawer({ open: true, mode: 'edit', item })
  const closeDrawer = () => setDrawer({ open: false })

  const handleSave = async (values: KanaFormValues) => {
    if (!kanaType) return
    try {
      if (drawer.open && drawer.mode === 'edit') {
        await updateMutation.mutateAsync({ id: drawer.item.id, payload: values })
        setToast('Character updated.')
      } else {
        await createMutation.mutateAsync({ type: kanaType, ...values })
        setToast('Character saved.')
      }
      closeDrawer()
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not save character.'))
    }
  }

  const handleDisableConfirm = async () => {
    if (!pendingDisable) return
    try {
      await softDeleteMutation.mutateAsync(pendingDisable.id)
      setPendingDisable(null)
      closeDrawer()
      setToast('Character disabled — hidden from learners, can be restored anytime.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not disable character.'))
    }
  }

  const handleRestore = async () => {
    if (!drawer.open || drawer.mode !== 'edit') return
    try {
      await restoreMutation.mutateAsync(drawer.item.id)
      closeDrawer()
      setToast('Character restored.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not restore character.'))
    }
  }

  return (
    <>
      <PageHeader title="Kana & Kanji" subtitle={KANA_SUBTITLES[tab] ?? KANA_SUBTITLES.hiragana}>
        {kanaType ? (
          <Button type="button" onClick={openAdd}>
            ＋ Add character
          </Button>
        ) : null}
      </PageHeader>      

      <Panel>
        <Tabs items={KANA_TABS} value={tab} onValueChange={setTab} className="mb-[16px]" />

        {kanaType ? (
          listQuery.isLoading ? (
            <div className="py-[28px] text-center text-[13px] text-muted-foreground">
              Loading characters…
            </div>
          ) : listQuery.isError ? (
            <div className="py-[28px] text-center text-[13px] text-destructive">
              Could not load kana. Try refreshing the page.
            </div>
          ) : (
            <KanaGrid type={kanaType} items={items} onAdd={openAdd} onEdit={openEdit} />
          )
        ) : null}

        {tab === 'kanji' ? <KanjiDetail /> : null}
      </Panel>

      {kanaType ? (
        <KanaDrawer
          open={drawer.open}
          mode={drawer.open ? drawer.mode : 'add'}
          type={kanaType}
          initial={drawer.open && drawer.mode === 'edit' ? drawer.item : null}
          busy={busy}
          onClose={closeDrawer}
          onSave={handleSave}
          onDisable={
            drawer.open && drawer.mode === 'edit' && !drawer.item.deleted
              ? () => setPendingDisable(drawer.item)
              : undefined
          }
          onRestore={
            drawer.open && drawer.mode === 'edit' && drawer.item.deleted ? handleRestore : undefined
          }
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingDisable)}
        title="Disable this character?"
        description={
          pendingDisable ? (
            <>
              <strong className="text-foreground">{pendingDisable.character}</strong> (
              {pendingDisable.romaji}) will be hidden from learners. You can restore it later.
            </>
          ) : null
        }
        confirmLabel="Disable"
        tone="danger"
        busy={softDeleteMutation.isPending}
        onConfirm={handleDisableConfirm}
        onCancel={() => setPendingDisable(null)}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
