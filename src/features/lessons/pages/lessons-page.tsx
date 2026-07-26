import { useState } from 'react'

import { PageHeader } from '@/components/common/page-header'
import { Tabs } from '@/components/common/tabs'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { LESSON_TABS } from '@/features/lessons/lessons.mock'
import { VocabEditor } from '@/features/lessons/components/vocab-editor'
import { GrammarEditor } from '@/features/lessons/components/grammar-editor'
import { QuizEditor } from '@/features/lessons/components/quiz-editor'

export function LessonsPage() {
  const [tab, setTab] = useState('vocab')

  return (
    <>
      <PageHeader title="Lesson editor" subtitle="Lesson 1 ・ あいさつ ・ N4 ・ Draft">
        <Button variant="ghost">Preview</Button>
        <Button>Publish</Button>
      </PageHeader>

      <Panel>
        <Tabs items={LESSON_TABS} value={tab} onValueChange={setTab} className="mb-[16px]" />
        {tab === 'vocab' ? <VocabEditor /> : null}
        {tab === 'grammar' ? <GrammarEditor /> : null}
        {tab === 'quiz' ? <QuizEditor /> : null}
      </Panel>
    </>
  )
}
