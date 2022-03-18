import crypto from 'crypto'

import { type EmailConfig } from 'next-auth/providers'
import { signOut } from 'next-auth/react'

export const AUTH_TOKEN_MAX_AGE_IN_MINUTES = 5
export const AUTH_TOKEN_LENGTH = 6

const errorMessages: Partial<Record<ErrorType, string>> = {
  AccessDenied: 'You do not have permission to login.',
  EmailSignin: 'The login email could not be sent, please try again.',
  Verification: 'The verification code is invalid or expired.',
}

export function EmailApiProvider(options: EmailApiProviderUserOptions): EmailConfig {
  return {
    id: 'email-api',
    generateVerificationToken,
    maxAge: AUTH_TOKEN_MAX_AGE_IN_MINUTES * 60,
    name: 'Email',
    sendVerificationRequest: options.sendVerificationRequest,
    server: '',
    type: 'email',
    options,
  }
}

export function getAuthErrorMesssage(queryStringErrorType: QueryStringErrorType): string {
  const errorType: ErrorType = isErrorType(queryStringErrorType) ? queryStringErrorType : 'Default'

  return errorMessages[errorType] ?? 'Something went wrong!'
}

function generateVerificationToken() {
  return new Promise<string>((resolve, reject) =>
    crypto.randomBytes(AUTH_TOKEN_LENGTH, (error, buffer) => {
      if (error) {
        reject(error)

        return
      }

      resolve(parseInt(buffer.toString('hex'), 16).toString().substring(0, AUTH_TOKEN_LENGTH))
    })
  )
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

export interface EmailApiProviderUserOptions {
  sendVerificationRequest: EmailConfig['sendVerificationRequest']
}
