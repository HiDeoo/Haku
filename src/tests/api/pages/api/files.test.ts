import assert from 'assert'

import { ContentType } from 'constants/contentType'
import { HttpMethod } from 'constants/http'
import { getTestUser, testApiRoute } from 'tests/api'
import indexHandler from 'pages/api/files'
import { createTestNote, createTestTodo } from 'tests/api/db'
import { type FilesData } from 'libs/db/file'

describe('files', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return an empty list', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(0)
        }))

      test('should return a list with only notes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: note_0_id } = await createTestNote({ name: 'note_0' })
          const { id: note_1_id } = await createTestNote({ name: 'note_1' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(2)

          expect(json[0]?.id).toBe(note_0_id)
          expect(json[0]?.type).toBe(ContentType.NOTE)

          expect(json[1]?.id).toBe(note_1_id)
          expect(json[1]?.type).toBe(ContentType.NOTE)
        }))

      test('should return a list with only todos', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: todo_0_id } = await createTestTodo({ name: 'todo_0' })
          const { id: todo_1_id } = await createTestTodo({ name: 'todo_1' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(2)

          expect(json[0]?.id).toBe(todo_0_id)
          expect(json[0]?.type).toBe(ContentType.TODO)

          expect(json[1]?.id).toBe(todo_1_id)
          expect(json[1]?.type).toBe(ContentType.TODO)
        }))

      test('should return a list with notes & todos in alphabetical order', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: Z_todo_id } = await createTestTodo({ name: 'Z_todo' })
          const { id: a_todo_id } = await createTestTodo({ name: 'a_todo' })

          const { id: Z_note_id } = await createTestNote({ name: 'Z_note' })
          const { id: a_note_id } = await createTestNote({ name: 'a_note' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(4)

          expect(json[0]?.id).toBe(a_note_id)
          expect(json[0]?.type).toBe(ContentType.NOTE)

          expect(json[1]?.id).toBe(a_todo_id)
          expect(json[1]?.type).toBe(ContentType.TODO)

          expect(json[2]?.id).toBe(Z_note_id)
          expect(json[2]?.type).toBe(ContentType.NOTE)

          expect(json[3]?.id).toBe(Z_todo_id)
          expect(json[3]?.type).toBe(ContentType.TODO)
        }))

      test('should return a list with only notes & todos owned by the current user', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { userId: userId1 } = getTestUser('1')

          const { id: note_0_id } = await createTestNote({ name: 'note_0' })
          await createTestNote({ name: 'note_1', userId: userId1 })

          const { id: todo_0_id } = await createTestTodo({ name: 'todo_0' })
          await createTestTodo({ name: 'todo_1', userId: userId1 })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(2)
          expect(json[0]?.id).toBe(note_0_id)
          expect(json[1]?.id).toBe(todo_0_id)
        }))

      test('should return a list with only the ID, name, slug & type', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id, name, slug } = await createTestNote({ name: 'note_0' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<FilesData>()

          expect(json.length).toBe(1)

          assert(json[0])
          expect(Object.keys(json[0]).length).toBe(4)
          expect(json[0]?.id).toBe(id)
          expect(json[0]?.name).toBe(name)
          expect(json[0]?.slug).toBe(slug)
          expect(json[0]?.type).toBe(ContentType.NOTE)
        }))
    })
  })
})
