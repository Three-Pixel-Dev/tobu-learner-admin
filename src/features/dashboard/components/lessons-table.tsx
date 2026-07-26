import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { Tabs } from '@/components/common/tabs'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { Status } from '@/components/ui/status'
import { IconButton } from '@/components/ui/icon-button'
import { DASHBOARD_LESSONS, LEVEL_LEGEND, LEVEL_TABS } from '@/features/dashboard/dashboard.mock'

export function LessonsTable() {
  const [level, setLevel] = useState('N4')
  const navigate = useNavigate()

  return (
    <Panel>
      <PanelHead>
        <PanelTitle>📘 Manage lessons</PanelTitle>
        <Tabs items={LEVEL_TABS} value={level} onValueChange={setLevel} />
      </PanelHead>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <Th>Lesson</Th>
            <Th>Content</Th>
            <Th>Status</Th>
            <Th />
          </tr>
        </thead>
        <tbody>
          {DASHBOARD_LESSONS.map((lesson) => (
            <tr key={lesson.id} className="[&>td]:border-b [&>td]:border-muted last:[&>td]:border-b-0">
              <Td>
                <div className="font-semibold">{lesson.name}</div>
                <div className="mt-[1px] text-[11.5px] text-subtle">{lesson.sub}</div>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-[6px]">
                  <Pill variant="vocab">Vocab {lesson.vocab}</Pill>
                  <Pill variant="grammar">Grammar {lesson.grammar}</Pill>
                  <Pill variant="quiz">Quiz {lesson.quiz}</Pill>
                </div>
              </Td>
              <Td>
                <Status active={lesson.published} label={lesson.published ? 'Published' : 'Draft'} />
              </Td>
              <Td>
                <div className="flex gap-[6px]">
                  <IconButton onClick={() => navigate('/lessons')}>✎</IconButton>
                  <IconButton>⋯</IconButton>
                </div>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-[14px] flex flex-wrap gap-[8px]">
        {LEVEL_LEGEND.map((item) => (
          <div
            key={item.level}
            className="flex items-center gap-[8px] rounded-xl bg-primary-soft px-[12px] py-[7px] font-display text-[12px] font-semibold text-primary-dark"
          >
            {item.level}
            <span className="rounded-lg bg-card px-[7px] py-[1px] text-[11px]">{item.count}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

function Th({ children }: { children?: ReactNode }) {
  return (
    <th className="border-b-[1.5px] border-muted px-[10px] py-[8px] text-left text-[11px] font-bold uppercase tracking-[0.05em] text-subtle">
      {children}
    </th>
  )
}

function Td({ children }: { children?: ReactNode }) {
  return <td className="px-[10px] py-[12px] align-middle text-[13.5px]">{children}</td>
}
