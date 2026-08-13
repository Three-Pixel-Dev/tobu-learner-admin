import { useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { FormDialog } from '@/components/common/form-dialog'
import { Button } from '@/components/ui/button'
import { useUploadLessonsBatchMutation } from '@/shared/queries/lesson.query'

interface LessonBatchUploadModalProps {
  open: boolean
  jlptLevelCode: string | null
  jlptLevelName?: string | null
  onClose: () => void
  onSuccess: (summary: string) => void
  onError: (msg: string) => void
}

export function LessonBatchUploadModal({
  open,
  jlptLevelCode,
  jlptLevelName,
  onClose,
  onSuccess,
  onError,
}: LessonBatchUploadModalProps) {
  const uploadMutation = useUploadLessonsBatchMutation()
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file || !jlptLevelCode) return
    try {
      const result = await uploadMutation.mutateAsync({
        jlptLevelCode,
        file,
      })
      setFile(null)
      onSuccess(
        `Created ${result.created}, updated ${result.updated}, published ${result.published}.`,
      )
    } catch (err) {
      onError(getApiErrorMessage(err, 'Failed to upload lessons.'))
    }
  }

  const handleClose = () => {
    if (uploadMutation.isPending) return
    setFile(null)
    onClose()
  }

  return (
    <FormDialog
      open={open}
      title="Batch Upload Lessons"
      description={
        jlptLevelCode
          ? `Match Lesson ID → update; blank ID → insert. Vocab/Grammar/Quiz rows join by Lesson ID. Lessons not in the file are left alone. Uploading for ${jlptLevelName ?? jlptLevelCode}.`
          : 'Select a JLPT level first.'
      }
      onClose={handleClose}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="mb-2 block text-sm font-semibold">Excel File</label>
          <a
            href="/lessons_batch_sample.xlsx"
            download
            className="text-xs text-primary hover:underline"
          >
            Download Sample Template
          </a>
        </div>

        <input
          type="file"
          accept=".xlsx"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-muted-foreground
            file:mr-4 file:rounded-md file:border-0
            file:bg-muted file:px-4
            file:py-2 file:text-sm
            file:font-semibold file:text-foreground
            hover:file:bg-muted/80 cursor-pointer"
          disabled={uploadMutation.isPending || !jlptLevelCode}
        />

        <div className="rounded-xl border border-muted bg-muted/40 p-4 text-xs text-subtle">
          <p className="mb-1 font-semibold text-foreground">Sheets (exact names):</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <span className="font-medium">Lessons</span> — Lesson ID (stable key; blank = always
              insert), Title, Published (optional TRUE/FALSE)
            </li>
            <li>
              <span className="font-medium">Vocab</span> — Lesson ID, Word, Meaning MM, Meaning EN
            </li>
            <li>
              <span className="font-medium">Grammar</span> — Lesson ID, Pattern, Description MM,
              Description EN
            </li>
            <li>
              <span className="font-medium">GrammarExamples</span> — Lesson ID, Pattern, Japanese,
              Translation MM
            </li>
            <li>
              <span className="font-medium">Quiz</span> — Lesson ID, Mondai, Prompt, Choice1–4,
              Correct (1–4), Explain MM, Explain EN
            </li>
          </ul>
          <p className="mt-2 text-[11px]">
            Content rows must use a Lesson ID that appears on the Lessons sheet (blank Lesson ID
            lessons cannot receive content). Audio/images are not imported via Excel.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!file || !jlptLevelCode || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload File'}
          </Button>
        </div>
      </div>
    </FormDialog>
  )
}
