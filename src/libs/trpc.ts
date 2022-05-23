import { httpLink } from '@trpc/client/links/httpLink'
import { type withTRPC } from '@trpc/next'
import { createReactQueryHooks } from '@trpc/react'
import { type inferProcedureOutput, type inferProcedureInput } from '@trpc/server'

import { type AppRouter } from 'server/routers'

export const trpc = createReactQueryHooks<AppRouter>()

export function isNetworkError(error: unknown) {
  return error instanceof TypeError && error.message === 'Failed to fetch'
}

export function getTRPCConfiguration(): Parameters<typeof withTRPC>[0] {
  return {
    config() {
      const schemeAndAuthority = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'

      return {
        links: [
          httpLink({
            url: '/api/trpc',
          }),
        ],
        queryClientConfig: {
          defaultOptions: {
            queries: {
              networkMode: 'offlineFirst',
            },
          },
        },
        url: `${schemeAndAuthority}/api/trpc`,
      }
    },
    ssr: false,
  }
}

type TMutation = keyof AppRouter['_def']['mutations']

export type InferMutationInput<TRouteKey extends TMutation> = inferProcedureInput<
  AppRouter['_def']['mutations'][TRouteKey]
>

export type InferMutationOutput<TRouteKey extends TMutation> = inferProcedureOutput<
  AppRouter['_def']['mutations'][TRouteKey]
>
