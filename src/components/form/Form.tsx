import { TRPCClientError } from '@trpc/react'

import { Callout } from 'components/form/Callout'

export const Form = ({ children, className, error, errorMessage, onSubmit, role }: FormProps) => {
  return (
    <form onSubmit={onSubmit} className={className} role={role}>
      {error || errorMessage ? <FormError error={error} errorMessage={errorMessage} /> : null}
      {children}
    </form>
  )
}

const FormError = ({ error, errorMessage }: Omit<FormProps, 'onSubmit' | 'children'>) => {
  const message = error instanceof TRPCClientError ? error.message : errorMessage ?? 'Something went wrong!'

  return <Callout intent="error" message={message} />
}

export interface FormProps {
  children: React.ReactNode
  className?: string
  error?: unknown
  errorMessage?: string
  onSubmit: NonNullable<React.ComponentPropsWithoutRef<'form'>['onSubmit']>
  role?: React.ComponentPropsWithoutRef<'form'>['role']
}
