import assert from 'assert'

import faker from '@faker-js/faker'
import FormData from 'form-data'
import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { prisma } from 'libs/db'
import { InboxEntryData } from 'libs/db/inbox'
import * as share from 'pages/api/inbox/share'
import { getConfiguredApiHandler, getTestUser, testApiRoute } from 'tests/api'
import { getTestInboxEntry } from 'tests/api/db'

const shareHandler = getConfiguredApiHandler(share.default, share.config)

describe('inbox share', () => {
  describe('POST', () => {
    test('should not add an inbox entry with no text', async () =>
      testApiRoute(shareHandler, async ({ fetch }) => {
        const body = new FormData()

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorBadRequest)
      }))

    test('should not add an inbox entry with an invalid share token', async () =>
      testApiRoute(shareHandler, async ({ fetch }) => {
        const { body } = getFakeInboxEntry('invalidInboxToken')

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })

        expect(res.status).toBe(StatusCode.ClientErrorUnauthorized)
      }))

    test('should add an inbox entry with no inbox token', async () =>
      testApiRoute(shareHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const { body, text } = getFakeInboxEntry()

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<InboxEntryData>()

        const testInboxEntry = await getTestInboxEntry(json.id)

        expect(testInboxEntry).toBeDefined()
        expect(testInboxEntry?.text).toBe(text)
        expect(testInboxEntry?.createdAt).toBeDefined()
        expect(testInboxEntry?.userId).toBe(userId)
      }))

    test('should add an inbox entry with an inbox token', async () =>
      testApiRoute(shareHandler, async ({ fetch }) => {
        const user1 = await prisma.user.findUnique({ where: { id: '1' } })
        assert(user1)

        const { body, text } = getFakeInboxEntry(user1.inboxToken)

        const res = await fetch({
          method: HttpMethod.POST,
          body: body,
        })
        const json = await res.json<InboxEntryData>()

        const testInboxEntry = await getTestInboxEntry(json.id)

        expect(testInboxEntry).toBeDefined()
        expect(testInboxEntry?.text).toBe(text)
        expect(testInboxEntry?.createdAt).toBeDefined()
        expect(testInboxEntry?.userId).toBe(user1.id)
      }))
  })
})

function getFakeInboxEntry(token?: string) {
  const formData = new FormData()

  const text = faker.random.words()

  if (token) {
    formData.append('token', token)
  }

  formData.append('text', text)

  return { body: formData, text }
}
