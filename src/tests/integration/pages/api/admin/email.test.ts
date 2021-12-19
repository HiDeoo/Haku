import { type EmailAllowList } from '@prisma/client'
import StatusCode from 'status-code-enum'

import getAndPostHandler from 'pages/api/admin/email'
import deleteHandler from 'pages/api/admin/email/[id]'
import { testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import { prisma } from 'libs/db'
import { type ApiClientErrorResponse } from 'libs/api/routes'
import { API_ERROR_EMAIL_ALREADY_EXISTS, API_ERROR_EMAIL_DOES_NOT_EXISTS } from 'libs/api/routes/errors'

describe('admin/email', () => {
  describe('GET', () => {
    test('should fail without an API key', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET })

        expect(res.status).toBe(StatusCode.ClientErrorUnauthorized)
      }))

    test('should fail with an invalid API key', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET, headers: { 'Api-Key': 'abc' } })

        expect(res.status).toBe(StatusCode.ClientErrorUnauthorized)
      }))

    test('should return an empty list of allowed emails', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })
        const json = await res.json()

        expect(json).toEqual([])
      }))

    test('should return allowed emails', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const { email: email0 } = await createDbEmailAllowList({ email: 'test1@example.com' })
        const { email: email1 } = await createDbEmailAllowList({ email: 'test2@example.com' })

        const res = await fetch({ method: HttpMethod.GET, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })
        const json = await res.json<EmailAllowList[]>()

        expect(json.length).toEqual(2)
        expect(json[0]?.email).toEqual(email0)
        expect(json[1]?.email).toEqual(email1)
      }))
  })

  describe('POST', () => {
    test('should add a new email', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const email = 'test@example.com'

        const res = await fetch({
          method: HttpMethod.POST,
          headers: { 'Api-Key': process.env.ADMIN_API_KEY },
          body: JSON.stringify({ email }),
        })
        const json = await res.json<EmailAllowList>()

        const dbEmail = await getDbEmailAllowList(json.id)

        expect(dbEmail?.email).toBe(json.email)
      }))

    test('should not add a new duplicated email', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const { email } = await createDbEmailAllowList()

        const res = await fetch({
          method: HttpMethod.POST,
          headers: { 'Api-Key': process.env.ADMIN_API_KEY },
          body: JSON.stringify({ email }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_EMAIL_ALREADY_EXISTS)

        const dbEmails = await getDbEmailAllowLists({ email })

        expect(dbEmails.length).toBe(1)
      }))
  })

  describe('DELETE', () => {
    test('should delete an email', async () => {
      const { id } = await createDbEmailAllowList()

      return testApiRoute(
        deleteHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })

          const dbEmail = await getDbEmailAllowList(id)

          expect(dbEmail).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not delete a non existing email', async () => {
      return testApiRoute(
        deleteHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_EMAIL_DOES_NOT_EXISTS)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })
  })
})

function createDbEmailAllowList(options?: DbEmailAllowListOptions) {
  return prisma.emailAllowList.create({
    data: {
      email: options?.email ?? 'test@example.com',
    },
  })
}

function getDbEmailAllowLists(options: DbEmailAllowListOptions) {
  return prisma.emailAllowList.findMany({
    where: options,
  })
}

function getDbEmailAllowList(id: EmailAllowList['id']) {
  return prisma.emailAllowList.findUnique({ where: { id } })
}

interface DbEmailAllowListOptions {
  email?: EmailAllowList['email']
}
