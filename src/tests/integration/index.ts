import { type NextApiHandler } from 'next'
import { type Session } from 'next-auth'
import { testApiHandler } from 'next-test-api-route-handler'

import { getTestApiUrl, rest, server } from 'tests/integration/mocks/http'

export function testApiRoute<T>(
  route: string,
  handler: NextApiHandler<T>,
  test: (obj: { fetch: (init?: RequestInit) => FetchReturnType<T> }) => Promise<void>
) {
  return testApiHandler<T>({
    handler,
    url: `/api/${route}`,
    test: async (testParams) => {
      server.use(rest.get(getTestApiUrl('auth/session'), (_req, res, ctx) => res(ctx.json(getTestUserSession(1)))))

      await test(testParams)
    },
  })
}

function getTestUserSession(userId: number): Session {
  return { expires: '', user: { id: `${userId}`, email: `test${userId}@example.com` } }
}

type FetchReturnValue = Awaited<ReturnType<typeof fetch>>
type FetchReturnType<T> = Promise<
  Omit<FetchReturnValue, 'json' | 'headers'> & {
    json: (...args: Parameters<FetchReturnValue['json']>) => Promise<T>
    headers: FetchReturnValue['headers'] & {
      raw: () => Record<string, string | string[]>
    }
  }
>
