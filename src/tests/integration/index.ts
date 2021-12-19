import { type NextApiHandler } from 'next'
import { type Session } from 'next-auth'
import { testApiHandler, type TestParameters } from 'next-test-api-route-handler'

import { getTestApiUrl, rest, server } from 'tests/integration/mocks/http'

// The test users will have sequential numbered IDs starting at `0`.
export const TEST_USER_COUNT = 2

export function testApiRoute<ResponseType>(
  handler: NextApiHandler<ResponseType>,
  test: (obj: { fetch: FetchFn }) => Promise<void>,
  options?: TestApiRouteOptions
) {
  return testApiHandler<ResponseType>({
    handler,
    params: mapDynamicRouteParams(options?.dynamicRouteParams),
    test: async (testParams) => {
      server.use(
        rest.get(getTestApiUrl('auth/session'), (_req, res, ctx) => res(ctx.json(getTestUserSession(options?.userId))))
      )

      await test({ fetch: testParams.fetch as FetchFn })
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

function mapDynamicRouteParams(params: TestApiRouteOptions['dynamicRouteParams']): TestParameters['params'] {
  if (!params) {
    return
  }

  return Object.entries(params).reduce((acc, [key, value]) => {
    acc[key] = typeof value === 'number' ? value.toString() : value

    return acc
  }, {} as NonNullable<TestParameters['params']>)
}

interface TestApiRouteOptions {
  dynamicRouteParams?: Record<string, string | string[] | number>
  userId?: UserId
}

type FetchFn = (init?: RequestInit) => FetchReturnType
type FetchReturnValue = Awaited<ReturnType<typeof fetch>>
type FetchReturnType = Promise<
  Omit<FetchReturnValue, 'json' | 'headers'> & {
    json: <Json>(...args: Parameters<FetchReturnValue['json']>) => Promise<Json>
    headers: FetchReturnValue['headers'] & {
      raw: () => Record<string, string | string[]>
    }
  }
>
