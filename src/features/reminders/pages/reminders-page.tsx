import { ActivityItem } from '@/components/common/activity-item'
import { Field, FieldRow } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'
import { TablePagination } from '@/components/common/table-pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { AUDIENCE_OPTIONS, SENT_REMINDERS } from '@/features/reminders/reminders.mock'
import { useClientPagination } from '@/hooks/use-client-pagination'

export function RemindersPage() {
  const pagination = useClientPagination(SENT_REMINDERS, 10)

  return (
    <>
      <PageHeader title="Reminders" subtitle="Push notifications to learners" />

      <Panel>
        <PanelHead>
          <PanelTitle>New reminder</PanelTitle>
        </PanelHead>
        <Field label="Title" className="mb-[10px]">
          <Input defaultValue="Don't lose your streak!" />
        </Field>
        <Field label="Message" className="mb-[12px]">
          <Input defaultValue="ဒီနေ့ လေ့ကျင့်ချက် မလုပ်ရသေးဘူးနော်၊ streak မပျက်အောင် ၁ ခု လုပ်လိုက်ပါ 🔥" />
        </Field>
        <FieldRow>
          <Field label="Target audience">
            <div className="mt-[5px] flex gap-[6px]" role="group" aria-label="Target audience">
              {AUDIENCE_OPTIONS.map((option) => (
                <Pill key={option.label} variant={option.active ? 'success' : 'neutral'}>
                  {option.label}
                </Pill>
              ))}
            </div>
          </Field>
          <Field label="Schedule">
            <Input defaultValue="Every day, 19:00" aria-label="Schedule" />
          </Field>
        </FieldRow>
        <Button>Schedule reminder</Button>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Sent history</PanelTitle>
        </PanelHead>
        <div id="reminders-history-list" aria-label="Sent reminders">
          {pagination.items.length === 0 ? (
            <p className="m-0 py-[8px] text-[13px] text-muted-foreground">No reminders sent yet.</p>
          ) : null}
          {pagination.items.map((reminder) => (
            <ActivityItem key={reminder.id} text={reminder.text} time={reminder.meta} />
          ))}
        </div>
        <TablePagination
          label="Reminders history pagination"
          controlsId="reminders-history-list"
          className="mt-[16px]"
          meta={pagination.meta}
          onPageChange={pagination.setPage}
          onPageSizeChange={pagination.setPageSize}
        />
      </Panel>
    </>
  )
}
