import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { getApiErrorMessage } from '@/app/api/http-client'
import { Field } from '@/components/common/field'
import { PasswordInput } from '@/components/common/password-input'
import { AuthLayout } from '@/components/layouts/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Panel } from '@/components/ui/panel'
import { useLoginMutation } from '@/shared/queries/auth.query'

const loginSchema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const login = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit((values) => {
    login.mutate(values)
  })

  const errorMessage = login.error ? getApiErrorMessage(login.error, login.error.message) : null

  return (
    <AuthLayout>
      <Panel className="mb-0 p-[26px]">
        <form onSubmit={onSubmit} className="flex flex-col gap-[16px]" noValidate>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="username"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
            {errors.email ? (
              <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                {errors.email.message}
              </p>
            ) : null}
          </Field>

          <Field label="Password">
            <PasswordInput
              autoComplete="current-password"
              toggleLabel="password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
            {errors.password ? (
              <p className="mt-[5px] text-[12.5px] font-semibold text-destructive" role="alert">
                {errors.password.message}
              </p>
            ) : null}
          </Field>

          {errorMessage ? (
            <p className="rounded-[10px] border border-[#FCA5A5] bg-destructive-soft px-[12px] py-[10px] text-[12.5px] font-semibold text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </Panel>
    </AuthLayout>
  )
}
