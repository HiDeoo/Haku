import assert from 'assert'

import { faker } from '@faker-js/faker'
import cuid from 'cuid'
import { describe, expect, test } from 'vitest'

import { API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST } from 'constants/error'
import { isDateEqual } from 'libs/date'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestInboxEntry, getTestInboxEntry } from 'tests/api/db'

describe('inbox', () => {
  describe('all', () => {
    test('should return an empty list', () =>
      testApiRoute(async ({ caller }) => {
        const res = await caller.inbox.list()

        expect(res.length).toBe(0)
      }))

    test('should return inbox entries ordered by creation date', () =>
      testApiRoute(async ({ caller }) => {
        const { id: inbox_entry_0_id } = await createTestInboxEntry()
        const { id: inbox_entry_1_id } = await createTestInboxEntry()
        const { id: inbox_entry_2_id } = await createTestInboxEntry()

        const res = await caller.inbox.list()

        expect(res.length).toBe(3)

        expect(res[0]?.id).toBe(inbox_entry_2_id)
        expect(res[1]?.id).toBe(inbox_entry_1_id)
        expect(res[2]?.id).toBe(inbox_entry_0_id)
      }))

    test('should return a list with only the ID, creation date & text', () =>
      testApiRoute(async ({ caller }) => {
        const { createdAt, id, text } = await createTestInboxEntry({
          text: 'inbox entry text',
        })

        const res = await caller.inbox.list()

        expect(res.length).toBe(1)

        assert(res[0])
        expect(Object.keys(res[0]).length).toBe(3)
        expect(res[0].id).toBe(id)
        expect(res[0].text).toBe(text)
        expect(isDateEqual(new Date(res[0].createdAt), createdAt)).toBe(true)
      }))

    test('should return a list with only inbox entries owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { userId: userId1 } = getTestUser('1')

        const { id: inbox_entry_0_id } = await createTestInboxEntry()
        await createTestInboxEntry({ userId: userId1 })
        const { id: inbox_entry_1_id } = await createTestInboxEntry()

        const res = await caller.inbox.list()

        expect(res.length).toBe(2)
        expect(res[0]?.id).toBe(inbox_entry_1_id)
        expect(res[1]?.id).toBe(inbox_entry_0_id)
      }))
  })

  describe('add', () => {
    test('should not add an inbox entry with no text', async () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.inbox.add({ text: '' })).rejects.toThrow()
      }))

    test('should add an inbox entry', async () =>
      testApiRoute(async ({ caller }) => {
        const text = faker.random.words()

        const res = await caller.inbox.add({ text })

        const testInboxEntry = await getTestInboxEntry(res.id)

        expect(testInboxEntry).toBeDefined()
        expect(testInboxEntry?.text).toBe(text)
        expect(testInboxEntry?.createdAt).toBeDefined()
      }))
  })

  describe('delete', () => {
    test('should remove an empty folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestInboxEntry()

        await caller.inbox.delete({ id })

        const testInboxEntry = await getTestInboxEntry(id)

        expect(testInboxEntry).toBeNull()
      }))

    test('should not remove an inbox entry not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestInboxEntry({ userId: getTestUser('1').userId })

        await expect(() => caller.inbox.delete({ id })).rejects.toThrow(API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST)

        const testInboxEntry = await getTestInboxEntry(id)

        expect(testInboxEntry).toBeDefined()
      }))

    test('should not remove a nonexisting inbox entry', async () =>
      testApiRoute(async ({ caller }) => {
        const id = cuid()

        await expect(() => caller.inbox.delete({ id })).rejects.toThrow(API_ERROR_INBOX_ENTRY_DOES_NOT_EXIST)

        const testInboxEntry = await getTestInboxEntry(id)

        expect(testInboxEntry).toBeNull()
      }))
  })
})
