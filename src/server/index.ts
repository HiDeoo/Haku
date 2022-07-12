import { router } from '@trpc/server'

import { type Context } from 'server/context'

export function createRouter() {
  return router<Context>()
}
