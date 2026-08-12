import type { ExamSkillBreakdownDto } from '@/shared/services/exam-result.service'
import { cn } from '@/util/cn'

interface SkillMiniBarsProps {
  skills: ExamSkillBreakdownDto
}

const SKILLS = [
  { correctKey: 'vocabCorrect', totalKey: 'vocabTotal', label: 'Vocab' },
  { correctKey: 'grammarCorrect', totalKey: 'grammarTotal', label: 'Grammar' },
  { correctKey: 'readingCorrect', totalKey: 'readingTotal', label: 'Reading' },
  { correctKey: 'listeningCorrect', totalKey: 'listeningTotal', label: 'Listening' },
] as const

function percent(correct: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((correct / total) * 100)
}

export function SkillMiniBars({ skills }: SkillMiniBarsProps) {
  return (
    <ul className="m-0 grid list-none grid-cols-4 gap-[10px] p-0 max-sm:grid-cols-2">
      {SKILLS.map((skill) => {
        const correct = skills[skill.correctKey]
        const total = skills[skill.totalKey]
        const pct = percent(correct, total)
        const empty = total <= 0
        return (
          <li key={skill.label}>
            <div className="mb-[4px] flex items-baseline justify-between gap-[6px] text-[11px]">
              <span className="font-semibold text-muted-foreground">{skill.label}</span>
              <span className="tabular-nums text-subtle">
                {empty ? '—' : `${pct}%`}
              </span>
            </div>
            <div
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={empty ? undefined : pct}
              aria-label={
                empty
                  ? `${skill.label} not in this exam`
                  : `${skill.label} ${correct} of ${total}, ${pct} percent`
              }
              className="h-[6px] overflow-hidden rounded-full bg-muted"
            >
              <div
                className={cn(
                  'h-full rounded-full',
                  pct >= 60 ? 'bg-primary' : pct >= 40 ? 'bg-warning' : 'bg-destructive',
                )}
                style={{ width: empty ? '0%' : `${pct}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
