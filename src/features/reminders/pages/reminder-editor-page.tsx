import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import {
  useCreateReminderMutation,
  useReminderDetailQuery,
  useUpdateReminderMutation,
} from '@/shared/queries/reminder.query'
import type {
  CreateReminderPayload,
  ReminderAudience,
  ReminderRepeatFreq,
  ReminderScheduleMode,
} from '@/shared/services/reminder.service'
import { cn } from '@/util/cn'

const TITLE_MAX = 50
const BODY_MAX = 150

function toLocalInputValue(iso: string | null | undefined) {
  if (!iso) return { date: '', time: '' }
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }
  const pad = (n: number) => String(n).padStart(2, '0')
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  }
}

function fromLocalDateTime(date: string, time: string): string | null {
  if (!date || !time) return null
  const d = new Date(`${date}T${time}:00`)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

export function ReminderEditorPage() {
  const { id: idParam } = useParams()
  const isNew = idParam === 'new' || idParam == null
  const editId = !isNew ? Number(idParam) : null
  const navigate = useNavigate()

  const detailQuery = useReminderDetailQuery(editId)
  const levelsQuery = useJlptLevelsQuery()
  const createMutation = useCreateReminderMutation()
  const updateMutation = useUpdateReminderMutation()

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<ReminderAudience>('ALL')
  const [levelCodes, setLevelCodes] = useState<string[]>([])
  const [scheduleMode, setScheduleMode] = useState<ReminderScheduleMode>('NOW')
  const [laterDate, setLaterDate] = useState('')
  const [laterTime, setLaterTime] = useState('19:00')
  const [repeatFreq, setRepeatFreq] = useState<ReminderRepeatFreq>('DAILY')
  const [repeatTime, setRepeatTime] = useState('19:00')
  const [toast, setToast] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(isNew)

  const levels = useMemo(
    () => (levelsQuery.data ?? []).filter((l) => !l.deleted),
    [levelsQuery.data],
  )

  useEffect(() => {
    if (isNew || !detailQuery.data || hydrated) return
    const r = detailQuery.data
    if (r.status !== 'scheduled') {
      setToast('Only scheduled reminders can be edited.')
      navigate(`/reminders/${r.id}/report`, { replace: true })
      return
    }
    setTitle(r.title)
    setBody(r.body)
    setAudience(r.audienceType)
    setLevelCodes(r.jlptLevelCodes ?? [])
    setScheduleMode(r.scheduleMode === 'NOW' ? 'LATER' : r.scheduleMode)
    const local = toLocalInputValue(r.scheduledAt)
    setLaterDate(local.date)
    setLaterTime(local.time || '19:00')
    setRepeatFreq(r.repeatFreq ?? 'DAILY')
    setRepeatTime(r.repeatTime?.slice(0, 5) ?? '19:00')
    setHydrated(true)
  }, [detailQuery.data, hydrated, isNew, navigate])

  const toggleLevel = (code: string) => {
    setLevelCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    )
  }

  const ctaLabel = isNew
    ? scheduleMode === 'NOW'
      ? 'Send now'
      : 'Schedule'
    : 'Save changes'

  const busy = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async () => {
    if (!title.trim() || !body.trim()) {
      setToast('Title and message are required.')
      return
    }
    if (audience === 'LEVEL' && levelCodes.length === 0) {
      setToast('Select at least one JLPT level.')
      return
    }
    if (scheduleMode === 'LATER' && !fromLocalDateTime(laterDate, laterTime)) {
      setToast('Pick a date and time for later send.')
      return
    }
    if (scheduleMode === 'REPEAT' && !repeatTime) {
      setToast('Pick a repeat time.')
      return
    }

    const payload: CreateReminderPayload = {
      title: title.trim(),
      body: body.trim(),
      audienceType: audience,
      jlptLevelCodes: audience === 'LEVEL' ? levelCodes : [],
      scheduleMode,
      scheduledAt:
        scheduleMode === 'LATER' ? fromLocalDateTime(laterDate, laterTime) : null,
      repeatFreq: scheduleMode === 'REPEAT' ? repeatFreq : null,
      repeatTime: scheduleMode === 'REPEAT' ? `${repeatTime}:00` : null,
    }

    try {
      if (isNew) {
        const created = await createMutation.mutateAsync(payload)
        setToast(created.status === 'sent' ? 'Reminder sent.' : 'Reminder scheduled.')
        navigate('/reminders')
      } else if (editId) {
        await updateMutation.mutateAsync({ id: editId, payload })
        setToast('Reminder updated.')
        navigate('/reminders')
      }
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not save reminder.'))
    }
  }

  if (!isNew && detailQuery.isLoading) {
    return <p className="text-[13px] text-muted-foreground">Loading reminder…</p>
  }

  return (
    <>
      <p className="mb-[10px] text-[12.5px] text-muted-foreground">
        <Link to="/reminders" className="hover:underline">
          Reminders
        </Link>{' '}
        / {isNew ? 'New' : 'Edit'}
      </p>
      <PageHeader
        title={isNew ? 'New reminder' : 'Edit reminder'}
        subtitle="Write the message, pick who gets it, and when"
      />

      <div className="grid items-start gap-[20px] lg:grid-cols-[1.5fr_1fr]">
        <div>
          <Panel className="mb-[16px]">
            <PanelHead>
              <PanelTitle>Message</PanelTitle>
            </PanelHead>
            <p className="mt-[-8px] mb-[16px] text-[12px] text-muted-foreground">
              Keep it short — this is what learners see in the notification shade.
            </p>
            <label className="mb-[16px] block">
              <span className="mb-[6px] flex justify-between text-[12.5px] font-semibold">
                Title
                <span
                  className={cn(
                    'font-medium text-muted-foreground',
                    title.length >= TITLE_MAX && 'font-bold text-red-600',
                  )}
                >
                  {title.length}/{TITLE_MAX}
                </span>
              </span>
              <Input
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Don't lose your streak!"
              />
            </label>
            <label className="mb-[8px] block">
              <span className="mb-[6px] flex justify-between text-[12.5px] font-semibold">
                Message
                <span
                  className={cn(
                    'font-medium text-muted-foreground',
                    body.length >= BODY_MAX && 'font-bold text-red-600',
                  )}
                >
                  {body.length}/{BODY_MAX}
                </span>
              </span>
              <textarea
                value={body}
                maxLength={BODY_MAX}
                rows={3}
                onChange={(e) => setBody(e.target.value)}
                placeholder="You haven't practiced today — one quick drill keeps it alive."
                className="w-full rounded-[10px] border-[1.5px] border-border bg-background px-[12px] py-[10px] text-[13.5px]"
              />
            </label>
          </Panel>

          <Panel className="mb-[16px]">
            <PanelHead>
              <PanelTitle>Audience</PanelTitle>
            </PanelHead>
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">Audience</legend>
              {(
                [
                  ['ALL', 'All learners', 'Everyone with notifications on'],
                  ['INACTIVE', 'Inactive (7 days)', 'No app activity in the last week'],
                  ['LEVEL', 'By JLPT level', 'Learners with access to selected levels'],
                ] as const
              ).map(([value, label, desc]) => (
                <label
                  key={value}
                  className={cn(
                    'mb-[8px] flex cursor-pointer items-start gap-[10px] rounded-[12px] border-[1.5px] border-border px-[12px] py-[11px]',
                    audience === value && 'border-emerald-500 bg-emerald-50',
                  )}
                >
                  <input
                    type="radio"
                    name="audience"
                    className="mt-[2px] accent-emerald-500"
                    checked={audience === value}
                    onChange={() => setAudience(value)}
                  />
                  <span className="flex-1">
                    <span className="block text-[13.5px] font-semibold">{label}</span>
                    <span className="mt-[1px] block text-[11.5px] text-muted-foreground">
                      {desc}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {audience === 'LEVEL' ? (
              <div className="mt-[10px] grid grid-cols-5 gap-[8px] pl-[26px]">
                {levels.map((level) => (
                  <label
                    key={level.id}
                    className={cn(
                      'relative cursor-pointer rounded-[10px] border-[1.5px] border-border px-[4px] py-[7px] text-center text-[11.5px] font-bold',
                      levelCodes.includes(level.code) &&
                        'border-emerald-500 bg-emerald-50 text-emerald-800',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="absolute inset-0 m-0 cursor-pointer opacity-0"
                      checked={levelCodes.includes(level.code)}
                      onChange={() => toggleLevel(level.code)}
                    />
                    {level.code}
                  </label>
                ))}
              </div>
            ) : null}
          </Panel>

          <Panel className="mb-[16px]">
            <PanelHead>
              <PanelTitle>Schedule</PanelTitle>
            </PanelHead>
            <fieldset className="m-0 border-0 p-0">
              <legend className="sr-only">Schedule</legend>
              {(
                [
                  ['NOW', 'Send now', 'Deliver immediately after save'],
                  ['LATER', 'Send later', 'Pick a date and time'],
                  ['REPEAT', 'Repeat', 'Daily or weekly at a fixed time'],
                ] as const
              ).map(([value, label, desc]) => (
                <label
                  key={value}
                  className={cn(
                    'mb-[8px] flex cursor-pointer items-start gap-[10px] rounded-[12px] border-[1.5px] border-border px-[12px] py-[11px]',
                    scheduleMode === value && 'border-emerald-500 bg-emerald-50',
                  )}
                >
                  <input
                    type="radio"
                    name="schedule"
                    className="mt-[2px] accent-emerald-500"
                    checked={scheduleMode === value}
                    onChange={() => setScheduleMode(value)}
                  />
                  <span className="flex-1">
                    <span className="block text-[13.5px] font-semibold">{label}</span>
                    <span className="mt-[1px] block text-[11.5px] text-muted-foreground">
                      {desc}
                    </span>
                  </span>
                </label>
              ))}
            </fieldset>
            {scheduleMode === 'LATER' ? (
              <div className="mt-[8px] grid grid-cols-2 gap-[10px] pl-[26px]">
                <label className="block text-[12px] font-semibold">
                  Date
                  <Input
                    type="date"
                    className="mt-[6px]"
                    value={laterDate}
                    onChange={(e) => setLaterDate(e.target.value)}
                  />
                </label>
                <label className="block text-[12px] font-semibold">
                  Time
                  <Input
                    type="time"
                    className="mt-[6px]"
                    value={laterTime}
                    onChange={(e) => setLaterTime(e.target.value)}
                  />
                </label>
              </div>
            ) : null}
            {scheduleMode === 'REPEAT' ? (
              <>
                <div className="mt-[8px] grid grid-cols-2 gap-[10px] pl-[26px]">
                  <label className="block text-[12px] font-semibold">
                    Frequency
                    <select
                      className="mt-[6px] w-full rounded-[10px] border-[1.5px] border-border px-[12px] py-[10px] text-[13.5px]"
                      value={repeatFreq}
                      onChange={(e) => setRepeatFreq(e.target.value as ReminderRepeatFreq)}
                    >
                      <option value="DAILY">Daily</option>
                      <option value="WEEKLY">Weekly</option>
                    </select>
                  </label>
                  <label className="block text-[12px] font-semibold">
                    Time
                    <Input
                      type="time"
                      className="mt-[6px]"
                      value={repeatTime}
                      onChange={(e) => setRepeatTime(e.target.value)}
                    />
                  </label>
                </div>
                <p className="mt-[8px] ml-[26px] rounded-[10px] border border-amber-300 bg-amber-50 px-[12px] py-[9px] text-[11.5px] text-amber-800">
                  Repeats stay scheduled and advance after each send (Asia/Yangon).
                </p>
              </>
            ) : null}
          </Panel>

          <div className="flex gap-[10px]">
            <Button disabled={busy} onClick={() => void handleSubmit()}>
              {busy ? 'Saving…' : ctaLabel}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/reminders')}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-[20px]">
          <div className="rounded-[32px] bg-slate-900 p-[10px] shadow-xl">
            <div className="min-h-[280px] rounded-[24px] bg-gradient-to-br from-sky-300 to-emerald-500 px-[12px] pb-[20px] pt-[40px]">
              <div className="flex gap-[10px] rounded-[16px] bg-white/90 p-[12px] shadow-lg backdrop-blur">
                <div
                  className="flex size-[32px] shrink-0 items-center justify-center rounded-[9px] bg-emerald-500 text-[16px]"
                  aria-hidden
                >
                  🦉
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Tobu
                  </div>
                  <div className="mt-[1px] text-[13px] font-bold">
                    {title.trim() || 'Notification title'}
                  </div>
                  <div className="mt-[2px] text-[12px] leading-snug text-muted-foreground">
                    {body.trim() || 'Your message preview appears here.'}
                  </div>
                </div>
                <div className="shrink-0 text-[10px] text-slate-400">now</div>
              </div>
            </div>
          </div>
          <p className="mt-[10px] text-center text-[11.5px] text-muted-foreground">
            Live preview
          </p>
        </div>
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
