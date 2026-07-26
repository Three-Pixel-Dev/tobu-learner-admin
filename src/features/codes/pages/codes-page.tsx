import { useState } from 'react'

import { Field, FieldRow } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'
import { SlideForm } from '@/components/common/slide-form'
import { TablePagination } from '@/components/common/table-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { Select } from '@/components/ui/select'
import { CODE_LEVELS, CODE_STATUS_LABEL, CODES, type CodeStatus } from '@/features/codes/codes.mock'
import { useClientPagination } from '@/hooks/use-client-pagination'
import { cn } from '@/util/cn'

const ROW_GRID = 'grid grid-cols-[1.2fr_0.7fr_0.9fr_1fr_0.8fr] items-center px-[14px] py-[11px] text-[12.5px]'

const STATUS_VARIANT: Record<CodeStatus, 'success' | 'quiz' | 'danger'> = {
  used: 'success',
  unused: 'quiz',
  expired: 'danger',
}

export function CodesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const pagination = useClientPagination(CODES, 10)

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
              <Select defaultValue="N4" aria-label="JLPT level">
                {CODE_LEVELS.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </Select>
            </Field>
            <Field label="Duration (days)">
              <Input defaultValue="90" aria-label="Duration in days" />
            </Field>
            <Field label="Quantity">
              <Input defaultValue="10" aria-label="Quantity" />
            </Field>
          </FieldRow>
          <Button>Generate codes</Button>
        </Panel>
      </SlideForm>

      <Panel id="activation-codes-table" className="p-0" role="table" aria-label="Activation codes">
        <div
          className={cn(
            ROW_GRID,
            'rounded-t-[22px] bg-surface text-[10.5px] font-bold uppercase text-subtle',
          )}
          role="row"
        >
          <div role="columnheader">Code</div>
          <div role="columnheader">Level</div>
          <div role="columnheader">Duration</div>
          <div role="columnheader">Used by</div>
          <div role="columnheader">Status</div>
        </div>

        {pagination.items.length === 0 ? (
          <div className="px-[14px] py-[28px] text-center text-[13px] text-muted-foreground" role="row">
            No activation codes yet.
          </div>
        ) : null}

        {pagination.items.map((code) => (
          <div key={code.id} className={cn(ROW_GRID, 'border-t border-muted')} role="row">
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

      <TablePagination
        label="Activation codes pagination"
        controlsId="activation-codes-table"
        meta={pagination.meta}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </>
  )
}
