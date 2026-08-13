import { env } from '@/app/config/env'
import { Button } from '@/components/ui/button'
import { Panel } from '@/components/ui/panel'
import { SkillMiniBars } from '@/features/users/components/skill-mini-bars'
import {
  examResultVerifyUrl,
  type ExamMondaiBreakdownDto,
  type ExamResultListDto,
} from '@/shared/services/exam-result.service'
import { cn } from '@/util/cn'

interface UserCertificateCardProps {
  result: ExamResultListDto
  onCopied: (message: string) => void
}

function formatWhen(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatDuration(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

function mondaiRate(item: ExamMondaiBreakdownDto): number {
  if (item.total <= 0) return 0
  return Math.round((item.correct / item.total) * 100)
}

export function UserCertificateCard({ result, onCopied }: UserCertificateCardProps) {
  const verifyUrl = examResultVerifyUrl(result.resultToken, env.apiBaseUrl)
  const headingId = `cert-${result.resultToken}`
  const mondai = result.mondaiBreakdown ?? []

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(verifyUrl)
      onCopied('Verification link copied')
    } catch {
      onCopied('Could not copy link')
    }
  }

  return (
    <Panel
      className="mb-0 p-[18px]"
      role="article"
      aria-labelledby={headingId}
    >
      <div className="flex flex-wrap items-start justify-between gap-[12px]">
        <div className="min-w-0">
          <div className="mb-[6px] flex flex-wrap items-center gap-[8px]">
            <span className="inline-flex rounded-[8px] bg-info-soft px-[8px] py-[2px] font-display text-[12px] font-bold text-info-foreground">
              {result.jlptLevelCode || '—'}
            </span>
            <span
              className={cn(
                'inline-flex rounded-full px-[8px] py-[2px] text-[11px] font-bold',
                result.passed
                  ? 'bg-primary-soft text-primary-dark'
                  : 'bg-destructive-soft text-destructive',
              )}
            >
              {result.passed ? 'Passed' : 'Not passed'}
            </span>
          </div>
          <h3 id={headingId} className="m-0 font-display text-[16px] text-foreground">
            {result.examTitle}
          </h3>
          {result.examTitleJp ? (
            <p className="mt-[2px] text-[12.5px] text-muted-foreground">{result.examTitleJp}</p>
          ) : null}
          <p className="mt-[6px] text-[12px] text-subtle">
            {formatWhen(result.completedAt)} · {formatDuration(result.timeUsedSeconds)} ·{' '}
            {result.correctCount}/{result.questionCount} correct
          </p>
        </div>

        <div className="text-right">
          <p className="m-0 font-display text-[28px] font-bold leading-none tabular-nums text-foreground">
            {result.score}
            <span className="text-[14px] font-semibold text-subtle"> / {result.totalScore}</span>
          </p>
          <p className="mt-[4px] text-[11px] text-subtle">Pass mark {result.passScore}</p>
        </div>
      </div>

      <div className="mt-[16px]">
        <SkillMiniBars
          skills={result.skills ?? {
            vocabCorrect: 0,
            vocabTotal: 0,
            grammarCorrect: 0,
            grammarTotal: 0,
            readingCorrect: 0,
            readingTotal: 0,
            listeningCorrect: 0,
            listeningTotal: 0,
          }}
        />
      </div>

      {mondai.length > 0 ? (
        <details className="mt-[14px] rounded-[12px] border border-muted bg-surface px-[12px] py-[8px]">
          <summary className="cursor-pointer text-[12.5px] font-semibold text-foreground">
            Mondai breakdown ({mondai.length})
          </summary>
          <ul className="mt-[8px] m-0 list-none space-y-[6px] p-0">
            {mondai.map((item, index) => {
              const pct = mondaiRate(item)
              return (
                <li
                  key={`${item.mondaiTitle}-${index}`}
                  className="flex items-center justify-between gap-[10px] text-[12.5px]"
                >
                  <span className="min-w-0 truncate text-muted-foreground">
                    {item.mondaiTitle}
                    <span className="text-subtle"> · {item.categoryCode}</span>
                  </span>
                  <span
                    className={cn(
                      'shrink-0 tabular-nums font-semibold',
                      pct < 60 ? 'text-destructive' : 'text-primary-dark',
                    )}
                  >
                    {item.correct}/{item.total} ({pct}%)
                  </span>
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}

      <div className="mt-[14px] flex flex-wrap gap-[8px]">
        <Button type="button" variant="ghost" onClick={() => void copyLink()}>
          Copy verify link
        </Button>
        <a
          href={verifyUrl}
          target="_blank"
          rel="noreferrer"
          className={cn(
            'inline-flex items-center justify-center rounded-xl border-[1.5px] border-border bg-card px-[18px] py-[10px] text-[13.5px] font-semibold text-foreground no-underline',
            'hover:bg-muted focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-info',
          )}
        >
          Open certificate
        </a>
      </div>
    </Panel>
  )
}
