import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

import type { JlptLevelDto } from '@/shared/services/jlpt-level.service'
import { cn } from '@/util/cn'

interface LevelSwitcherProps {
  levels: JlptLevelDto[]
  value: number | null
  onChange: (levelId: number) => void
}

export function LevelSwitcher({ levels, value, onChange }: LevelSwitcherProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const current = levels.find((l) => l.id === value) ?? levels[0] ?? null

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [open])

  if (!current) {
    return (
      <div className="rounded-xl border-[1.5px] border-border bg-muted px-[14px] py-[8px] text-[13px] text-muted-foreground">
        No JLPT levels yet
      </div>
    )
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="flex cursor-pointer items-center gap-[8px] rounded-xl border-[1.5px] border-primary bg-primary-soft px-[14px] py-[8px]"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="font-display text-[15px] font-bold text-primary-dark">{current.code}</span>
        <span className="text-[11.5px] text-primary-dark">{current.name}</span>
        <span className="text-[10px] text-primary-dark" aria-hidden>
          ▾
        </span>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Switch JLPT level"
          className="absolute top-[calc(100%+6px)] left-0 z-30 w-[280px] rounded-2xl border border-border bg-card p-[8px] shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
        >
          {levels.map((level) => {
            const selected = level.id === current.id
            return (
              <button
                key={level.id}
                type="button"
                role="option"
                aria-selected={selected}
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between gap-[10px] rounded-[10px] border-none bg-transparent px-[12px] py-[10px] text-left font-body text-[13.5px]',
                  selected ? 'bg-primary-soft' : 'hover:bg-muted',
                )}
                onClick={() => {
                  onChange(level.id)
                  setOpen(false)
                }}
              >
                <span className="flex items-center gap-[10px]">
                  <span
                    className={cn(
                      'flex h-[26px] w-[34px] items-center justify-center rounded-[8px] font-display text-[12px] font-bold',
                      selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {level.code}
                  </span>
                  <span>{level.name}</span>
                </span>
                {!level.unlocked ? (
                  <span className="rounded-[20px] bg-warning-soft px-[7px] py-[2px] text-[10px] font-bold text-warning-foreground">
                    Locked
                  </span>
                ) : (
                  <span className="text-[11px] text-subtle">{level.lessonCount} lessons</span>
                )}
              </button>
            )
          })}
          <div className="mt-[6px] border-t border-muted pt-[6px]">
            <Link
              to="/jlpt-levels"
              className="block rounded-[10px] px-[12px] py-[9px] text-[12.5px] text-muted-foreground no-underline hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              🎓 Manage JLPT levels
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
