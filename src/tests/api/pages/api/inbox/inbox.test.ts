import assert from 'assert'

import { HttpMethod } from 'constants/http'
import { isDateEqual } from 'libs/date'
import { InboxEntryData } from 'libs/db/inbox'
import indexHandler from 'pages/api/inbox'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestInboxEntry } from 'tests/api/db'

describe('inbox', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return an empty list', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<InboxEntryData[]>()

          expect(json.length).toBe(0)
        }))

      test('should return inbox entries ordered by creation date', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: inbox_entry_0_id } = await createTestInboxEntry()
          const { id: inbox_entry_1_id } = await createTestInboxEntry()
          const { id: inbox_entry_2_id } = await createTestInboxEntry()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<InboxEntryData[]>()

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
          const json = await res.json<InboxEntryData[]>()

          expect(json.length).toBe(1)

          assert(json[0])
          expect(Object.keys(json[0]).length).toBe(3)
          expect(json[0]?.id).toBe(id)
          expect(json[0]?.text).toBe(text)
          expect(isDateEqual(new Date(json[0]?.createdAt), createdAt)).toBe(true)
        }))

      test('should return a list with only notes & todos owned by the current user', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { userId: userId1 } = getTestUser('1')

          const { id: inbox_entry_0_id } = await createTestInboxEntry()
          await createTestInboxEntry({ userId: userId1 })
          const { id: inbox_entry_1_id } = await createTestInboxEntry()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<InboxEntryData[]>()

          expect(json.length).toBe(2)
          expect(json[0]?.id).toBe(inbox_entry_1_id)
          expect(json[1]?.id).toBe(inbox_entry_0_id)
        }))
    })
  })
})
