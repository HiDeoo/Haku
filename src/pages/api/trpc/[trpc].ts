import { createNextApiHandler } from '@trpc/server/adapters/next'

import { createContext } from 'server/context'
import { appRouter } from 'server/routers'

const handler = createNextApiHandler({
  batching: {
    enabled: false,
  },
  createContext,
  onError({ error }) {
    if (error.code === 'INTERNAL_SERVER_ERROR') {
      console.error('Unhandled API error:', error)
    }
  },
  router: appRouter,
})

export default handler
