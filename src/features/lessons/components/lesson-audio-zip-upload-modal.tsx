import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { FormDialog } from '@/components/common/form-dialog'
import {
  useUploadLessonAudioZipMutation,
  useUploadLevelLessonsAudioZipMutation,
} from '@/shared/queries/lesson.query'
import { getApiErrorMessage } from '@/app/api/http-client'
import type { LessonAudioZipResult } from '@/shared/services/lesson.service'

interface LessonAudioZipUploadModalProps {
  lessonId?: number | null
  jlptLevelCode?: string | null
  open: boolean
  onClose: () => void
  onSuccess: (result: LessonAudioZipResult) => void
  onError: (msg: string) => void
}

export function LessonAudioZipUploadModal({
  lessonId,
  jlptLevelCode,
  open,
  onClose,
  onSuccess,
  onError,
}: LessonAudioZipUploadModalProps) {
  const uploadSingleMutation = useUploadLessonAudioZipMutation()
  const uploadLevelMutation = useUploadLevelLessonsAudioZipMutation()
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<LessonAudioZipResult | null>(null)
  const [activeTab, setActiveTab] = useState<'matched' | 'unmatched' | 'missing' | 'errors'>('matched')

  const isPending = uploadSingleMutation.isPending || uploadLevelMutation.isPending

  const handleUpload = async () => {
    if (!file) return
    try {
      let res: LessonAudioZipResult
      if (lessonId) {
        res = await uploadSingleMutation.mutateAsync({ id: lessonId, file })
      } else if (jlptLevelCode) {
        res = await uploadLevelMutation.mutateAsync({ jlptLevelCode, file })
      } else {
        onError('No lesson ID or level specified for ZIP upload.')
        return
      }
      setFile(null)
      setResult(res)
      onSuccess(res)
      if (res.errors.length > 0) setActiveTab('errors')
      else if (res.matched > 0) setActiveTab('matched')
      else if (res.unmatchedFiles.length > 0) setActiveTab('unmatched')
      else setActiveTab('missing')
    } catch (err) {
      onError(getApiErrorMessage(err, 'Failed to upload lesson audio ZIP.'))
    }
  }

  const handleClose = () => {
    if (isPending) return
    setFile(null)
    setResult(null)
    onClose()
  }

  const resetForNewUpload = () => {
    setFile(null)
    setResult(null)
  }

  return (
    <FormDialog
      open={open}
      title={result ? 'Audio ZIP Upload Results' : 'Upload Lesson Audio ZIP'}
      description={
        result
          ? 'Review matched, uploaded, and unmatched audio files below.'
          : lessonId
            ? 'Match ZIP audio stems to quiz questions and vocabulary in this lesson.'
            : jlptLevelCode
              ? `Match ZIP audio stems to quiz questions and vocabulary across all ${jlptLevelCode} lessons.`
              : 'Upload audio ZIP'
      }
      onClose={handleClose}
    >
      {!result ? (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <label className="mb-2 block text-sm font-semibold">ZIP file</label>
              <a
                href="/lessons_audio_sample.zip"
                download
                className="text-xs text-primary hover:underline"
              >
                Download Sample Audio ZIP
              </a>
            </div>
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
              disabled={isPending}
            />
          </div>

          <div className="rounded-xl border border-muted bg-muted/40 p-4 text-xs text-subtle">
            <p className="font-semibold text-foreground mb-1">Audio Filename Matching</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                Excel <code>Audio Filename</code> column (e.g. <code>n5_l01_v01.mp3</code>) ↔ ZIP entry{' '}
                <code>n5_l01_v01.mp3</code>
              </li>
              <li>
                Matches both <strong>Vocab items</strong> and <strong>Quiz questions</strong>
              </li>
              <li>Supported audio formats: mp3, wav, ogg, m4a, aac, webm</li>
            </ul>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleUpload()}
              disabled={!file || isPending}
            >
              {isPending ? 'Uploading & Matching…' : 'Upload ZIP'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-2.5">
              <div className="text-base font-bold text-green-600 dark:text-green-400">
                {result.matched}
              </div>
              <div className="text-[11px] text-muted-foreground">Matched & Bound</div>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-2.5">
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                {result.uploaded}
              </div>
              <div className="text-[11px] text-muted-foreground">Uploaded to Cloud</div>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
              <div className="text-base font-bold text-amber-600 dark:text-amber-400">
                {result.unmatchedFiles.length}
              </div>
              <div className="text-[11px] text-muted-foreground">Unmatched Files</div>
            </div>
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-2.5">
              <div className="text-base font-bold text-red-600 dark:text-red-400">
                {result.errors.length}
              </div>
              <div className="text-[11px] text-muted-foreground">Errors / Conflicts</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1.5 border-b border-border pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('matched')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'matched'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Matched ({result.matched})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unmatched')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'unmatched'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Unmatched Files ({result.unmatchedFiles.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('missing')}
              className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                activeTab === 'missing'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Missing Audio ({result.unmatchedQuestions.length})
            </button>
            {result.errors.length > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('errors')}
                className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                  activeTab === 'errors'
                    ? 'bg-destructive text-destructive-foreground'
                    : 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                }`}
              >
                Errors ({result.errors.length})
              </button>
            ) : null}
          </div>

          {/* Scrollable Detail Lists */}
          <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/20 p-3 text-xs space-y-1.5">
            {activeTab === 'matched' && (
              <>
                {(result.matchedDetails?.length ?? 0) === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No matched files in this upload.</p>
                ) : (
                  result.matchedDetails?.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-foreground font-mono text-[11.5px]">
                      <span className="text-green-500 font-bold">✓</span>
                      <span>{item}</span>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'unmatched' && (
              <>
                {result.unmatchedFiles.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">All files in the ZIP were matched!</p>
                ) : (
                  result.unmatchedFiles.map((filename, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-mono text-[11.5px]">
                      <span>⚠️</span>
                      <span>{filename} (No question or vocab shares this filename stem)</span>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'missing' && (
              <>
                {result.unmatchedQuestions.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">All questions & vocabs with audio filenames received audio!</p>
                ) : (
                  result.unmatchedQuestions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-amber-600 dark:text-amber-400 font-mono text-[11.5px]">
                      <span>⚠️</span>
                      <span>Expected: {item}</span>
                    </div>
                  ))
                )}
              </>
            )}

            {activeTab === 'errors' && (
              <>
                {result.errors.length === 0 ? (
                  <p className="py-4 text-center text-muted-foreground">No errors or conflicts encountered.</p>
                ) : (
                  result.errors.map((err, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-destructive font-mono text-[11.5px]">
                      <span>❌</span>
                      <span>{err}</span>
                    </div>
                  ))
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <Button type="button" variant="ghost" onClick={resetForNewUpload}>
              Upload Another ZIP
            </Button>
            <Button type="button" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      )}
    </FormDialog>
  )
}
