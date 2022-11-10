import crypto from 'crypto'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type NextAuthOptions, type CallbacksOptions } from 'next-auth'
import { type EmailConfig } from 'next-auth/providers'

import { AUTH_TOKEN_LENGTH, AUTH_TOKEN_MAX_AGE_IN_MINUTES } from 'constants/auth'
import { prisma } from 'libs/db'
import { getAllowedEmailByEmail } from 'libs/db/emailAllowList'
import { sendLoginEmail } from 'libs/email'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  callbacks: { session: getSession, signIn: canLogin },
  pages: {
    error: '/auth/error',
    signIn: '/auth/login',
  },
  providers: [EmailApiProvider({ sendVerificationRequest })],
  secret: process.env.NEXTAUTH_SECRET,
}

export default NextAuth(authOptions)

function EmailApiProvider(options: EmailApiProviderUserOptions): EmailConfig {
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

function generateVerificationToken() {
  return new Promise<string>((resolve, reject) =>
    crypto.randomBytes(AUTH_TOKEN_LENGTH, (error, buffer) => {
      if (error) {
        reject(error)

        return
      }

      resolve(Number.parseInt(buffer.toString('hex'), 16).toString().slice(0, AUTH_TOKEN_LENGTH))
    })
  )
}

function getSession({ session, user }: Parameters<CallbacksOptions['session']>[0]) {
  session.user = { id: user.id, email: user.email }

  return session
}

async function canLogin({ email, user }: Parameters<CallbacksOptions['signIn']>[0]) {
  if (email?.verificationRequest) {
    const allowedEmail = await getAllowedEmailByEmail(user.email)

    if (!allowedEmail) {
      return false
    }
  }

  return true
}

function sendVerificationRequest({
  identifier: email,
  token,
}: Parameters<EmailApiProviderUserOptions['sendVerificationRequest']>[0]) {
  if (process.env.NODE_ENV === 'development' && email.endsWith('@example.com')) {
    console.warn(`Magic code for ${email}: ${token}`)

    return
  }

  return sendLoginEmail({
    code: token,
    expiresIn: AUTH_TOKEN_MAX_AGE_IN_MINUTES.toString(),
    to: email,
  })
}

interface EmailApiProviderUserOptions {
  sendVerificationRequest: EmailConfig['sendVerificationRequest']
}
