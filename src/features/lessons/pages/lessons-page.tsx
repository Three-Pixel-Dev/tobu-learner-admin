import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ActionMenu } from '@/components/common/action-menu'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { LevelSwitcher } from '@/features/lessons/components/level-switcher'
import {
  useCreateLessonMutation,
  useDuplicateLessonMutation,
  useLessonsInfiniteQuery,
  useSoftDeleteLessonMutation,
} from '@/shared/queries/lesson.query'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import type { LessonDto } from '@/shared/services/lesson.service'
import { cn } from '@/util/cn'

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
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [pendingDisable, setPendingDisable] = useState<LessonDto | null>(null)
  const [pendingDuplicate, setPendingDuplicate] = useState<LessonDto | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (levelId != null || levels.length === 0) return
    const preferred =
      levels.find((l) => l.code.toUpperCase() === 'N5') ??
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

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const currentLevel = levels.find((l) => l.id === levelId) ?? null
  const lessonsQuery = useLessonsInfiniteQuery(levelId, search)
  const createMutation = useCreateLessonMutation()
  const softDeleteMutation = useSoftDeleteLessonMutation()
  const duplicateMutation = useDuplicateLessonMutation()

  const rows = useMemo(
    () => lessonsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [lessonsQuery.data],
  )
  const totalElements = lessonsQuery.data?.pages[0]?.meta.totalElements ?? rows.length

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          lessonsQuery.hasNextPage &&
          !lessonsQuery.isFetchingNextPage
        ) {
          void lessonsQuery.fetchNextPage()
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [lessonsQuery.hasNextPage, lessonsQuery.isFetchingNextPage, lessonsQuery.fetchNextPage, rows.length])

  const selectLevel = (id: number) => {
    setLevelId(id)
    setSearchInput('')
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

  const handleDuplicate = async () => {
    if (!pendingDuplicate) return
    try {
      const copy = await duplicateMutation.mutateAsync(pendingDuplicate.id)
      setPendingDuplicate(null)
      setToast('Duplicated — a draft copy was added to this level.')
      navigate(`/lessons/${copy.id}/edit`)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not duplicate lesson.'))
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
            value={searchInput}
            disabled={locked || levelId == null}
            onChange={(e) => setSearchInput(e.target.value)}
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
              : `${totalElements} lessons for JLPT ${currentLevel.code}.`
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
        ) : totalElements === 0 && !search.trim() ? (
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
                role="row"
                tabIndex={0}
                className={cn(
                  'grid cursor-pointer grid-cols-[1.4fr_1fr_0.7fr_auto] items-center gap-[12px] border-t border-muted px-[20px] py-[14px] transition-colors hover:bg-muted/40 max-md:grid-cols-1',
                  lesson.deleted && 'opacity-55',
                )}
                onClick={() => navigate(`/lessons/${lesson.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    navigate(`/lessons/${lesson.id}`)
                  }
                }}
              >
                <div role="cell">
                  <div className="text-[13.5px] font-semibold">{lesson.title}</div>
                  <div className="mt-[1px] text-[11.5px] text-subtle">
                    {lesson.vocabCount + lesson.grammarCount + lesson.quizCount} items ・{' '}
                    {lesson.jlptLevelCode}
                    {lesson.deleted ? ' ・ Disabled' : ''}
                  </div>
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
                <div
                  role="cell"
                  className="flex justify-end gap-[6px]"
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                >
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
                      {
                        id: 'duplicate',
                        label: 'Duplicate',
                        onSelect: () => setPendingDuplicate(lesson),
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
            <div
              ref={sentinelRef}
              className="border-t border-muted px-[20px] py-[14px] text-center text-[11px] text-subtle"
            >
              {lessonsQuery.isFetchingNextPage
                ? 'Loading more…'
                : lessonsQuery.hasNextPage
                  ? 'Scroll for more'
                  : `Showing ${rows.length} of ${totalElements}`}
            </div>
          </div>
        )}
      </Panel>

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
        onConfirm={() => void handleDisable()}
        onCancel={() => {
          if (!softDeleteMutation.isPending) setPendingDisable(null)
        }}
      />

      <ConfirmDialog
        open={Boolean(pendingDuplicate)}
        title="Duplicate this lesson?"
        description={
          pendingDuplicate ? (
            <>
              A draft copy of <strong className="text-foreground">{pendingDuplicate.title}</strong> will
              be created under this JLPT level.
            </>
          ) : null
        }
        confirmLabel="Duplicate"
        tone="primary"
        icon="⧉"
        busy={duplicateMutation.isPending}
        onConfirm={() => void handleDuplicate()}
        onCancel={() => {
          if (!duplicateMutation.isPending) setPendingDuplicate(null)
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
