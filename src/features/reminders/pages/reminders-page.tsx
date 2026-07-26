import { ActivityItem } from '@/components/common/activity-item'
import { Field, FieldRow } from '@/components/common/field'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { AUDIENCE_OPTIONS, SENT_REMINDERS } from '@/features/reminders/reminders.mock'

export function RemindersPage() {
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
            <div className="mt-[5px] flex gap-[6px]">
              {AUDIENCE_OPTIONS.map((option) => (
                <Pill key={option.label} variant={option.active ? 'success' : 'neutral'}>
                  {option.label}
                </Pill>
              ))}
            </div>
          </Field>
          <Field label="Schedule">
            <Input defaultValue="Every day, 19:00" />
          </Field>
        </FieldRow>
        <Button>Schedule reminder</Button>
      </Panel>

      <Panel>
        <PanelHead>
          <PanelTitle>Sent history</PanelTitle>
        </PanelHead>
        {SENT_REMINDERS.map((reminder) => (
          <ActivityItem key={reminder.id} text={reminder.text} time={reminder.meta} />
        ))}
      </Panel>
    </>
  )
}
