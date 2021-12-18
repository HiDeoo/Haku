import { type EmailAllowList } from '@prisma/client'
import StatusCode from 'status-code-enum'

import getAndPostHandler from 'pages/api/admin/email'
import deleteHandler from 'pages/api/admin/email/[id]'
import { testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import { prisma } from 'libs/db'
import { type ApiClientErrorResponse } from 'libs/api/routes'

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
        const email0 = 'test1@example.com'
        const email1 = 'test2@example.com'

        await prisma.emailAllowList.createMany({ data: [{ email: email0 }, { email: email1 }] })

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

        expect(json.id).toBeDefined()
        expect(json.email).toEqual(email)

        const dbEmail = await prisma.emailAllowList.findUnique({ where: { email: email } })

        expect(dbEmail?.id).toBe(json.id)
      }))

    test('should not add a new duplicated email', () =>
      testApiRoute(getAndPostHandler, async ({ fetch }) => {
        const email = 'test@example.com'

        await prisma.emailAllowList.create({ data: { email } })

        const res = await fetch({
          method: HttpMethod.POST,
          headers: { 'Api-Key': process.env.ADMIN_API_KEY },
          body: JSON.stringify({ email: email }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe('This email already exists.')
      }))
  })

  describe('DELETE', () => {
    test('should delete an email', async () => {
      const email = 'test@example.com'

      const { id } = await prisma.emailAllowList.create({ data: { email } })

      return testApiRoute(
        deleteHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })

          const dbEmail = await prisma.emailAllowList.findUnique({ where: { id } })

          expect(dbEmail).toBeNull()
        },
        { dynamicRouteParams: { id: `${id}` } }
      )
    })

    test('should not delete a non existing email', async () => {
      return testApiRoute(
        deleteHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE, headers: { 'Api-Key': process.env.ADMIN_API_KEY } })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe('This email does not exist.')
        },
        { dynamicRouteParams: { id: '1' } }
      )
    })
  })
})
