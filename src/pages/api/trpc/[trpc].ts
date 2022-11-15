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

export const config = {
  api: {
    bodyParser: {
      // This is defined in `IMAGE_MAX_SIZE_IN_MEGABYTES` in `src/constants/image.ts` but the configuration object must
      // only contain static constant literals without expressions.
      sizeLimit: `4mb`,
    },
  },
}
