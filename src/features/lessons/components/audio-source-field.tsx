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
  /** When set, shows an editable text box in TTS mode for the spoken content. */
  onSpeakTextChange?: (text: string) => void
  speakTextLabel?: string
  speakTextPlaceholder?: string
  audioUrl: string | null
  onChange: (audioUrl: string | null) => void
  className?: string
  /** Hide the "Audio" field label (e.g. inside a table column). */
  hideLabel?: boolean
}

export function AudioSourceField({
  speakText,
  onSpeakTextChange,
  speakTextLabel = 'Listening text (TTS)',
  speakTextPlaceholder = 'Text the browser / mobile should speak…',
  audioUrl,
  onChange,
  className,
  hideLabel = false,
}: AudioSourceFieldProps) {
  const groupId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const retainedUploadUrlRef = useRef<string | null>(audioUrl)
  const [mode, setMode] = useState<AudioMode>(audioUrl ? 'upload' : 'tts')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parent may set audioUrl after ZIP / hydrate — keep upload mode and remember the URL.
  useEffect(() => {
    if (audioUrl) {
      retainedUploadUrlRef.current = audioUrl
      setMode('upload')
    }
  }, [audioUrl])

  const selectTts = () => {
    setError(null)
    if (audioUrl) {
      retainedUploadUrlRef.current = audioUrl
    }
    setMode('tts')
    // Clear saved URL for TTS mode, but keep retained so switching back restores the player.
    onChange(null)
  }

  const selectUpload = () => {
    setError(null)
    setMode('upload')
    if (!audioUrl && retainedUploadUrlRef.current) {
      onChange(retainedUploadUrlRef.current)
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
      return
    }
    setUploading(true)
    setError(null)
    try {
      const uploaded = await uploadAudio(file)
      retainedUploadUrlRef.current = uploaded.url
      setMode('upload')
      onChange(uploaded.url)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Audio upload failed.'))
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const canPreview =
    (mode === 'upload' && Boolean(audioUrl)) || (mode === 'tts' && Boolean(speakText.trim()))

  const resolvedUploadUrl = mode === 'upload' ? resolveMediaUrl(audioUrl) : null

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

        {mode === 'tts' && onSpeakTextChange ? (
          <div>
            <label className="mb-1 block text-[12px] font-semibold text-muted-foreground">
              {speakTextLabel}
            </label>
            <textarea
              value={speakText}
              rows={3}
              placeholder={speakTextPlaceholder}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-[13px]"
              onChange={(e) => onSpeakTextChange(e.target.value)}
            />
          </div>
        ) : null}

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
            disabled={!canPreview}
            onClick={preview}
            className="!px-[12px] !py-[6px] text-[12px]"
          >
            ▶ Preview
          </Button>
          {mode === 'upload' && audioUrl ? (
            <span className="truncate text-[11px] text-subtle" title={audioUrl}>
              {audioUrl.split('/').pop()}
            </span>
          ) : mode === 'tts' ? (
            <span className="text-[11px] text-subtle">Mobile will use SpeechSynthesisUtterance</span>
          ) : null}
        </div>
        {mode === 'upload' && resolvedUploadUrl ? (
          <div className="rounded-xl border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2">
            <audio
              key={resolvedUploadUrl}
              controls
              preload="metadata"
              className="w-full"
              src={resolvedUploadUrl}
            >
              Your browser does not support audio playback.
            </audio>
          </div>
        ) : null}
        {error ? <p className="text-[11px] text-destructive">{error}</p> : null}
      </div>
    </Field>
  )
}
