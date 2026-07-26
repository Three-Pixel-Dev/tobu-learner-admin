import { useEffect, useId, useRef, type ReactNode } from 'react'

import { cn } from '@/util/cn'

interface FormDialogProps {
  open: boolean
  title: string
  description?: string
  children: ReactNode
  onClose: () => void
  className?: string
}

export function FormDialog({ open, title, description, children, onClose, className }: FormDialogProps) {
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
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'm-auto w-[min(480px,92vw)] rounded-[20px] border-none bg-card p-0 text-foreground',
        'shadow-[0_20px_50px_rgba(0,0,0,0.25)]',
        'backdrop:bg-[rgba(15,23,42,0.5)]',
        className,
      )}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClose={() => {
        if (open) onClose()
      }}
    >
      <div className="p-[26px]">
        <h2 id={titleId} className="m-0 mb-[8px] font-display text-[17px] font-bold">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="mb-[18px] mt-0 text-[13px] text-muted-foreground">
            {description}
          </p>
        ) : (
          <div className="mb-[18px]" />
        )}
        {children}
      </div>
    </dialog>
  )
}
