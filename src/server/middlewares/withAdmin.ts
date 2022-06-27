import { TRPCError } from '@trpc/server'
import { type MiddlewareFunction } from '@trpc/server/dist/declarations/src/internals/middlewares'

import { type Context } from 'server/context'

export const withAdmin: MiddlewareFunction<Context, Context, Record<string, unknown>> = async ({ ctx, next }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next()
}
