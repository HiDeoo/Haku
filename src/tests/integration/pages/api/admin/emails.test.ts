import { type EmailAllowList } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { testApiRoute } from 'tests/integration'
import { createTestEmailAllowList, getTestEmailAllowList, getTestEmailAllowLists } from 'tests/integration/db'
import getAndPostHandler from 'pages/api/admin/emails'
import deleteHandler from 'pages/api/admin/emails/[id]'
import { HttpMethod } from 'libs/http'
import {
  type ApiErrorResponse,
  API_ERROR_EMAIL_ALREADY_EXISTS,
  API_ERROR_EMAIL_DOES_NOT_EXISTS,
} from 'libs/api/routes/errors'

describe('admin/emails', () => {
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
        const json = await res.json<EmailAllowList[]>()

        expect(json.length).toBe(0)
      }))

    test('should return allowed emails', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const { email: email0 } = await createTestEmailAllowList({ email: 'test1@example.com' })
        const { email: email1 } = await createTestEmailAllowList({ email: 'test2@example.com' })

        const res = await fetch({ method: HttpMethod.GET, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })
        const json = await res.json<EmailAllowList[]>()

        expect(json.length).toBe(2)
        expect(json[0]?.email).toBe(email0)
        expect(json[1]?.email).toBe(email1)
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

        const dbEmail = await getTestEmailAllowList(json.id)

        expect(dbEmail?.email).toBe(json.email)
      }))

    test('should not add a new duplicated email', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const { email } = await createTestEmailAllowList()

        const res = await fetch({
          method: HttpMethod.POST,
          headers: { 'Api-Key': process.env.ADMIN_API_KEY },
          body: JSON.stringify({ email }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_EMAIL_ALREADY_EXISTS)

        const dbEmails = await getTestEmailAllowLists({ email })

        expect(dbEmails.length).toBe(1)
      }))
  })

  describe('DELETE', () => {
    test('should delete an email', async () => {
      const { id } = await createTestEmailAllowList()

      return testApiRoute(
        deleteHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })

          const dbEmail = await getTestEmailAllowList(id)

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
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_EMAIL_DOES_NOT_EXISTS)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })
  })
})
