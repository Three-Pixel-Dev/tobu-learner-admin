import { useState } from 'react'

import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Panel } from '@/components/ui/panel'
import { HIRAGANA_ROW, KANA_TABS, KATAKANA_ROW } from '@/features/kana/kana.mock'
import { KanaGrid } from '@/features/kana/components/kana-grid'
import { KanjiDetail } from '@/features/kana/components/kanji-detail'

export function KanaPage() {
  const [tab, setTab] = useState('hiragana')

  return (
    <>
      <PageHeader title="Kana & Kanji" subtitle="Manage characters, images, audio and stroke guides" />

      <Panel>
        <Tabs items={KANA_TABS} value={tab} onValueChange={setTab} className="mb-[16px]" />
        {tab === 'hiragana' ? <KanaGrid row={HIRAGANA_ROW} /> : null}
        {tab === 'katakana' ? <KanaGrid row={KATAKANA_ROW} /> : null}
        {tab === 'kanji' ? <KanjiDetail /> : null}
      </Panel>
    </>
  )
}
