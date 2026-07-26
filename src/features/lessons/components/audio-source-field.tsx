import { useEffect, useId, useRef, useState } from 'react'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { speakJapanese } from '@/shared/lib/speak-japanese'
import { resolveMediaUrl, uploadAudio } from '@/shared/services/media.service'

export type AudioMode = 'tts' | 'upload'

interface AudioSourceFieldProps {
  /** Japanese text used when mode is TTS (preview + mobile fallback). */
  speakText: string
  audioUrl: string | null
  onChange: (audioUrl: string | null) => void
  className?: string
  /** Hide the "Audio" field label (e.g. inside a table column). */
  hideLabel?: boolean
}

export function AudioSourceField({
  speakText,
  audioUrl,
  onChange,
  className,
  hideLabel = false,
}: AudioSourceFieldProps) {
  const groupId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [mode, setMode] = useState<AudioMode>(audioUrl ? 'upload' : 'tts')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMode(audioUrl ? 'upload' : 'tts')
  }, [audioUrl])

  const selectTts = () => {
    setError(null)
    setMode('tts')
    onChange(null)
  }

  const selectUpload = () => {
    setError(null)
    setMode('upload')
    if (!audioUrl) {
      inputRef.current?.click()
    }
  }

  const preview = () => {
    if (mode === 'upload' && audioUrl) {
      const url = resolveMediaUrl(audioUrl)
      if (url) {
        const audio = new Audio(url)
        void audio.play().catch(() => setError('Could not play uploaded audio.'))
        return
      }
    }
    speakJapanese(speakText)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) {
      if (!audioUrl) setMode('tts')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const uploaded = await uploadAudio(file)
      setMode('upload')
      onChange(uploaded.url)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Audio upload failed.'))
      if (!audioUrl) setMode('tts')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <Field label={hideLabel ? undefined : 'Audio'} className={className}>
      <div className="flex flex-col gap-[8px]">
        <div className="flex flex-wrap items-center gap-[14px] text-[12.5px]">
          <label className="inline-flex cursor-pointer items-center gap-[6px]">
            <input type="radio" name={groupId} checked={mode === 'tts'} onChange={selectTts} />
            Browser TTS (default)
          </label>
          <label className="inline-flex cursor-pointer items-center gap-[6px]">
            <input type="radio" name={groupId} checked={mode === 'upload'} onChange={selectUpload} />
            Upload audio file
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-[8px]">
          <input
            ref={inputRef}
            type="file"
            accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/mp4,audio/aac,audio/webm,.mp3,.wav,.ogg,.m4a,.aac,.webm"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          {mode === 'upload' ? (
            <Button
              type="button"
              variant="ghost"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="!px-[12px] !py-[6px] text-[12px]"
            >
              {uploading ? 'Uploading…' : audioUrl ? 'Replace file' : 'Choose file'}
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            disabled={!speakText.trim() && !(mode === 'upload' && audioUrl)}
            onClick={preview}
            className="!px-[12px] !py-[6px] text-[12px]"
          >
            ▶ Preview
          </Button>
          {audioUrl ? (
            <span className="truncate text-[11px] text-subtle" title={audioUrl}>
              {audioUrl.split('/').pop()}
            </span>
          ) : (
            <span className="text-[11px] text-subtle">Mobile will use SpeechSynthesisUtterance</span>
          )}
        </div>
        {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
      </div>
    </Field>
  )
}
