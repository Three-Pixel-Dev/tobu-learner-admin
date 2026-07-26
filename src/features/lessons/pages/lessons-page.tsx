import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { TablePagination } from '@/components/common/table-pagination'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { LevelSwitcher } from '@/features/lessons/components/level-switcher'
import {
  useCreateLessonMutation,
  useLessonsQuery,
  useSoftDeleteLessonMutation,
} from '@/shared/queries/lesson.query'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import type { LessonDto } from '@/shared/services/lesson.service'
import { cn } from '@/util/cn'

const PAGE_SIZES = [10, 25, 50] as const

export function LessonsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const levelsQuery = useJlptLevelsQuery()
  const levels = useMemo(
    () => (levelsQuery.data ?? []).filter((l) => !l.deleted),
    [levelsQuery.data],
  )

  const levelIdFromUrl = Number(searchParams.get('levelId') || 0) || null
  const [levelId, setLevelId] = useState<number | null>(levelIdFromUrl)
  const [search, setSearch] = useState('')
  const [pageNumber, setPageNumber] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [pendingDisable, setPendingDisable] = useState<LessonDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (levelId != null || levels.length === 0) return
    const preferred =
      levels.find((l) => l.code.toUpperCase() === 'N4') ??
      levels.find((l) => l.unlocked) ??
      levels[0]
    setLevelId(preferred.id)
  }, [levels, levelId])

  useEffect(() => {
    if (levelId == null) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('levelId', String(levelId))
      return next
    }, { replace: true })
  }, [levelId, setSearchParams])

  const currentLevel = levels.find((l) => l.id === levelId) ?? null
  const lessonsQuery = useLessonsQuery(levelId, search, pageNumber, pageSize)
  const createMutation = useCreateLessonMutation()
  const softDeleteMutation = useSoftDeleteLessonMutation()

  const rows = lessonsQuery.data?.data ?? []
  const meta = lessonsQuery.data?.meta

  const selectLevel = (id: number) => {
    setLevelId(id)
    setPageNumber(1)
    setSearch('')
  }

  const handleCreate = async () => {
    if (!levelId || !newTitle.trim()) return
    try {
      const created = await createMutation.mutateAsync({
        jlptLevelId: levelId,
        title: newTitle.trim(),
      })
      setCreateOpen(false)
      setNewTitle('')
      setToast('Lesson created.')
      navigate(`/lessons/${created.id}/edit`)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not create lesson.'))
    }
  }

  const handleDisable = async () => {
    if (!pendingDisable) return
    try {
      await softDeleteMutation.mutateAsync(pendingDisable.id)
      setPendingDisable(null)
      setToast('Lesson disabled — hidden from learners, can be restored anytime.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not disable lesson.'))
    }
  }

  const locked = currentLevel != null && !currentLevel.unlocked

  return (
    <>
      <div className="-mx-[2px] mb-[18px] flex flex-wrap items-center justify-between gap-[12px] rounded-[16px] border border-border bg-card px-[18px] py-[12px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className="text-[12.5px] text-subtle">Content / Lessons /</span>
          <LevelSwitcher levels={levels} value={levelId} onChange={selectLevel} />
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Input
            className="w-[200px] bg-muted"
            placeholder={currentLevel ? `Search ${currentLevel.code} lessons…` : 'Search lessons…'}
            value={search}
            disabled={locked || levelId == null}
            onChange={(e) => {
              setSearch(e.target.value)
              setPageNumber(1)
            }}
          />
          <Button
            type="button"
            disabled={locked || levelId == null}
            onClick={() => setCreateOpen(true)}
          >
            ＋ New lesson
          </Button>
        </div>
      </div>

      <PageHeader
        title="Lessons"
        subtitle={
          currentLevel
            ? locked
              ? `${currentLevel.code} is locked — unlock it before adding lessons.`
              : `${meta?.totalElements ?? 0} lessons for JLPT ${currentLevel.code}.`
            : 'Select a JLPT level to manage lessons.'
        }
      />

      <Panel className="overflow-hidden p-0">
        {locked ? (
          <div className="px-[20px] py-[50px] text-center">
            <div className="mb-[10px] text-[32px]" aria-hidden>
              🔒
            </div>
            <h3 className="m-0 mb-[6px] font-display text-[15px]">This level is locked</h3>
            <p className="m-0 text-[13px] text-muted-foreground">
              Unlock {currentLevel?.code} from JLPT Levels management before adding lessons here.
            </p>
          </div>
        ) : lessonsQuery.isLoading ? (
          <div className="px-[20px] py-[40px] text-center text-[13px] text-muted-foreground">
            Loading lessons…
          </div>
        ) : lessonsQuery.isError ? (
          <div className="px-[20px] py-[40px] text-center text-[13px] text-destructive">
            Could not load lessons.
          </div>
        ) : (meta?.totalElements ?? 0) === 0 && !search.trim() ? (
          <div className="px-[20px] py-[50px] text-center">
            <div className="mb-[10px] text-[32px]" aria-hidden>
              📘
            </div>
            <h3 className="m-0 mb-[6px] font-display text-[15px]">
              No lessons for JLPT {currentLevel?.code} yet
            </h3>
            <p className="m-0 text-[13px] text-muted-foreground">
              This level is unlocked and ready — add the first lesson to start building out content
              learners will see.
            </p>
            <Button className="mt-[14px]" type="button" onClick={() => setCreateOpen(true)}>
              ＋ Create first lesson
            </Button>
          </div>
        ) : rows.length === 0 ? (
          <div className="px-[20px] py-[50px] text-center">
            <div className="mb-[10px] text-[32px]" aria-hidden>
              🔍
            </div>
            <h3 className="m-0 mb-[6px] font-display text-[15px]">No lessons match your search</h3>
            <p className="m-0 text-[13px] text-muted-foreground">
              Try a different keyword, or clear the search box.
            </p>
          </div>
        ) : (
          <div role="table" aria-label="Lessons" id="lessons-table">
            <div
              className="grid grid-cols-[1.4fr_1fr_0.7fr_auto] gap-[12px] bg-surface px-[20px] py-[12px] text-[10.5px] font-bold uppercase text-subtle max-md:hidden"
              role="row"
            >
              <div role="columnheader">Lesson</div>
              <div role="columnheader">Content</div>
              <div role="columnheader">Status</div>
              <div role="columnheader" className="text-right">
                Actions
              </div>
            </div>
            {rows.map((lesson) => (
              <div
                key={lesson.id}
                className={cn(
                  'grid grid-cols-[1.4fr_1fr_0.7fr_auto] items-center gap-[12px] border-t border-muted px-[20px] py-[14px] max-md:grid-cols-1',
                  lesson.deleted && 'opacity-55',
                )}
                role="row"
              >
                <div role="cell">
                  <button
                    type="button"
                    className="cursor-pointer border-none bg-transparent p-0 text-left font-body"
                    onClick={() => navigate(`/lessons/${lesson.id}`)}
                  >
                    <div className="text-[13.5px] font-semibold hover:text-primary-dark hover:underline">
                      {lesson.title}
                    </div>
                    <div className="mt-[1px] text-[11.5px] text-subtle">
                      {lesson.vocabCount + lesson.grammarCount + lesson.quizCount} items ・{' '}
                      {lesson.jlptLevelCode}
                      {lesson.deleted ? ' ・ Disabled' : ''}
                    </div>
                  </button>
                </div>
                <div role="cell" className="flex flex-wrap gap-[4px]">
                  <span className="rounded-[20px] bg-info-soft px-[9px] py-[3px] text-[11px] font-bold text-info-foreground">
                    Vocab {lesson.vocabCount}
                  </span>
                  <span className="rounded-[20px] bg-[#EDE9FE] px-[9px] py-[3px] text-[11px] font-bold text-[#6D28D9]">
                    Grammar {lesson.grammarCount}
                  </span>
                  <span className="rounded-[20px] bg-warning-soft px-[9px] py-[3px] text-[11px] font-bold text-warning-foreground">
                    Quiz {lesson.quizCount}
                  </span>
                </div>
                <div role="cell">
                  <span className="inline-flex items-center gap-[6px] text-[12.5px] font-semibold">
                    <span
                      className={cn(
                        'h-[7px] w-[7px] rounded-full',
                        lesson.published && !lesson.deleted ? 'bg-primary' : 'bg-[#CBD5E1]',
                      )}
                    />
                    {lesson.deleted ? 'Disabled' : lesson.published ? 'Published' : 'Draft'}
                  </span>
                </div>
                <div role="cell" className="flex justify-end gap-[6px]">
                  <Link
                    to={`/lessons/${lesson.id}/edit`}
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-[9px] border-[1.5px] border-border bg-card text-[13px] text-muted-foreground no-underline"
                    aria-label="Edit"
                  >
                    ✎
                  </Link>
                  <ActionMenu
                    label={`Actions for ${lesson.title}`}
                    items={[
                      {
                        id: 'detail',
                        label: 'Open detail',
                        onSelect: () => navigate(`/lessons/${lesson.id}`),
                      },
                      ...(lesson.deleted
                        ? []
                        : [
                            {
                              id: 'disable',
                              label: 'Disable',
                              tone: 'danger' as const,
                              onSelect: () => setPendingDisable(lesson),
                            },
                          ]),
                    ]}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {!locked && rows.length > 0 && meta ? (
        <TablePagination
          label="Lessons pagination"
          controlsId="lessons-table"
          meta={meta}
          pageSizes={PAGE_SIZES}
          busy={lessonsQuery.isFetching}
          onPageChange={setPageNumber}
          onPageSizeChange={(size) => {
            setPageSize(size)
            setPageNumber(1)
          }}
        />
      ) : null}

      <FormDialog
        open={createOpen}
        title="New lesson"
        description={currentLevel ? `Creating under ${currentLevel.code}` : undefined}
        onClose={() => setCreateOpen(false)}
      >
        <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="lesson-title">
          Title
        </label>
        <Input
          id="lesson-title"
          value={newTitle}
          placeholder="Lesson 1 ・ あいさつ"
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <div className="mt-[18px] flex justify-end gap-[10px]">
          <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!newTitle.trim() || createMutation.isPending}
            onClick={handleCreate}
          >
            {createMutation.isPending ? 'Creating…' : 'Create & edit'}
          </Button>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(pendingDisable)}
        title="Disable this lesson?"
        description={
          pendingDisable ? (
            <>
              <strong className="text-foreground">{pendingDisable.title}</strong> will be hidden from
              learners. You can restore it later.
            </>
          ) : null
        }
        confirmLabel="Disable"
        busy={softDeleteMutation.isPending}
        onConfirm={handleDisable}
        onCancel={() => setPendingDisable(null)}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
