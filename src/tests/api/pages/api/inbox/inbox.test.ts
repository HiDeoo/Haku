import assert from 'assert'

import cuid from 'cuid'
import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { ApiErrorResponse, API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST } from 'libs/api/routes/errors'
import { isDateEqual } from 'libs/date'
import { type InboxEntriesData } from 'libs/db/inbox'
import indexHandler from 'pages/api/inbox'
import idHandler from 'pages/api/inbox/[id]'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestInboxEntry, getTestInboxEntry } from 'tests/api/db'

describe('inbox', () => {
  describe('GET', () => {
    test('should return an empty list', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<InboxEntriesData>()

        expect(json.length).toBe(0)
      }))

    test('should return inbox entries ordered by creation date', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: inbox_entry_0_id } = await createTestInboxEntry()
        const { id: inbox_entry_1_id } = await createTestInboxEntry()
        const { id: inbox_entry_2_id } = await createTestInboxEntry()

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<InboxEntriesData>()

        expect(json.length).toBe(3)

        expect(json[0]?.id).toBe(inbox_entry_2_id)
        expect(json[1]?.id).toBe(inbox_entry_1_id)
        expect(json[2]?.id).toBe(inbox_entry_0_id)
      }))

    test('should return a list with only the ID, creation date & text', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { createdAt, id, text } = await createTestInboxEntry({
          text: 'inbox entry text',
        })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<InboxEntriesData>()

        expect(json.length).toBe(1)

        assert(json[0])
        expect(Object.keys(json[0]).length).toBe(3)
        expect(json[0]?.id).toBe(id)
        expect(json[0]?.text).toBe(text)
        expect(isDateEqual(new Date(json[0]?.createdAt), createdAt)).toBe(true)
      }))

    test('should return a list with only inbox entries owned by the current user', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { userId: userId1 } = getTestUser('1')

        const { id: inbox_entry_0_id } = await createTestInboxEntry()
        await createTestInboxEntry({ userId: userId1 })
        const { id: inbox_entry_1_id } = await createTestInboxEntry()

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<InboxEntriesData>()

        expect(json.length).toBe(2)
        expect(json[0]?.id).toBe(inbox_entry_1_id)
        expect(json[1]?.id).toBe(inbox_entry_0_id)
      }))
  })

  describe('DELETE', () => {
    test('should remove an empty folder', async () => {
      const { id } = await createTestInboxEntry()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE })

          const testInboxEntry = await getTestInboxEntry(id)

          expect(testInboxEntry).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove an inbox entry not owned by the current user', async () => {
      const { id } = await createTestInboxEntry({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST)

          const testInboxEntry = await getTestInboxEntry(id)

          expect(testInboxEntry).toBeDefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a nonexisting inbox entry', async () => {
      const id = cuid()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST)

          const testInboxEntry = await getTestInboxEntry(id)

          expect(testInboxEntry).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})
