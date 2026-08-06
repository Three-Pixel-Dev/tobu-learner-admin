import { useEffect, useId, useRef, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/util/cn'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** Visual tone for the confirm action. */
  tone?: 'danger' | 'primary'
  icon?: ReactNode
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  icon = '⚠',
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      return
    }
    if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className={cn(
        'm-auto w-[min(420px,92vw)] rounded-[20px] border-none bg-card p-0 text-foreground',
        'shadow-[0_20px_50px_rgba(0,0,0,0.25)]',
        'backdrop:bg-[rgba(15,23,42,0.5)]',
      )}
      onCancel={(event) => {
        event.preventDefault()
        if (!busy) onCancel()
      }}
      onClose={() => {
        if (open && !busy) onCancel()
      }}
    >
      <div className="p-[26px]">
        <div
          className={cn(
            'mb-[14px] flex h-[44px] w-[44px] items-center justify-center rounded-xl text-[20px]',
            tone === 'danger'
              ? 'bg-destructive-soft text-destructive'
              : 'bg-warning-soft text-warning-foreground',
          )}
          aria-hidden
        >
          {icon}
        </div>

        <h2 id={titleId} className="m-0 mb-[8px] font-display text-[17px] font-bold">
          {title}
        </h2>
        <div id={descriptionId} className="mb-[20px] text-[13.5px] leading-relaxed text-muted-foreground">
          {description}
        </div>

        <div className="flex justify-end gap-[10px]">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'danger' ? 'dangerOutline' : 'primary'}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  )
}
