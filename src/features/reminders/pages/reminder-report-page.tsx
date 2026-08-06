import { Link, useParams } from 'react-router-dom'

import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { useReminderDetailQuery } from '@/shared/queries/reminder.query'

function pct(part: number, whole: number) {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 1000) / 10
}

export function ReminderReportPage() {
  const { id: idParam } = useParams()
  const id = Number(idParam)
  const detailQuery = useReminderDetailQuery(Number.isFinite(id) ? id : null)
  const r = detailQuery.data

  if (detailQuery.isLoading) {
    return <p className="text-[13px] text-muted-foreground">Loading report…</p>
  }
  if (!r) {
    return <p className="text-[13px] text-muted-foreground">Reminder not found.</p>
  }

  const sent = r.sentCount
  const delivered = r.deliveredCount
  const opened = r.openedCount
  const tapped = r.tappedCount

  const funnel = [
    { label: 'Sent', value: sent, width: 100, color: 'bg-sky-400' },
    {
      label: 'Delivered',
      value: delivered,
      width: pct(delivered, sent) || (sent ? 0 : 0),
      color: 'bg-emerald-500',
    },
    {
      label: 'Opened',
      value: opened,
      width: pct(opened, sent),
      color: 'bg-amber-600',
    },
    {
      label: 'Tapped in',
      value: tapped,
      width: pct(tapped, sent),
      color: 'bg-violet-500',
    },
  ]

  return (
    <>
      <p className="mb-[10px] text-[12.5px] text-muted-foreground">
        <Link to="/reminders" className="hover:underline">
          Reminders
        </Link>{' '}
        / Report
      </p>
      <PageHeader title={r.title} subtitle={r.body}>
        <Button variant="ghost" onClick={() => window.history.back()}>
          Back
        </Button>
      </PageHeader>

      <div className="mb-[18px] grid gap-[14px] sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sent" value={sent} sub="Total inbox rows created" />
        <StatCard
          label="Delivered"
          value={delivered}
          sub={`${pct(delivered, sent)}% of sent`}
        />
        <StatCard label="Opened" value={opened} sub={`${pct(opened, sent)}% of sent`} />
        <StatCard
          label="Tapped into app"
          value={tapped}
          sub={`${pct(tapped, sent)}% click-through`}
        />
      </div>

      <Panel>
        <PanelHead>
          <PanelTitle>Delivery funnel</PanelTitle>
        </PanelHead>
        <div className="space-y-[12px]">
          {funnel.map((row) => (
            <div key={row.label} className="flex items-center gap-[12px]">
              <div className="w-[110px] shrink-0 text-[12.5px] text-muted-foreground">
                {row.label}
              </div>
              <div className="h-[10px] flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${row.color}`}
                  style={{ width: `${Math.min(100, row.width)}%` }}
                />
              </div>
              <div className="w-[48px] text-right text-[12.5px] font-semibold">{row.value}</div>
            </div>
          ))}
        </div>
      </Panel>
      <p className="mt-[10px] text-[11.5px] text-muted-foreground">
        A sent reminder can’t be edited or resent — duplicate it from the list to send a similar
        one.
      </p>
    </>
  )
}

function StatCard({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="rounded-[16px] bg-background p-[16px_18px] shadow-sm">
      <div className="text-[11px] font-bold uppercase text-muted-foreground">{label}</div>
      <div className="mt-[4px] font-display text-[22px] font-bold">{value}</div>
      <div className="mt-[2px] text-[11.5px] text-muted-foreground">{sub}</div>
    </div>
  )
}
