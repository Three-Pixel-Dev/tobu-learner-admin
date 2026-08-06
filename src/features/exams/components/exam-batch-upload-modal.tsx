import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/form-dialog'
import { useUploadExamQuestionsBatch } from '@/features/exams/exam.query'
import { getApiErrorMessage } from '@/app/api/http-client'

interface ExamBatchUploadModalProps {
  examId: number
  open: boolean
  onClose: () => void
  onSuccess: () => void
  onError: (msg: string) => void
}

export function ExamBatchUploadModal({
  examId,
  open,
  onClose,
  onSuccess,
  onError,
}: ExamBatchUploadModalProps) {
  const uploadMutation = useUploadExamQuestionsBatch()
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file) return
    try {
      await uploadMutation.mutateAsync({ id: examId, file })
      setFile(null)
      onSuccess()
    } catch (err) {
      onError(getApiErrorMessage(err, 'Failed to upload questions.'))
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
      title="Batch Upload Questions"
      description="Upload an Excel file (.xlsx) containing exam questions. The new questions will be appended to this exam."
      onClose={handleClose}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="mb-2 block text-sm font-semibold">Excel File</label>
          <a
            href="/exam_questions_sample.xlsx"
            download
            className="text-xs text-primary hover:underline"
          >
            Download Sample Template
          </a>
        </div>
        <div>
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
            disabled={uploadMutation.isPending}
          />
        </div>
        
        <div className="rounded-xl border border-muted bg-muted/40 p-4 text-xs text-subtle">
          <p className="font-semibold text-foreground mb-1">Expected Columns (in order):</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li>Category Code (VOCAB, GRAMMAR, READING, LISTENING)</li>
            <li>Mondai Title (Group instruction)</li>
            <li>Passage (mainly for Reading)</li>
            <li>Sentence Structure (mainly for Grammar)</li>
            <li>Prompt (Question text)</li>
            <li>Choice 1</li>
            <li>Choice 2</li>
            <li>Choice 3</li>
            <li>Choice 4</li>
            <li>Correct Choice (1, 2, 3, or 4)</li>
            <li>Transcript (for Listening)</li>
            <li>Furigana</li>
            <li>Translation (MM)</li>
            <li>Translation (EN)</li>
            <li>Explanation (MM)</li>
            <li>Explanation (EN)</li>
          </ol>
          <p className="mt-2 text-[11px]">
            * Audio cannot be uploaded via Excel. For listening questions, upload the audio later via the editor.
          </p>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={uploadMutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleUpload()}
            disabled={!file || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload File'}
          </Button>
        </div>
      </div>
    </FormDialog>
  )
}
