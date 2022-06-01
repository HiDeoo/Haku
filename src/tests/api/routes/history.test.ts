import assert from 'assert'

import { HISTORY_RESULT_LIMIT_PER_TYPE } from 'constants/history'
import { isEmpty, isNotEmpty } from 'libs/array'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'

describe('history', () => {
  test('should return an empty history', () =>
    testApiRoute(async ({ caller }) => {
      const res = await caller.query('history')

      expect(isEmpty(res.notes)).toBe(true)
      expect(isEmpty(res.todos)).toBe(true)
    }))

  test('should return an history without notes', () =>
    testApiRoute(async ({ caller }) => {
      const { id: todo_0_id } = await createTestTodo()

      const res = await caller.query('history')

      expect(isEmpty(res.notes)).toBe(true)

      assert(isNotEmpty(res.todos))

      expect(res.todos[0].id).toBe(todo_0_id)
    }))

  test('should return an history without todos', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote()

      const res = await caller.query('history')

      assert(isNotEmpty(res.notes))

      expect(res.notes[0].id).toBe(note_0_id)

      expect(isEmpty(res.todos)).toBe(true)
    }))

  test('should return only note & todo metadatas', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id, name: note_0_name, slug: note_0_slug } = await createTestNote()
      const { id: todo_0_id, name: todo_0_name, slug: todo_0_slug } = await createTestTodo()

      const res = await caller.query('history')

      assert(isNotEmpty(res.notes))

      expect(Object.keys(res.notes[0]).length).toBe(3)
      expect(res.notes[0].id).toBe(note_0_id)
      expect(res.notes[0].name).toBe(note_0_name)
      expect(res.notes[0].slug).toBe(note_0_slug)

      assert(isNotEmpty(res.todos))

      expect(Object.keys(res.todos[0]).length).toBe(3)
      expect(res.todos[0].id).toBe(todo_0_id)
      expect(res.todos[0].name).toBe(todo_0_name)
      expect(res.todos[0].slug).toBe(todo_0_slug)
    }))

  test('should return results ordered by descending modification date', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote()
      const { id: note_1_id } = await createTestNote()
      const { id: note_2_id } = await createTestNote()
      const { id: note_3_id } = await createTestNote()

      const { id: todo_0_id } = await createTestTodo()
      const { id: todo_1_id } = await createTestTodo()
      const { id: todo_2_id } = await createTestTodo()
      const { id: todo_3_id } = await createTestTodo()

      const res = await caller.query('history')

      expect(res.notes[0]?.id).toBe(note_3_id)
      expect(res.notes[1]?.id).toBe(note_2_id)
      expect(res.notes[2]?.id).toBe(note_1_id)
      expect(res.notes[3]?.id).toBe(note_0_id)

      expect(res.todos[0]?.id).toBe(todo_3_id)
      expect(res.todos[1]?.id).toBe(todo_2_id)
      expect(res.todos[2]?.id).toBe(todo_1_id)
      expect(res.todos[3]?.id).toBe(todo_0_id)
    }))

  test(`should only return at most ${HISTORY_RESULT_LIMIT_PER_TYPE} results per type`, () =>
    testApiRoute(async ({ caller }) => {
      for (let index = 0; index < HISTORY_RESULT_LIMIT_PER_TYPE + 1; index++) {
        await createTestNote()
        await createTestTodo()
      }

      const res = await caller.query('history')

      expect(res.notes.length).toBe(HISTORY_RESULT_LIMIT_PER_TYPE)

      expect(res.todos.length).toBe(HISTORY_RESULT_LIMIT_PER_TYPE)
    }))

  test('should not include notes & todos not owned by the current user', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote()
      await createTestNote({ userId: getTestUser('1').userId })

      const { id: todo_0_id } = await createTestTodo()
      await createTestTodo({ userId: getTestUser('1').userId })

      const res = await caller.query('history')

      expect(res.notes.length).toBe(1)
      expect(res.notes[0]?.id).toBe(note_0_id)

      expect(res.todos.length).toBe(1)
      expect(res.todos[0]?.id).toBe(todo_0_id)
    }))
})
