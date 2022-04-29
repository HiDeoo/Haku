import type FormData from 'form-data'
import { type PageConfig, type NextApiHandler } from 'next'
import { type Session } from 'next-auth'
import { testApiHandler, type NtarhParameters } from 'next-test-api-route-handler'

import { getTestApiUrl, rest, server } from 'tests/api/mocks/http'

// The test users will have sequential numbered IDs starting at `0`.
export const TEST_USER_COUNT = 2

export function testApiRoute<TResponseType>(
  handler: TestApiRouterHandler<TResponseType>,
  test: (obj: { fetch: FetchFn }) => Promise<void>,
  options?: TestApiRouteOptions
) {
  return testApiHandler<TResponseType>({
    handler,
    params: mapDynamicRouteParams(options?.dynamicRouteParams),
    test: async (testParams) => {
      server.use(
        rest.get(getTestApiUrl('auth/session'), (_req, res, ctx) => res(ctx.json(getTestUserSession(options?.userId))))
      )

      await test({ fetch: testParams.fetch as unknown as FetchFn })
    },
  })
}

// For route handlers with a custom route configuration, e.g. with a disabled body parser in order to use `multer`, we
// need to explicitely attach the route configuration to the route handler as `next-test-api-route-handler` cannot
// attach it automatically.
// https://github.com/vercel/next.js/blob/e969d226999bb0fcb52ecc203b359f3715ff69bf/packages/next/next-server/server/api-utils.ts#L39
export function getConfiguredApiHandler(handler: NextApiHandler, config: PageConfig): TestApiRouterHandler {
  const configuredHandler: TestApiRouterHandler = handler
  configuredHandler.config = config

  return configuredHandler
}

export function getTestUser(userId = '0'): UserWithUserId {
  const userIdAsNumber = parseInt(userId, 10)

  if (userIdAsNumber < 0 || userIdAsNumber >= TEST_USER_COUNT) {
    throw new Error('Invalid test user ID.')
  }

  return { userId: `${userId}`, email: `test${userId}@example.com` }
}

function getTestUserSession(userId?: string): Session {
  const user = getTestUser(userId)

  return { expires: '', user: { email: user.email, id: user.userId } }
}

function mapDynamicRouteParams(params: TestApiRouteOptions['dynamicRouteParams']): NtarhParameters['params'] {
  if (!params) {
    return
  }

  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [key, typeof value === 'number' ? value.toString() : value])
  )
}

type TestApiRouterHandler<TResponseType = unknown> = NextApiHandler<TResponseType> & { config?: PageConfig }

interface TestApiRouteOptions {
  dynamicRouteParams?: Record<string, string | string[] | number>
  userId?: UserId
}

type FetchRequestInit = Omit<RequestInit, 'body'> & { body?: RequestInit['body'] | FormData }
type FetchFn = (init?: FetchRequestInit) => FetchReturnType
type FetchReturnValue = Awaited<ReturnType<typeof fetch>>
type FetchReturnType = Promise<
  Omit<FetchReturnValue, 'json' | 'headers'> & {
    json: <TJson>(...args: Parameters<FetchReturnValue['json']>) => Promise<TJson>
    headers: FetchReturnValue['headers'] & {
      raw: () => Record<string, string | string[]>
    }
  }
>
