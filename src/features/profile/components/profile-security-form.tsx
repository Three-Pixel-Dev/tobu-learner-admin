import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Field } from '@/components/common/field'
import { PasswordInput } from '@/components/common/password-input'
import { Button } from '@/components/ui/button'
import { Panel, PanelTitle } from '@/components/ui/panel'
import {
  getPasswordChecks,
  getPasswordScore,
  getStrengthColor,
  getStrengthLabel,
} from '@/features/profile/util/password-strength'
import { useChangePasswordMutation } from '@/shared/queries/auth.query'
import { cn } from '@/util/cn'

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, "Password doesn't meet the requirements below."),
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .superRefine((values, ctx) => {
    const checks = getPasswordChecks(values.newPassword)
    const score = getPasswordScore(checks)
    if (score < 3) {
      ctx.addIssue({
        code: 'custom',
        path: ['newPassword'],
        message: "Password doesn't meet the requirements below.",
      })
    }
    if (values.confirmPassword !== values.newPassword) {
      ctx.addIssue({
        code: 'custom',
        path: ['confirmPassword'],
        message: "Passwords don't match.",
      })
    }
  })

type FormValues = z.infer<typeof schema>

interface ProfileSecurityFormProps {
  onSaved: (message: string) => void
}

export function ProfileSecurityForm({ onSaved }: ProfileSecurityFormProps) {
  const changePassword = useChangePasswordMutation()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  })

  const newPassword = useWatch({ control, name: 'newPassword' }) ?? ''
  const checks = useMemo(() => getPasswordChecks(newPassword), [newPassword])
  const score = getPasswordScore(checks)
  const strengthColor = getStrengthColor(score)
  const strengthLabel = getStrengthLabel(newPassword, score)

  const onSubmit = handleSubmit((values) => {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => onSaved('Password updated successfully. Please sign in again.'),
      },
    )
  })

  return (
    <div>
      <Panel className="p-[26px]">
        <form onSubmit={onSubmit} noValidate>
          <PanelTitle>Change password</PanelTitle>
          <p className="mb-[20px] mt-[4px] text-[12.5px] text-muted-foreground">
            Choose a strong password you don't use anywhere else.
          </p>

          <div className="mb-[18px]">
            <Field label="Current password">
              <PasswordInput
                autoComplete="current-password"
                toggleLabel="current password"
                aria-invalid={Boolean(errors.currentPassword)}
                {...register('currentPassword')}
              />
              {errors.currentPassword ? (
                <p className="mt-[6px] text-[12.5px] font-semibold text-destructive" role="alert">
                  ⚠ {errors.currentPassword.message}
                </p>
              ) : null}
            </Field>
          </div>

          <div className="mb-[18px]">
            <Field label="New password">
              <PasswordInput
                autoComplete="new-password"
                toggleLabel="new password"
                aria-invalid={Boolean(errors.newPassword)}
                {...register('newPassword')}
              />
              {errors.newPassword ? (
                <p className="mt-[6px] text-[12.5px] font-semibold text-destructive" role="alert">
                  ⚠ {errors.newPassword.message}
                </p>
              ) : null}

              <div className="mt-[8px] flex gap-[4px]" aria-hidden>
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-[5px] flex-1 rounded-[4px] bg-muted"
                    style={{ background: index < score ? strengthColor : undefined }}
                  />
                ))}
              </div>
              <p className="mt-[5px] text-[11.5px] font-bold" role="status" aria-live="polite">
                {strengthLabel}
              </p>

              <ul className="mt-[10px] grid grid-cols-2 gap-x-[14px] gap-y-[6px] max-md:grid-cols-1">
                {(
                  [
                    ['len', 'At least 8 characters'],
                    ['caseMix', 'Upper & lower case'],
                    ['num', 'At least 1 number'],
                    ['sym', 'At least 1 symbol'],
                  ] as const
                ).map(([key, label]) => (
                  <li
                    key={key}
                    className={cn(
                      'flex items-center gap-[6px] text-[12px] text-muted-foreground',
                      checks[key] && 'font-semibold text-primary-dark',
                    )}
                  >
                    <span className="w-[14px] text-center">{checks[key] ? '✓' : '○'}</span>
                    {label}
                  </li>
                ))}
              </ul>
            </Field>
          </div>

          <div className="mb-[18px]">
            <Field label="Confirm new password">
              <PasswordInput
                autoComplete="new-password"
                toggleLabel="password confirmation"
                aria-invalid={Boolean(errors.confirmPassword)}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? (
                <p className="mt-[6px] text-[12.5px] font-semibold text-destructive" role="alert">
                  ⚠ {errors.confirmPassword.message}
                </p>
              ) : null}
            </Field>
          </div>

          {changePassword.error ? (
            <p className="mb-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
              {getApiErrorMessage(changePassword.error)}
            </p>
          ) : null}

          <div className="flex items-center gap-[10px]">
            <Button type="submit" disabled={changePassword.isPending}>
              {changePassword.isPending ? 'Updating…' : 'Update password'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => reset()} disabled={changePassword.isPending}>
              Cancel
            </Button>
          </div>
        </form>
      </Panel>

      <Panel className="p-[26px]">
        <PanelTitle>Two-factor authentication</PanelTitle>
        <p className="mb-[20px] mt-[4px] text-[12.5px] text-muted-foreground">
          Add an extra layer of security to your admin account.
        </p>
        <div className="flex flex-wrap items-center justify-between gap-[16px]">
          <div>
            <div className="text-[14px] font-semibold">2FA is currently off</div>
            <div className="mt-[2px] max-w-[440px] text-[12.5px] text-muted-foreground">
              We recommend enabling this since your role can publish content and manage user accounts.
            </div>
          </div>
          <Button type="button" variant="ghost" disabled title="Coming soon">
            Enable 2FA
          </Button>
        </div>
      </Panel>
    </div>
  )
}
