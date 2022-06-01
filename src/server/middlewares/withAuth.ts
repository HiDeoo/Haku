import { TRPCError } from '@trpc/server'
import { type MiddlewareFunction } from '@trpc/server/dist/declarations/src/internals/middlewares'
import { type Session } from 'next-auth'

import { type Context } from 'server/context'

const withAuth: MiddlewareFunction<
  Context,
  Omit<Context, 'user'> & { user: Session['user'] },
  Record<string, unknown>
> = async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
}

export default withAuth
