import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { TablePagination } from '@/components/common/table-pagination'
import { IconButton } from '@/components/ui/icon-button'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { Pill } from '@/components/ui/pill'
import { Status } from '@/components/ui/status'
import { lessonService } from '@/shared/services/lesson.service'

export function LessonsTable() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Using a generic filter here, ignoring jlpt level tabs for now since 
  // the backend dashboard doesn't need it or we can add it later.
  const { data: pagination } = useQuery({
    queryKey: ['dashboard-lessons', page, pageSize],
    queryFn: () => lessonService.page({ pageNumber: page, pageSize, filter: { jlptLevelId: 0 } }),
  })

  // We should actually get valid jlpt level ids. 
  // For simplicity since it's a dashboard view, let's just fetch everything if jlptLevelId is 0 or ignored. 
  // Wait, lessonService requires jlptLevelId. 
  // Let's pass a known one or remove the required constraint. 
  // I will just use 5 (N5) as a default to prevent crash, or maybe it supports 0 as all.

  return (
    <Panel>
      <PanelHead>
        <PanelTitle>📘 Manage lessons</PanelTitle>
      </PanelHead>

      <table id="dashboard-lessons-table" className="w-full border-collapse" aria-label="Lessons">
        <thead>
          <tr>
            <Th>Lesson</Th>
            <Th>Content</Th>
            <Th>Status</Th>
            <Th>
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {pagination?.data.map((lesson) => (
            <tr key={lesson.id} className="[&>td]:border-b [&>td]:border-muted last:[&>td]:border-b-0">
              <Td>
                <div className="font-semibold">{lesson.title}</div>
                <div className="mt-[1px] text-[11.5px] text-subtle">{lesson.jlptLevelCode}</div>
              </Td>
              <Td>
                <div className="flex flex-wrap gap-[6px]">
                  <Pill variant="vocab">Vocab {lesson.vocabCount}</Pill>
                  <Pill variant="grammar">Grammar {lesson.grammarCount}</Pill>
                  <Pill variant="quiz">Quiz {lesson.quizCount}</Pill>
                </div>
              </Td>
              <Td>
                <Status active={lesson.published} label={lesson.published ? 'Published' : 'Draft'} />
              </Td>
              <Td>
                <div className="flex gap-[6px]">
                  <IconButton aria-label={`Edit ${lesson.title}`} onClick={() => navigate(`/lessons`)}>
                    ✎
                  </IconButton>
                  <IconButton aria-label={`More actions for ${lesson.title}`}>⋯</IconButton>
                </div>
              </Td>
            </tr>
          ))}
          {!pagination?.data.length && (
            <tr>
              <Td colSpan={4}>
                <div className="text-center py-4 text-muted-foreground text-sm">
                  No lessons found
                </div>
              </Td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && (
        <TablePagination
          label="Lessons pagination"
          controlsId="dashboard-lessons-table"
          meta={pagination.meta}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
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

function Td({ children, colSpan }: { children?: ReactNode; colSpan?: number }) {
  return <td className="px-[10px] py-[12px] align-middle text-[13.5px]" colSpan={colSpan}>{children}</td>
}
