import { type EmailConfig } from 'next-auth/providers'

export function EmailApiProvider(options: EmailApiProviderUserOptions): EmailConfig {
  return {
    id: 'email-api',
    name: 'Email',
    sendVerificationRequest: options.sendVerificationRequest,
    server: '',
    type: 'email',
    options,
  }
}

interface EmailApiProviderUserOptions {
  sendVerificationRequest: EmailConfig['sendVerificationRequest']
}
