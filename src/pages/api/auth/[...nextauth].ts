import { PrismaAdapter } from '@next-auth/prisma-adapter'
import NextAuth, { type CallbacksOptions } from 'next-auth'

import { AUTH_TOKEN_MAX_AGE_IN_MINUTES, EmailApiProvider, type EmailApiProviderUserOptions } from 'libs/auth'
import { prisma } from 'libs/db'
import { getAllowedEmailByEmail } from 'libs/db/emailAllowList'
import { sendLoginEmail } from 'libs/email'

const auth = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: { session: getSession, signIn: canLogin },
  pages: {
    error: '/auth/error',
    signIn: '/auth/login',
  },
  providers: [EmailApiProvider({ sendVerificationRequest })],
  secret: process.env.NEXTAUTH_SECRET,
})

export default auth

function getSession({ session, user }: Parameters<CallbacksOptions['session']>[0]) {
  session.user = { id: user.id, email: user.email }

  return session
}

async function canLogin({ email, user }: Parameters<CallbacksOptions['signIn']>[0]) {
  if (email.verificationRequest) {
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
    console.info(`Magic code for ${email}: ${token}`)

    return
  }

  return sendLoginEmail({
    code: token,
    expiresIn: AUTH_TOKEN_MAX_AGE_IN_MINUTES.toString(),
    to: email,
  })
}
