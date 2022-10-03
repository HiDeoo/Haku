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

type MutationPath = keyof AppRouter['_def']['mutations']

export type InferMutationInput<TRouteKey extends MutationPath> = inferProcedureInput<
  AppRouter['_def']['mutations'][TRouteKey]
>

export type InferMutationOutput<TRouteKey extends MutationPath> = inferProcedureOutput<
  AppRouter['_def']['mutations'][TRouteKey]
>
