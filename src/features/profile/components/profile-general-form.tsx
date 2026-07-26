import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import type { MeDto } from '@/app/api/types'
import { Field, FieldRow } from '@/components/common/field'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel, PanelTitle } from '@/components/ui/panel'
import { useUpdateProfileMutation } from '@/shared/queries/auth.query'

const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(150, 'Name is too long'),
})

type FormValues = z.infer<typeof schema>

interface ProfileGeneralFormProps {
  me: MeDto
  onSaved: (message: string) => void
}

export function ProfileGeneralForm({ me, onSaved }: ProfileGeneralFormProps) {
  const updateProfile = useUpdateProfileMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: me.name },
  })

  useEffect(() => {
    reset({ name: me.name })
  }, [me.name, reset])

  const onSubmit = handleSubmit((values) => {
    updateProfile.mutate(values, {
      onSuccess: () => onSaved('Profile saved successfully.'),
    })
  })

  return (
    <Panel className="p-[26px]">
      <form onSubmit={onSubmit}>
        <PanelTitle>General information</PanelTitle>
        <p className="mb-[20px] mt-[4px] text-[12.5px] text-muted-foreground">
          This is shown to other admins and used for support contact.
        </p>

        <FieldRow className="mb-[18px] max-md:grid-cols-1">
          <Field label="Full name">
            <Input autoComplete="name" aria-invalid={Boolean(errors.name)} {...register('name')} />
            {errors.name ? (
              <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                {errors.name.message}
              </p>
            ) : null}
          </Field>
          <Field label="Email address">
            <Input type="email" value={me.email} disabled aria-describedby="email-hint" />
            <p id="email-hint" className="mt-[5px] text-[11.5px] text-muted-foreground">
              Contact a super-admin to change your login email.
            </p>
          </Field>
        </FieldRow>

        {updateProfile.error ? (
          <p className="mb-[12px] text-[12.5px] font-semibold text-destructive" role="alert">
            {getApiErrorMessage(updateProfile.error)}
          </p>
        ) : null}

        <div className="flex items-center gap-[10px]">
          <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}
