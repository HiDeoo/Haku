import { type IncomingHttpHeaders } from 'http'

import { type inferAsyncReturnType } from '@trpc/server'
import { type CreateNextContextOptions } from '@trpc/server/adapters/next'
import { type NextApiResponse, type NextApiRequest } from 'next'
import { unstable_getServerSession } from 'next-auth'

import { authOptions } from 'pages/api/auth/[...nextauth]'

export async function createContext(opts: CreateNextContextOptions) {
  return {
    isAdmin: isAdmin(opts.req.headers),
    user: await getUser(opts.req, opts.res),
  }
}

function isAdmin(headers?: IncomingHttpHeaders) {
  const apiKey = headers?.['api-key']

  return apiKey === process.env.ADMIN_API_KEY
}

async function getUser(req: NextApiRequest, res: NextApiResponse) {
  const session = await unstable_getServerSession(req, res, authOptions)

  return session?.user
}

export type Context = Partial<inferAsyncReturnType<typeof createContext>>
