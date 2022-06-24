import { TRPCClientError } from '@trpc/react'

import Callout from 'components/form/Callout'

const Form: React.FC<FormProps> = ({ children, className, error, errorMessage, onSubmit, role }) => {
  return (
    <form onSubmit={onSubmit} className={className} role={role}>
      {error || errorMessage ? <FormError error={error} errorMessage={errorMessage} /> : null}
      {children}
    </form>
  )
}

export default Form

const FormError: React.FC<Omit<FormProps, 'onSubmit' | 'children'>> = ({ error, errorMessage }) => {
  const message = error instanceof TRPCClientError ? error.message : errorMessage ?? 'Something went wrong!'

  return <Callout intent="error" message={message} />
}

export interface FormProps {
  children: React.ReactNode
  className?: string
  error?: unknown
  errorMessage?: string
  onSubmit: NonNullable<React.DOMAttributes<HTMLFormElement>['onSubmit']>
  role?: React.HtmlHTMLAttributes<HTMLFormElement>['role']
}
