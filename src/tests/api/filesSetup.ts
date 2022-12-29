import { beforeAll, beforeEach, afterAll, afterEach } from 'vitest'

import { prisma } from 'libs/db'
import { TEST_USER_COUNT } from 'tests/api'
import { server } from 'tests/api/mocks/http'

// https://github.com/vercel/next.js/discussions/13678#discussioncomment-22383
import 'next'

let tableNames: { tableName: string }[] | undefined

beforeAll(async () => {
  tableNames = await prisma.$queryRaw`SELECT "tablename" AS "tableName" FROM "pg_tables" WHERE "schemaname"='public'`

  server.listen({ onUnhandledRequest: () => undefined })
})

beforeEach(async () => {
  await prisma.user.createMany({
    data: Array.from({ length: TEST_USER_COUNT }).map((_, index) => {
      return { email: `test${index}@example.com`, id: `${index}` }
    }),
  })
})

afterEach(async () => {
  if (!tableNames) {
    throw new Error('Could not truncate database tables after each tests due to missing table names.')
  }

  for (const { tableName } of tableNames) {
    if (tableName !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tableName}" CASCADE;`)
    }
  }

  server.resetHandlers()
})

afterAll(() => server.close())
