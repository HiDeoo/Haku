import { type Context } from 'server/context'
import { appRouter } from 'server/routers'

// The test users will have sequential numbered IDs starting at `0`.
export const TEST_USER_COUNT = 2

export async function testApiRoute(handler: TestApiRouteHandler, callerContext?: Context) {
  const caller = appRouter.createCaller(callerContext ?? { user: getTestUser() })

  await handler({ caller })
}

export function getTestUser(id = '0') {
  const idAsNumber = parseInt(id, 10)

  if (idAsNumber < 0 || idAsNumber >= TEST_USER_COUNT) {
    throw new Error('Invalid test user ID.')
  }

  return { id: `${id}`, email: `test${id}@example.com`, userId: `${id}` }
}

type TestApiRouteHandler = (params: { caller: ReturnType<typeof appRouter.createCaller> }) => Promise<void>
