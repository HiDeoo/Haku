import cuid from 'cuid'

import { API_ERROR_EMAIL_ALREADY_EXISTS, API_ERROR_EMAIL_DOES_NOT_EXISTS } from 'constants/error'
import { testApiRoute } from 'tests/api'
import { createTestEmailAllowList, getTestEmailAllowList, getTestEmailAllowLists } from 'tests/api/db'

describe('admin.email', () => {
  describe('all', () => {
    test('should fail without a valid API key', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.query('admin.email.list')).rejects.toThrow('UNAUTHORIZED')
      }))

    test('should return an empty list of allowed emails', () =>
      testApiRoute(
        async ({ caller }) => {
          const res = await caller.query('admin.email.list')

          expect(res.length).toBe(0)
        },
        { isAdmin: true }
      ))

    test('should return allowed emails', () =>
      testApiRoute(
        async ({ caller }) => {
          const { email: email0 } = await createTestEmailAllowList()
          const { email: email1 } = await createTestEmailAllowList()

          const res = await caller.query('admin.email.list')

          expect(res.length).toBe(2)
          expect(res[0]?.email).toBe(email0)
          expect(res[1]?.email).toBe(email1)
        },
        { isAdmin: true }
      ))
  })

  describe('add', () => {
    test('should fail without a valid API key', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.mutation('admin.email.add', { email: 'test@example.com' })).rejects.toThrow(
          'UNAUTHORIZED'
        )
      }))

    test('should add a new email', () =>
      testApiRoute(
        async ({ caller }) => {
          const email = 'test@example.com'

          const res = await caller.mutation('admin.email.add', { email })

          const testEmail = await getTestEmailAllowList(res.id)

          expect(testEmail?.email).toBe(email)
        },
        { isAdmin: true }
      ))

    test('should not add a new duplicated email', () =>
      testApiRoute(
        async ({ caller }) => {
          const { email } = await createTestEmailAllowList()

          await expect(() => caller.mutation('admin.email.add', { email })).rejects.toThrow(
            API_ERROR_EMAIL_ALREADY_EXISTS
          )

          const testEmails = await getTestEmailAllowLists({ email })

          expect(testEmails.length).toBe(1)
        },
        { isAdmin: true }
      ))
  })

  describe('delete', () => {
    test('should fail without a valid API key', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.mutation('admin.email.delete', { id: '123456' })).rejects.toThrow('UNAUTHORIZED')
      }))

    test('should delete an email', () =>
      testApiRoute(
        async ({ caller }) => {
          const { id } = await createTestEmailAllowList()

          await caller.mutation('admin.email.delete', { id })

          const testEmail = await getTestEmailAllowList(id)

          expect(testEmail).toBeNull()
        },
        { isAdmin: true }
      ))

    test('should not delete a non existing email', () =>
      testApiRoute(
        async ({ caller }) => {
          await expect(() => caller.mutation('admin.email.delete', { id: cuid() })).rejects.toThrow(
            API_ERROR_EMAIL_DOES_NOT_EXISTS
          )
        },
        { isAdmin: true }
      ))
  })
})
