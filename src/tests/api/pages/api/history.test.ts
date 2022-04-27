import assert from 'assert'

import { HISTORY_RESULT_LIMIT_PER_TYPE } from 'constants/history'
import { HttpMethod } from 'constants/http'
import { isNonEmptyArray } from 'libs/array'
import { type HistoryData } from 'libs/db/history'
import indexHandler from 'pages/api/history'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'

describe('history', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return an empty history', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          expect(!isNonEmptyArray(json.notes)).toBe(true)

          expect(!isNonEmptyArray(json.todos)).toBe(true)
        }))

      test('should return an history without notes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: todo_0_id } = await createTestTodo()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          expect(!isNonEmptyArray(json.notes)).toBe(true)

          assert(isNonEmptyArray(json.todos))

          expect(json.todos[0].id).toBe(todo_0_id)
        }))

      test('should return an history without todos', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: note_0_id } = await createTestNote()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          assert(isNonEmptyArray(json.notes))

          expect(json.notes[0].id).toBe(note_0_id)

          expect(!isNonEmptyArray(json.todos)).toBe(true)
        }))

      test('should return only note & todo metadatas', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: note_0_id, name: note_0_name, slug: note_0_slug } = await createTestNote()
          const { id: todo_0_id, name: todo_0_name, slug: todo_0_slug } = await createTestTodo()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          assert(isNonEmptyArray(json.notes))

          expect(Object.keys(json.notes[0]).length).toBe(3)
          expect(json.notes[0].id).toBe(note_0_id)
          expect(json.notes[0].name).toBe(note_0_name)
          expect(json.notes[0].slug).toBe(note_0_slug)

          assert(isNonEmptyArray(json.todos))

          expect(Object.keys(json.todos[0]).length).toBe(3)
          expect(json.todos[0].id).toBe(todo_0_id)
          expect(json.todos[0].name).toBe(todo_0_name)
          expect(json.todos[0].slug).toBe(todo_0_slug)
        }))

      test('should return results ordered by descending modification date', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: note_0_id } = await createTestNote()
          const { id: note_1_id } = await createTestNote()
          const { id: note_2_id } = await createTestNote()
          const { id: note_3_id } = await createTestNote()

          const { id: todo_0_id } = await createTestTodo()
          const { id: todo_1_id } = await createTestTodo()
          const { id: todo_2_id } = await createTestTodo()
          const { id: todo_3_id } = await createTestTodo()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          expect(json.notes[0]?.id).toBe(note_3_id)
          expect(json.notes[1]?.id).toBe(note_2_id)
          expect(json.notes[2]?.id).toBe(note_1_id)
          expect(json.notes[3]?.id).toBe(note_0_id)

          expect(json.todos[0]?.id).toBe(todo_3_id)
          expect(json.todos[1]?.id).toBe(todo_2_id)
          expect(json.todos[2]?.id).toBe(todo_1_id)
          expect(json.todos[3]?.id).toBe(todo_0_id)
        }))

      test(`should only return at most ${HISTORY_RESULT_LIMIT_PER_TYPE} results per type`, () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          for (let index = 0; index < HISTORY_RESULT_LIMIT_PER_TYPE + 1; index++) {
            await createTestNote()
            await createTestTodo()
          }

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          expect(json.notes.length).toBe(HISTORY_RESULT_LIMIT_PER_TYPE)

          expect(json.todos.length).toBe(HISTORY_RESULT_LIMIT_PER_TYPE)
        }))

      test('should not include notes & todos not owned by the current user', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: note_0_id } = await createTestNote()
          await createTestNote({ userId: getTestUser('1').userId })

          const { id: todo_0_id } = await createTestTodo()
          await createTestTodo({ userId: getTestUser('1').userId })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<HistoryData>()

          expect(json.notes.length).toBe(1)
          expect(json.notes[0]?.id).toBe(note_0_id)

          expect(json.todos.length).toBe(1)
          expect(json.todos[0]?.id).toBe(todo_0_id)
        }))
    })
  })
})
