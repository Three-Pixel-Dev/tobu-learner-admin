import { cn } from '@/util/cn'

export interface FilterChipOption {
  value: string
  label: string
  count?: number
}

interface FilterChipGroupProps {
  legend: string
  name: string
  value: string
  options: FilterChipOption[]
  onChange: (value: string) => void
}

export function FilterChipGroup({ legend, name, value, options, onChange }: FilterChipGroupProps) {
  return (
    <fieldset className="m-0 min-w-0 border-none p-0">
      <legend className="mb-[8px] text-[11px] font-bold uppercase tracking-wide text-subtle">
        {legend}
      </legend>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((option) => {
          const selected = option.value === value
          const id = `${name}-${option.value || 'all'}`
          return (
            <label
              key={id}
              htmlFor={id}
              className={cn(
                'inline-flex cursor-pointer items-center gap-[6px] rounded-full border-[1.5px] px-[12px] py-[6px] text-[12.5px] font-semibold transition',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-info',
                selected
                  ? 'border-primary bg-primary-soft text-primary-dark'
                  : 'border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground',
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={selected}
                className="sr-only"
                onChange={() => onChange(option.value)}
              />
              <span>{option.label}</span>
              {option.count != null ? (
                <span
                  className={cn(
                    'rounded-full px-[6px] py-[1px] text-[10.5px] font-bold tabular-nums',
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {option.count}
                </span>
              ) : null}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
