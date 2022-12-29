import assert from 'assert'

import { describe, expect, test } from 'vitest'

import { ContentType } from 'constants/contentType'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'

describe('file', () => {
  describe('list', () => {
    test('should return an empty list', () =>
      testApiRoute(async ({ caller }) => {
        const res = await caller.file.list()

        expect(res.length).toBe(0)
      }))

    test('should return a list with only notes', () =>
      testApiRoute(async ({ caller }) => {
        const { id: note_0_id } = await createTestNote({ name: 'note_0' })
        const { id: note_1_id } = await createTestNote({ name: 'note_1' })

        const res = await caller.file.list()

        expect(res.length).toBe(2)

        expect(res[0]?.id).toBe(note_0_id)
        expect(res[0]?.type).toBe(ContentType.NOTE)

        expect(res[1]?.id).toBe(note_1_id)
        expect(res[1]?.type).toBe(ContentType.NOTE)
      }))

    test('should return a list with only todos', () =>
      testApiRoute(async ({ caller }) => {
        const { id: todo_0_id } = await createTestTodo({ name: 'todo_0' })
        const { id: todo_1_id } = await createTestTodo({ name: 'todo_1' })

        const res = await caller.file.list()

        expect(res.length).toBe(2)

        expect(res[0]?.id).toBe(todo_0_id)
        expect(res[0]?.type).toBe(ContentType.TODO)

        expect(res[1]?.id).toBe(todo_1_id)
        expect(res[1]?.type).toBe(ContentType.TODO)
      }))

    test('should return a list with notes & todos in alphabetical order', () =>
      testApiRoute(async ({ caller }) => {
        const { id: Z_todo_id } = await createTestTodo({ name: 'Z_todo' })
        const { id: a_todo_id } = await createTestTodo({ name: 'a_todo' })

        const { id: Z_note_id } = await createTestNote({ name: 'Z_note' })
        const { id: a_note_id } = await createTestNote({ name: 'a_note' })

        const res = await caller.file.list()

        expect(res.length).toBe(4)

        expect(res[0]?.id).toBe(a_note_id)
        expect(res[0]?.type).toBe(ContentType.NOTE)

        expect(res[1]?.id).toBe(a_todo_id)
        expect(res[1]?.type).toBe(ContentType.TODO)

        expect(res[2]?.id).toBe(Z_note_id)
        expect(res[2]?.type).toBe(ContentType.NOTE)

        expect(res[3]?.id).toBe(Z_todo_id)
        expect(res[3]?.type).toBe(ContentType.TODO)
      }))

    test('should return a list with only notes & todos owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { userId: userId1 } = getTestUser('1')

        const { id: note_0_id } = await createTestNote({ name: 'note_0' })
        await createTestNote({ name: 'note_1', userId: userId1 })

        const { id: todo_0_id } = await createTestTodo({ name: 'todo_0' })
        await createTestTodo({ name: 'todo_1', userId: userId1 })

        const res = await caller.file.list()

        expect(res.length).toBe(2)
        expect(res[0]?.id).toBe(note_0_id)
        expect(res[1]?.id).toBe(todo_0_id)
      }))

    test('should return a list with only the ID, name, slug & type', () =>
      testApiRoute(async ({ caller }) => {
        const { id, name, slug } = await createTestNote({ name: 'note_0' })

        const res = await caller.file.list()

        expect(res.length).toBe(1)

        assert(res[0])
        expect(Object.keys(res[0]).length).toBe(4)
        expect(res[0].id).toBe(id)
        expect(res[0].name).toBe(name)
        expect(res[0].slug).toBe(slug)
        expect(res[0].type).toBe(ContentType.NOTE)
      }))
  })
})
