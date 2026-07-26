import { useState } from 'react'

import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  useCreateExam,
  useDeleteExam,
  useExamDetail,
  useExamList,
  useRestoreExam,
  useUpdateExam,
} from '@/features/exams/exam.query'
import { ExamDetailModal } from '@/features/exams/components/exam-detail-modal'
import { ExamDrawer } from '@/features/exams/components/exam-drawer'
import { ExamGrid } from '@/features/exams/components/exam-grid'
import type { CreateExamPayload, ExamDto, UpdateExamPayload } from '@/shared/services/exam.service'

const JLPT_LEVELS = [
  { label: 'All Levels', value: undefined, id: undefined },
  { label: 'N5', value: 'N5', id: 1 },
  { label: 'N4', value: 'N4', id: 2 },
  { label: 'N3', value: 'N3', id: 3 },
  { label: 'N2', value: 'N2', id: 4 },
  { label: 'N1', value: 'N1', id: 5 },
]

export function ExamsPage() {
  const [selectedLevelId, setSelectedLevelId] = useState<number | undefined>(undefined)
  const [search, setSearch] = useState('')
  const [includeDisabled, setIncludeDisabled] = useState(false)

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedExamId, setSelectedExamId] = useState<number | null>(null)

  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [previewExamId, setPreviewExamId] = useState<number | null>(null)

  // React Query hooks
  const { data: pageData, isLoading } = useExamList(
    {
      jlptLevelId: selectedLevelId,
      search: search.trim() || undefined,
      includeDisabled,
    },
    0,
    100,
  )

  const { data: activeDetail } = useExamDetail(selectedExamId || undefined)
  const { data: previewDetail } = useExamDetail(previewExamId || undefined)

  const createMutation = useCreateExam()
  const updateMutation = useUpdateExam()
  const deleteMutation = useDeleteExam()
  const restoreMutation = useRestoreExam()

  const exams = pageData?.content || []

  const handleOpenCreate = () => {
    setSelectedExamId(null)
    setDrawerMode('create')
    setDrawerOpen(true)
  }

  const handleOpenEdit = (exam: ExamDto) => {
    setSelectedExamId(exam.id)
    setDrawerMode('edit')
    setDrawerOpen(true)
  }

  const handleOpenPreview = (exam: ExamDto) => {
    setPreviewExamId(exam.id)
    setDetailModalOpen(true)
  }

  const handleSaveDrawer = async (payload: CreateExamPayload | UpdateExamPayload) => {
    if (drawerMode === 'create') {
      await createMutation.mutateAsync(payload as CreateExamPayload)
    } else if (selectedExamId) {
      await updateMutation.mutateAsync({ id: selectedExamId, payload })
    }
    setDrawerOpen(false)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to disable this exam paper?')) {
      await deleteMutation.mutateAsync(id)
      if (drawerOpen) setDrawerOpen(false)
    }
  }

  const handleRestore = async (id: number) => {
    await restoreMutation.mutateAsync(id)
    if (drawerOpen) setDrawerOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Mock Exam Bank"
        subtitle="Manage JLPT Mock Test Papers, Question Banks & Choice Options"
      >
        <Button onClick={handleOpenCreate}>＋ New Exam Paper</Button>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-card p-4 border border-muted shadow-sm">
        {/* Level Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {JLPT_LEVELS.map((lvl) => {
            const active = selectedLevelId === lvl.id
            return (
              <button
                key={lvl.label}
                type="button"
                onClick={() => setSelectedLevelId(lvl.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {lvl.label}
              </button>
            )
          })}
        </div>

        {/* Search & Options */}
        <div className="flex items-center gap-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search exam title..."
            className="w-48 text-xs h-9"
          />

          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground select-none">
            <input
              type="checkbox"
              checked={includeDisabled}
              onChange={(e) => setIncludeDisabled(e.target.checked)}
              className="rounded border-muted text-primary"
            />
            Show Disabled
          </label>
        </div>
      </div>

      {/* Exam Card Grid */}
      <ExamGrid
        exams={exams}
        loading={isLoading}
        onEdit={handleOpenEdit}
        onViewDetail={handleOpenPreview}
        onDelete={handleDelete}
        onRestore={handleRestore}
      />

      {/* Exam Creation / Editing Drawer */}
      <ExamDrawer
        open={drawerOpen}
        mode={drawerMode}
        initial={drawerMode === 'edit' ? activeDetail : null}
        busy={createMutation.isPending || updateMutation.isPending || deleteMutation.isPending || restoreMutation.isPending}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSaveDrawer}
        onDelete={selectedExamId ? () => handleDelete(selectedExamId) : undefined}
        onRestore={selectedExamId ? () => handleRestore(selectedExamId) : undefined}
      />

      {/* Exam Detailed Preview Modal */}
      <ExamDetailModal
        open={detailModalOpen}
        exam={previewDetail || null}
        onClose={() => setDetailModalOpen(false)}
      />
    </div>
  )
}
