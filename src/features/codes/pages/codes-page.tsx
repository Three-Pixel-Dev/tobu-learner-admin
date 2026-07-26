import { useState } from 'react'

import { Field, FieldRow } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'
import { SlideForm } from '@/components/common/slide-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { Select } from '@/components/ui/select'
import { CODE_LEVELS, CODE_STATUS_LABEL, CODES, type CodeStatus } from '@/features/codes/codes.mock'
import { cn } from '@/util/cn'

const ROW_GRID = 'grid grid-cols-[1.2fr_0.7fr_0.9fr_1fr_0.8fr] items-center px-[14px] py-[11px] text-[12.5px]'

const STATUS_VARIANT: Record<CodeStatus, 'success' | 'quiz' | 'danger'> = {
  used: 'success',
  unused: 'quiz',
  expired: 'danger',
}

export function CodesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <>
      <PageHeader title="Activation codes" subtitle="312 redeemed this month">
        <Button onClick={() => setIsFormOpen((open) => !open)}>＋ Generate</Button>
      </PageHeader>

      <SlideForm open={isFormOpen}>
        <Panel className="mb-0">
          <PanelHead>
            <PanelTitle>Generate activation codes</PanelTitle>
          </PanelHead>
          <FieldRow columns={3}>
            <Field label="JLPT level">
              <Select defaultValue="N4">
                {CODE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Duration (days)">
              <Input defaultValue="90" />
            </Field>
            <Field label="Quantity">
              <Input defaultValue="10" />
            </Field>
          </FieldRow>
          <Button>Generate codes</Button>
        </Panel>
      </SlideForm>

      <Panel className="p-0">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle',
          )}
        >
          <div>Code</div>
          <div>Level</div>
          <div>Duration</div>
          <div>Used by</div>
          <div>Status</div>
        </div>

        {CODES.map((code) => (
          <div key={code.id} className={cn(ROW_GRID, 'border-t border-muted')}>
            <div
              className={cn(
                'font-mono font-semibold',
                code.status === 'expired' && 'text-subtle',
              )}
            >
              {code.code}
            </div>
            <div>{code.level}</div>
            <div>{code.duration}</div>
            <div>{code.usedBy}</div>
            <div>
              <Pill variant={STATUS_VARIANT[code.status]}>{CODE_STATUS_LABEL[code.status]}</Pill>
            </div>
          </div>
        ))}
      </Panel>
    </>
  )
}
