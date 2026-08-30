import { useState } from 'react'
import { audioService, type AudioSourceType } from '@/shared/services/lesson.service'

interface AudioSourceSelectorProps {
  value?: AudioSourceType | null
  onChange: (type: AudioSourceType) => void
  transcript?: string | null
  audioUrl?: string | null
  aiAudioUrl?: string | null
  onAiAudioGenerated?: (result: { url: string; filename: string }) => void
  targetFilename?: string
}

export function AudioSourceSelector({
  value = 'AUDIO_FILE',
  onChange,
  transcript,
  audioUrl,
  aiAudioUrl,
  onAiAudioGenerated,
  targetFilename,
}: AudioSourceSelectorProps) {
  const currentType = value || 'AUDIO_FILE'
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localAiUrl, setLocalAiUrl] = useState<string | null>(null)

  const effectiveAiAudioUrl = aiAudioUrl || localAiUrl

  const handleGenerateAi = async () => {
    if (!transcript || !transcript.trim()) {
      setError('Please provide a transcript before generating AI audio.')
      return
    }
    setGenerating(true)
    setError(null)
    try {
      const res = await audioService.generateAiDialogueAudio(transcript.trim(), targetFilename)
      const generatedUrl = res.url
      const generatedFilename = res.originalFilename || res.filename || 'ai_audio.mp3'

      setLocalAiUrl(generatedUrl)

      if (onAiAudioGenerated) {
        onAiAudioGenerated({ url: generatedUrl, filename: generatedFilename })
      } else {
        onChange('AI_GENERATED')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to generate AI audio')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          Audio Delivery Source to Learner
        </label>
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
          Mode: <strong className="font-bold">{currentType}</strong>
        </span>
      </div>

      {/* Mode Segment Switcher */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onChange('AUDIO_FILE')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            currentType === 'AUDIO_FILE'
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>📁</span>
          <span>Uploaded MP3</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('AI_GENERATED')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            currentType === 'AI_GENERATED'
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>✨</span>
          <span>AI Generated</span>
        </button>

        <button
          type="button"
          onClick={() => onChange('TTS')}
          className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            currentType === 'TTS'
              ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <span>🗣️</span>
          <span>Device TTS</span>
        </button>
      </div>

      {/* Mode Details & AI Trigger */}
      <div className="pt-2 border-t border-sky-200/60 text-xs">
        {currentType === 'AUDIO_FILE' && (
          <div className="flex items-center justify-between text-slate-600">
            <span>Learners will hear your uploaded MP3 file.</span>
            {audioUrl ? (
              <audio controls src={audioUrl} className="h-8 max-w-[200px]" />
            ) : (
              <span className="text-amber-600 font-medium">No MP3 uploaded yet</span>
            )}
          </div>
        )}

        {currentType === 'AI_GENERATED' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-slate-600">
              <span>ElevenLabs Multi-Voice AI Dialogue MP3:</span>
              {effectiveAiAudioUrl ? (
                <audio controls src={effectiveAiAudioUrl} className="h-8 max-w-[200px]" />
              ) : (
                <span className="text-amber-600 font-medium">No AI audio generated yet</span>
              )}
            </div>
            <button
              type="button"
              disabled={generating || !transcript || !transcript.trim()}
              onClick={handleGenerateAi}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
            >
              {generating ? (
                <>
                  <span className="animate-spin text-sm">⏳</span>
                  <span>Generating AI Audio via ElevenLabs...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>Generate Audio with AI</span>
                </>
              )}
            </button>
          </div>
        )}

        {currentType === 'TTS' && (
          <div className="text-slate-600">
            <span>Learners will hear their device text-to-speech engine reading the prompt/transcript.</span>
          </div>
        )}

        {/* Generate Button visible if user is not in AI_GENERATED mode yet */}
        {currentType !== 'AI_GENERATED' && transcript && transcript.trim() && (
          <div className="mt-2 pt-2 border-t border-sky-100 flex items-center justify-between">
            <span className="text-slate-500">Dialogue transcript detected!</span>
            <button
              type="button"
              disabled={generating}
              onClick={handleGenerateAi}
              className="inline-flex items-center gap-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-semibold py-1 px-3 rounded-md transition text-xs cursor-pointer disabled:opacity-50"
            >
              {generating ? '⏳ Generating...' : '✨ Generate AI Audio'}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-2 text-red-600 bg-red-50 border border-red-200 rounded-md p-2 text-xs font-medium">
            ⚠️ {error}
          </div>
        )}
      </div>
    </div>
  )
}
