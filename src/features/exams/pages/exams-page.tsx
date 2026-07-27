import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { getApiErrorMessage } from '@/app/api/http-client'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { FormDialog } from '@/components/common/form-dialog'
import { PageHeader } from '@/components/common/page-header'
import { Toast } from '@/components/common/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ExamDetailModal } from '@/features/exams/components/exam-detail-modal'
import { ExamGrid } from '@/features/exams/components/exam-grid'
import {
  useCreateExam,
  useDeleteExam,
  useExamDetail,
  useExamsInfiniteQuery,
  useRestoreExam,
} from '@/features/exams/exam.query'
import { LevelSwitcher } from '@/features/lessons/components/level-switcher'
import { useJlptLevelsQuery } from '@/shared/queries/jlpt-level.query'
import type { ExamDto, ExamFilter } from '@/shared/services/exam.service'

export function ExamsPage() {
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
  const [includeDisabled, setIncludeDisabled] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newTitleJp, setNewTitleJp] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  const [pendingDisable, setPendingDisable] = useState<ExamDto | null>(null)
  const [previewId, setPreviewId] = useState<number | null>(null)
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
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('levelId', String(levelId))
        return next
      },
      { replace: true },
    )
  }, [levelId, setSearchParams])

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timer)
  }, [searchInput])

  const currentLevel = levels.find((l) => l.id === levelId) ?? null

  const filter = useMemo<ExamFilter>(
    () => ({
      jlptLevelId: levelId ?? undefined,
      search: search || undefined,
      includeDisabled,
    }),
    [levelId, search, includeDisabled],
  )

  const examsQuery = useExamsInfiniteQuery(filter, levelId != null)
  const createMutation = useCreateExam()
  const deleteMutation = useDeleteExam()
  const restoreMutation = useRestoreExam()
  const previewQuery = useExamDetail(previewId ?? undefined)

  const exams = useMemo(
    () => examsQuery.data?.pages.flatMap((page) => page.data) ?? [],
    [examsQuery.data],
  )
  const totalElements = examsQuery.data?.pages[0]?.meta.totalElements ?? exams.length

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          examsQuery.hasNextPage &&
          !examsQuery.isFetchingNextPage
        ) {
          void examsQuery.fetchNextPage()
        }
      },
      { rootMargin: '240px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [examsQuery.hasNextPage, examsQuery.isFetchingNextPage, examsQuery.fetchNextPage, exams.length])

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
        titleJp: newTitleJp.trim() || undefined,
        questions: [],
      })
      setCreateOpen(false)
      setNewTitle('')
      setNewTitleJp('')
      setToast('Exam created.')
      navigate(`/exams/${created.id}/edit`)
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not create exam.'))
    }
  }

  const handleDisableConfirm = async () => {
    if (!pendingDisable) return
    try {
      await deleteMutation.mutateAsync(pendingDisable.id)
      setPendingDisable(null)
      setToast('Exam disabled.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not disable exam.'))
    }
  }

  const handleRestore = async (id: number) => {
    try {
      await restoreMutation.mutateAsync(id)
      setToast('Exam restored.')
    } catch (err) {
      setToast(getApiErrorMessage(err, 'Could not restore exam.'))
    }
  }

  return (
    <>
      <div className="-mx-[2px] mb-[18px] flex flex-wrap items-center justify-between gap-[12px] rounded-[16px] border border-border bg-card px-[18px] py-[12px]">
        <div className="flex flex-wrap items-center gap-[12px]">
          <span className="text-[12.5px] text-subtle">Content / Exams /</span>
          <LevelSwitcher levels={levels} value={levelId} onChange={selectLevel} countKind="exams" />
        </div>
        <div className="flex flex-wrap items-center gap-[10px]">
          <Input
            className="w-[200px] bg-muted"
            placeholder={currentLevel ? `Search ${currentLevel.code} exams…` : 'Search exams…'}
            value={searchInput}
            disabled={levelId == null}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <label className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
              className="rounded border-muted text-primary"
            />
            Show disabled
          </label>
          <Button type="button" disabled={levelId == null} onClick={() => setCreateOpen(true)}>
            ＋ New exam
          </Button>
        </div>
      </div>

      <PageHeader
        title="Mock Exam Bank"
        subtitle={
          currentLevel
            ? `${totalElements} exam papers for JLPT ${currentLevel.code}.`
            : 'Select a JLPT level to manage mock exams.'
        }
      />

      <ExamGrid
        exams={exams}
        loading={(examsQuery.isLoading || levelsQuery.isLoading) && exams.length === 0}
        onOpen={(exam) => navigate(`/exams/${exam.id}`)}
        onPreview={(exam) => setPreviewId(exam.id)}
        onEdit={(exam) => navigate(`/exams/${exam.id}/edit`)}
        onDelete={setPendingDisable}
        onRestore={handleRestore}
      />

      {exams.length > 0 ? (
        <div ref={sentinelRef} className="py-4 text-center text-[11px] text-subtle">
          {examsQuery.isFetchingNextPage
            ? 'Loading more…'
            : examsQuery.hasNextPage
              ? 'Scroll for more'
              : `Showing ${exams.length} of ${totalElements}`}
        </div>
      ) : null}

      <ExamDetailModal
        exam={previewQuery.data ?? null}
        open={previewId != null && Boolean(previewQuery.data)}
        onClose={() => setPreviewId(null)}
      />

      {previewId != null && previewQuery.isLoading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-2xl border border-muted bg-card px-6 py-4 text-sm font-semibold text-foreground shadow-xl">
            Loading preview…
          </div>
        </div>
      ) : null}

      {previewId != null && previewQuery.isError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-2xl border border-muted bg-card p-5 shadow-xl">
            <p className="m-0 text-sm text-destructive">Could not load exam preview.</p>
            <div className="mt-4 flex justify-end">
              <Button type="button" variant="ghost" onClick={() => setPreviewId(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <FormDialog
        open={createOpen}
        title="Create exam paper"
        description={
          currentLevel
            ? `Creating under ${currentLevel.code}. Add a title, then edit questions on the next screen.`
            : 'Add a title, then edit questions on the next screen.'
        }
        onClose={() => {
          if (!createMutation.isPending) setCreateOpen(false)
        }}
      >
        <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="exam-create-title">
          Exam title
        </label>
        <Input
          id="exam-create-title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="e.g. Test 1 / N5 Mock Exam #1"
          disabled={createMutation.isPending}
        />
        <label
          className="mb-[6px] mt-[14px] block text-[12.5px] font-semibold"
          htmlFor="exam-create-title-jp"
        >
          Title (JP)
        </label>
        <Input
          id="exam-create-title-jp"
          value={newTitleJp}
          onChange={(e) => setNewTitleJp(e.target.value)}
          placeholder="だい１かい"
          disabled={createMutation.isPending}
        />
        <div className="mt-[18px] flex justify-end gap-[10px]">
          <Button
            type="button"
            variant="ghost"
            disabled={createMutation.isPending}
            onClick={() => setCreateOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={createMutation.isPending || !newTitle.trim()}
            onClick={() => void handleCreate()}
          >
            {createMutation.isPending ? 'Creating…' : 'Create & edit'}
          </Button>
        </div>
      </FormDialog>

      <ConfirmDialog
        open={Boolean(pendingDisable)}
        title="Disable this exam paper?"
        description={
          pendingDisable ? (
            <>
              <strong className="text-foreground">{pendingDisable.title}</strong> will be hidden from
              learners. You can restore it later.
            </>
          ) : null
        }
        confirmLabel="Disable"
        busy={deleteMutation.isPending}
        onConfirm={() => void handleDisableConfirm()}
        onCancel={() => {
          if (!deleteMutation.isPending) setPendingDisable(null)
        }}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </>
  )
}
