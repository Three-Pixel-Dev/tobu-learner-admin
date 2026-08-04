import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Field } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelHead, PanelTitle } from '@/components/ui/panel'
import { useUpdateXpRewardSettingsMutation } from '@/shared/queries/xp-reward.query'
import type { XpRewardSettingsDto } from '@/shared/services/xp-reward.service'

const schema = z.object({
  xpPerCorrect: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Must be 0 or more')
    .max(10_000, 'Must be 10,000 or less'),
  xpPerLesson: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Must be 0 or more')
    .max(10_000, 'Must be 10,000 or less'),
})

type FormValues = z.infer<typeof schema>

interface XpRewardFormPanelProps {
  settings: XpRewardSettingsDto
  onSaved: (message: string) => void
}

export function XpRewardFormPanel({ settings, onSaved }: XpRewardFormPanelProps) {
  const updateSettings = useUpdateXpRewardSettingsMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      xpPerCorrect: settings.xpPerCorrect,
      xpPerLesson: settings.xpPerLesson,
    },
  })

  useEffect(() => {
    reset({
      xpPerCorrect: settings.xpPerCorrect,
      xpPerLesson: settings.xpPerLesson,
    })
  }, [settings.id, settings.xpPerCorrect, settings.xpPerLesson, settings.updatedAt, reset])

  const onSubmit = handleSubmit((values) => {
    updateSettings.mutate(
      {
        xpPerCorrect: values.xpPerCorrect,
        xpPerLesson: values.xpPerLesson,
      },
      {
        onSuccess: () => {
          onSaved('XP reward settings saved.')
        },
      },
    )
  })

  return (
    <Panel>
      <form onSubmit={onSubmit}>
        <PanelHead>
          <PanelTitle>XP rewards</PanelTitle>
          <Button type="submit" disabled={!isDirty || updateSettings.isPending}>
            {updateSettings.isPending ? 'Saving…' : 'Save'}
          </Button>
        </PanelHead>

        <p className="mb-[16px] text-[13px] text-muted-foreground">
          These values apply when learners complete a lesson for the first time. Total XP is{' '}
          <span className="font-semibold text-foreground">(correct answers × per correct) + per lesson bonus</span>.
        </p>

        <div className="flex flex-col gap-[16px]">
          <Field label="XP per correct answer">
            <Input
              type="number"
              min={0}
              max={10_000}
              step={1}
              aria-invalid={Boolean(errors.xpPerCorrect)}
              {...register('xpPerCorrect', { valueAsNumber: true })}
            />
            {errors.xpPerCorrect ? (
              <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                {errors.xpPerCorrect.message}
              </p>
            ) : null}
          </Field>

          <Field label="XP per lesson completion">
            <Input
              type="number"
              min={0}
              max={10_000}
              step={1}
              aria-invalid={Boolean(errors.xpPerLesson)}
              {...register('xpPerLesson', { valueAsNumber: true })}
            />
            {errors.xpPerLesson ? (
              <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                {errors.xpPerLesson.message}
              </p>
            ) : null}
          </Field>
        </div>

        {updateSettings.error ? (
          <p className="mt-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
            {getApiErrorMessage(updateSettings.error)}
          </p>
        ) : null}
      </form>
    </Panel>
  )
}
