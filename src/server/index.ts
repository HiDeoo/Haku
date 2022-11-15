import { initTRPC, TRPCError } from '@trpc/server'

import { API_ERROR_UNKNOWN } from 'constants/error'
import { type Context } from 'server/context'

const trpc = initTRPC.context<Context>().create({
  errorFormatter({ error, shape }) {
    return {
      ...shape,
      data: {},
      message: error.code === 'INTERNAL_SERVER_ERROR' ? API_ERROR_UNKNOWN : error.message,
    }
  },
})

const isAdmin = trpc.middleware(({ next, ctx }) => {
  if (!ctx.isAdmin) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next()
})

const isAuth = trpc.middleware(({ next, ctx }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

export const mergeRouters = trpc.mergeRouters
export const router = trpc.router

export const publicProcedure = trpc.procedure

export const adminProcedure = publicProcedure.use(isAdmin)
export const authProcedure = publicProcedure.use(isAuth)
