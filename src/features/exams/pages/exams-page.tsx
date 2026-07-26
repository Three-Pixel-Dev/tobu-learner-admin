import { useState } from 'react'

import { Choice } from '@/components/common/choice'
import { Field, FieldRow } from '@/components/common/field'
import { ItemHead } from '@/components/common/item-card'
import { PageHeader } from '@/components/common/page-header'
import { QuickCard } from '@/components/common/quick-card'
import { SlideForm } from '@/components/common/slide-form'
import { Button } from '@/components/ui/button'
import { DashedButton } from '@/components/ui/dashed-button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { Select } from '@/components/ui/select'
import { EXAM_LEVELS, EXAM_META, EXAM_QUESTION } from '@/features/exams/exams.mock'

export function ExamsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <PageHeader title="Exams" subtitle="N4 Mock exam #2 ・ Awaiting approval">
        <Button variant="ghost" onClick={() => setIsFormOpen((open) => !open)}>
          ＋ New exam
        </Button>
        <Button>Approve & publish</Button>
      </PageHeader>

      <SlideForm open={isFormOpen}>
        <Panel className="mb-0">
          <PanelHead>
            <PanelTitle>Create new exam</PanelTitle>
          </PanelHead>
          <Field label="Exam title" className="mb-[10px]">
            <Input placeholder="e.g. N3 Mock exam #1" />
          </Field>
          <FieldRow columns={3}>
            <Field label="JLPT level">
              <Select defaultValue="N3">
                {EXAM_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Duration (minutes)">
              <Input defaultValue="45" />
            </Field>
            <Field label="Total score">
              <Input defaultValue="100" />
            </Field>
          </FieldRow>
          <Button>Create exam & add questions</Button>
        </Panel>
      </SlideForm>

      <Panel>
        <ItemHead label={EXAM_QUESTION.label}>
          <Pill variant="vocab">audio</Pill>
        </ItemHead>
        <div className="mb-[10px] flex items-center gap-[10px]">
          <Button variant="ghost">▶ Play clip</Button>
          <span className="text-[12px] text-muted-foreground">
            {EXAM_QUESTION.audioFile} ・ {EXAM_QUESTION.audioLength}
          </span>
        </div>
        <Field label="Prompt text" className="mb-[10px]">
          <Input defaultValue={EXAM_QUESTION.prompt} />
        </Field>
        <div className="grid grid-cols-2 gap-[10px]">
          {EXAM_QUESTION.choices.map((choice, index) => (
            <Choice key={index} value={choice.value} correct={choice.correct} />
          ))}
        </div>
      </Panel>

      <DashedButton>＋ Add question</DashedButton>

      <div className="mt-[18px] flex gap-[10px]">
        <QuickCard
          tone="warning"
          emoji="⏱"
          title="Duration"
          description={EXAM_META.duration}
          className="flex-1 border-[1.5px]"
        />
        <QuickCard
          tone="info"
          emoji="⭐"
          title="Total score"
          description={EXAM_META.score}
          className="flex-1 border-[1.5px]"
        />
      </div>
    </>
  )
}
