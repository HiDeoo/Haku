import { signOut } from 'next-auth/react'

const errorMessages: Partial<Record<ErrorType, string>> = {
  AccessDenied: 'You do not have permission to login.',
  EmailSignin: 'The login email could not be sent, please try again.',
  Verification: 'The verification code is invalid or expired.',
}

export function getAuthErrorMesssage(queryStringErrorType: QueryStringErrorType): string {
  const errorType: ErrorType = isErrorType(queryStringErrorType) ? queryStringErrorType : 'Default'

  return errorMessages[errorType] ?? 'Something went wrong!'
}

export function logout() {
  signOut({ callbackUrl: `/auth/login` })
}

function isErrorType(error: string | string[] | undefined): error is ErrorType {
  return typeof error === 'string' && errorTypes.includes(error as ErrorType)
}

const errorTypes = ['AccessDenied', 'Configuration', 'EmailSignin', 'Default', 'Verification'] as const
type ErrorType = typeof errorTypes[number]
type QueryStringErrorType = string | string[] | undefined
