import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/util/cn'

export interface ActionMenuItem {
  id: string
  label: string
  onSelect: () => void
  tone?: 'default' | 'danger'
  disabled?: boolean
}

interface ActionMenuProps {
  label: string
  items: ActionMenuItem[]
  className?: string
}

interface MenuPosition {
  top: number
  left: number
}

export function ActionMenu({ label, items, className }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || !menuRef.current) return

    const gap = 6
    const buttonRect = buttonRef.current.getBoundingClientRect()
    const menuRect = menuRef.current.getBoundingClientRect()
    const viewportPadding = 8

    const spaceBelow = window.innerHeight - buttonRect.bottom - gap
    const openUpward = spaceBelow < menuRect.height && buttonRect.top > menuRect.height + gap

    const top = openUpward
      ? buttonRect.top - menuRect.height - gap
      : buttonRect.bottom + gap

    let left = buttonRect.right - menuRect.width
    left = Math.min(left, window.innerWidth - menuRect.width - viewportPadding)
    left = Math.max(viewportPadding, left)

    setPosition({ top, left })
  }, [open, items.length])

  useEffect(() => {
    if (!open) return

    const close = () => setOpen(false)

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      close()
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative inline-flex', className)}>
      <IconButton
        ref={buttonRef}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title={label}
        onClick={() => {
          setPosition(null)
          setOpen((value) => !value)
        }}
      >
        ⋯
      </IconButton>

      {open
        ? createPortal(
            <div
              ref={menuRef}
              id={menuId}
              role="menu"
              aria-label={label}
              className={cn(
                'fixed z-[80] min-w-[148px] rounded-[12px] border-[1.5px] border-border bg-card p-[6px]',
                'shadow-[0_10px_30px_rgba(15,23,42,0.12)]',
                position == null && 'invisible',
              )}
              style={
                position
                  ? { top: position.top, left: position.left }
                  : { top: 0, left: 0 }
              }
            >
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  className={cn(
                    'flex w-full items-center rounded-[9px] px-[12px] py-[8px] text-left text-[13px] font-semibold transition',
                    'hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[#0EA5E9]',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    item.tone === 'danger' ? 'text-destructive' : 'text-foreground',
                  )}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect()
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
