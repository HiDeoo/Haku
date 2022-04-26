import type FormData from 'form-data'
import { type NextApiHandler } from 'next'
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

export type TestApiRouterHandler<TResponseType = unknown> = NextApiHandler<TResponseType> & { config?: object }

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
