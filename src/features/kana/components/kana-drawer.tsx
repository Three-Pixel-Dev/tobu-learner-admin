import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { speakKana } from '@/features/kana/kana-tts'
import type { KanaDto, KanaType } from '@/shared/services/kana.service'
import { cn } from '@/util/cn'

export interface KanaFormValues {
  character: string
  romaji: string
  characterMm: string
}

interface KanaDrawerProps {
  open: boolean
  mode: 'add' | 'edit'
  type: KanaType
  initial?: KanaDto | null
  busy?: boolean
  onClose: () => void
  onSave: (values: KanaFormValues) => void
  onDisable?: () => void
  onRestore?: () => void
}

export function KanaDrawer({
  open,
  mode,
  type,
  initial,
  busy = false,
  onClose,
  onSave,
  onDisable,
  onRestore,
}: KanaDrawerProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const [character, setCharacter] = useState('')
  const [romaji, setRomaji] = useState('')
  const [characterMm, setCharacterMm] = useState('')
  const [errors, setErrors] = useState<{ character?: boolean; romaji?: boolean; characterMm?: boolean }>(
    {},
  )
  const [formAlert, setFormAlert] = useState<string | null>(null)

  const deleted = Boolean(initial?.deleted)
  const typeLabel = type === 'HIRAGANA' ? 'Hiragana' : 'Katakana'
  const typeGlyph = type === 'HIRAGANA' ? 'あ' : 'ア'

  useEffect(() => {
    if (!open) return
    setCharacter(initial?.character ?? '')
    setRomaji(initial?.romaji ?? '')
    setCharacterMm(initial?.characterMm ?? '')
    setErrors({})
    setFormAlert(null)
    const timer = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
    }, 50)
    return () => window.clearTimeout(timer)
  }, [open, initial])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, busy, onClose])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (deleted) return
    const nextErrors = {
      character: !character.trim(),
      romaji: !romaji.trim(),
      characterMm: !characterMm.trim(),
    }
    setErrors(nextErrors)
    if (nextErrors.character || nextErrors.romaji || nextErrors.characterMm) {
      setFormAlert('Please fix the highlighted fields.')
      return
    }
    if (character.trim().length > 4) {
      setErrors((e) => ({ ...e, character: true }))
      setFormAlert('Character must be 1–4 characters.')
      return
    }
    onSave({
      character: character.trim(),
      romaji: romaji.trim(),
      characterMm: characterMm.trim(),
    })
  }

  const listenPreview = () => {
    const ch = character.trim()
    if (!ch) {
      setErrors((e) => ({ ...e, character: true }))
      panelRef.current?.querySelector<HTMLInputElement>('input')?.focus()
      return
    }
    speakKana(ch)
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-60 bg-[rgba(15,23,42,0.45)] transition-opacity',
          open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden={!open}
        onClick={() => {
          if (!busy) onClose()
        }}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-hidden={!open}
        className={cn(
          'fixed top-0 right-0 bottom-0 z-61 flex w-[min(420px,92vw)] flex-col bg-card shadow-[-12px_0_40px_rgba(0,0,0,0.15)] transition-transform duration-[220ms] ease',
          open ? 'translate-x-0' : 'translate-x-full',
          'motion-reduce:transition-none',
        )}
      >
        <div className="flex items-center justify-between border-b border-muted px-[22px] py-[20px]">
          <h2 id={titleId} className="m-0 font-display text-[17px] font-bold">
            {mode === 'edit' ? 'Edit character' : 'Add character'}
          </h2>
          <button
            type="button"
            className="flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[9px] border-none bg-muted text-[15px] text-muted-foreground"
            aria-label="Close"
            disabled={busy}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
          <div className="flex-1 overflow-y-auto px-[22px] py-[20px]">
            <div className="mb-[20px] flex items-center gap-[8px] rounded-xl border-[1.5px] border-primary bg-primary-soft px-[14px] py-[10px] text-[13px] font-semibold text-primary-dark">
              <span aria-hidden>{typeGlyph}</span>
              <span>
                {mode === 'edit'
                  ? `${typeLabel} character`
                  : `Adding to ${typeLabel}`}
              </span>
              <span className="ml-auto text-[11px] font-medium opacity-80">Locked to tab</span>
            </div>

            {formAlert ? (
              <p className="mb-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
                {formAlert}
              </p>
            ) : null}

            <div className={cn('mb-[16px]', errors.character && '[&_input]:border-destructive')}>
              <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="kana-char">
                Character <span className="text-destructive">*</span>
              </label>
              <Input
                id="kana-char"
                value={character}
                maxLength={4}
                required
                disabled={deleted || busy}
                placeholder={typeGlyph}
                className="max-w-[110px] text-center font-display text-[22px]"
                onChange={(e) => setCharacter(e.target.value)}
              />
              <p className="mt-[5px] text-[11.5px] text-muted-foreground">
                Up to 4 characters so digraphs like きゃ still fit.
              </p>
            </div>

            <div className={cn('mb-[16px]', errors.romaji && '[&_input]:border-destructive')}>
              <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="kana-romaji">
                Romaji <span className="text-destructive">*</span>
              </label>
              <Input
                id="kana-romaji"
                value={romaji}
                required
                disabled={deleted || busy}
                placeholder="a"
                onChange={(e) => setRomaji(e.target.value)}
              />
            </div>

            <div className={cn('mb-[16px]', errors.characterMm && '[&_input]:border-destructive')}>
              <label className="mb-[6px] block text-[12.5px] font-semibold" htmlFor="kana-mm">
                Myanmar reading <span className="text-destructive">*</span>
              </label>
              <Input
                id="kana-mm"
                value={characterMm}
                required
                disabled={deleted || busy}
                placeholder="အ"
                onChange={(e) => setCharacterMm(e.target.value)}
              />
            </div>

            <div className="mb-[16px] rounded-xl bg-sky-50 p-3 border border-sky-200">
              <label className="mb-[4px] block text-[12.5px] font-bold text-sky-900">
                Pronunciation preview
              </label>
              <p className="mb-[8px] text-[11px] text-sky-700">
                Uses the default system Japanese voice.
              </p>
              <Button type="button" variant="ghost" onClick={listenPreview} className="w-full">
                🔊 Listen
              </Button>
            </div>
          </div>

          <div className="flex gap-[10px] border-t border-muted px-[22px] py-[16px]">
            <Button type="button" variant="ghost" className="flex-1" disabled={busy} onClick={onClose}>
              Cancel
            </Button>
            {mode === 'edit' && deleted && onRestore ? (
              <Button type="button" className="flex-1" disabled={busy} onClick={onRestore}>
                {busy ? 'Working…' : 'Restore'}
              </Button>
            ) : null}
            {mode === 'edit' && !deleted && onDisable ? (
              <Button
                type="button"
                variant="dangerOutline"
                className="flex-1"
                disabled={busy}
                onClick={onDisable}
              >
                Disable
              </Button>
            ) : null}
            {!deleted ? (
              <Button type="submit" className="flex-1" disabled={busy}>
                {busy ? 'Saving…' : mode === 'edit' ? 'Save changes' : 'Save character'}
              </Button>
            ) : null}
          </div>
        </form>
      </aside>
    </>
  )
}
