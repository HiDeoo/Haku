import NextAuth, { type CallbacksOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { prisma } from 'libs/db'
import { EmailApiProvider, type EmailApiProviderUserOptions } from 'libs/auth'
import { getAllowedEmailByEmail } from 'libs/db/emailAllowList'
import { sendLoginEmail } from 'libs/email'

const auth = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: { session: getSession, signIn: canLogin },
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
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
      return '/auth/error?error=AccessDenied'
    }
  }

  return true
}

function sendVerificationRequest({
  identifier: email,
  url,
}: Parameters<EmailApiProviderUserOptions['sendVerificationRequest']>[0]) {
  return sendLoginEmail(email, url)
}
