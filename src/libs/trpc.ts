import { httpLink } from '@trpc/client/links/httpLink'
import { type withTRPC } from '@trpc/next'
import { createTRPCReact } from '@trpc/react-query'
import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server'

import { type AppRouter } from 'server/routers'

export const trpc = createTRPCReact<AppRouter>()

export function isNetworkError(error: unknown) {
  return error instanceof TypeError && error.message === 'Failed to fetch'
}

export function getTRPCConfiguration(): Parameters<typeof withTRPC>[0] {
  return {
    config() {
      const url = `${
        process.env['NEXT_PUBLIC_SITE_URL'] ? `https://${process.env['NEXT_PUBLIC_SITE_URL']}` : 'http://localhost:3000'
      }/api/trpc`

      return {
        links: [
          httpLink({
            url,
          }),
        ],
        queryClientConfig: {
          defaultOptions: {
            queries: {
              networkMode: 'offlineFirst',
            },
          },
        },
        url,
      }
    },
    ssr: false,
  }
}

export type RouterInput = inferRouterInputs<AppRouter>
export type RouterOutput = inferRouterOutputs<AppRouter>
