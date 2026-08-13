import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/form-dialog'
import { useUploadExamQuestionsAudioZip } from '@/features/exams/exam.query'
import { getApiErrorMessage } from '@/app/api/http-client'
import type { ExamAudioZipResult } from '@/shared/services/exam.service'

interface ExamAudioZipUploadModalProps {
  examId: number
  open: boolean
  onClose: () => void
  onSuccess: (result: ExamAudioZipResult) => void
  onError: (msg: string) => void
}

export function ExamAudioZipUploadModal({
  examId,
  open,
  onClose,
  onSuccess,
  onError,
}: ExamAudioZipUploadModalProps) {
  const uploadMutation = useUploadExamQuestionsAudioZip()
  const [file, setFile] = useState<File | null>(null)

  const handleUpload = async () => {
    if (!file) return
    try {
      const result = await uploadMutation.mutateAsync({ id: examId, file })
      setFile(null)
      onSuccess(result)
    } catch (err) {
      onError(getApiErrorMessage(err, 'Failed to upload audio ZIP.'))
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
      title="Upload audio ZIP"
      description="Match ZIP audio stems to exam questions via Audio Filename (Excel) or Question ID fallback."
      onClose={handleClose}
    >
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">ZIP file</label>
          <input
            type="file"
            accept=".zip,application/zip"
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
          <p className="font-semibold text-foreground mb-1">Matching</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              Excel <code>audio1</code> or <code>audio1.mp3</code> ↔ ZIP entry{' '}
              <code>audio1.mp3</code> (case-insensitive stem)
            </li>
            <li>
              If Audio Filename is blank, ZIP stem can match Question ID (e.g.{' '}
              <code>n4_q_0107.mp3</code>)
            </li>
            <li>Supported: mp3, wav, ogg, m4a, aac, webm</li>
          </ul>
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
            {uploadMutation.isPending ? 'Uploading…' : 'Upload ZIP'}
          </Button>
        </div>
      </div>
    </FormDialog>
  )
}
