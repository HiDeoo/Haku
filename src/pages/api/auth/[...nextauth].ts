import NextAuth, { type CallbacksOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { prisma } from 'libs/db'
import { EmailApiProvider } from 'libs/auth'
import { getAllowedEmailByEmail } from 'libs/db/emailAllowList'

const auth = NextAuth({
  adapter: PrismaAdapter(prisma),
  callbacks: { session: getSession, signIn: canLogin },
  pages: {
    signIn: '/auth/login',
    verifyRequest: '/auth/verify',
  },
  providers: [
    EmailApiProvider({
      sendVerificationRequest({ identifier: email, url, provider: { from } }) {
        // TODO(HiDeoo)
        console.log('email ', email)
        console.log('url ', url)
        console.log('from ', from)
        return
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
})

export default auth

function getSession({ session, user }: Parameters<CallbacksOptions['session']>[0]) {
  session.user = { id: user.id, email: user.email }

  return session
}

async function canLogin({ user }: Parameters<CallbacksOptions['signIn']>[0]) {
  const allowedEmail = await getAllowedEmailByEmail(user.email)

  if (!allowedEmail) {
    return '/auth/error?error=AccessDenied'
  }

  return true
}
