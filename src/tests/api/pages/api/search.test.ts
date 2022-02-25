import { HttpMethod } from 'constants/http'
import { type FilesData } from 'libs/db/file'
import indexHandler from 'pages/api/search'
import { testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo } from 'tests/api/db'

describe('search', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return a note with a name matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestNote({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return a note with a text matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestNote({ data: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return a todo with a name matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return items matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
            await createTestNote({})
            const { id: note_2_id } = await createTestNote({ data: 'amazing text' })

            await createTestTodo({})
            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(note_2_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize items with a match in the name', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name' })

            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize items with multiples matches', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

            const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name', data: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should order alphabetically item with the same rank', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing z' })

            const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING A' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(todo_0_id)
            expect(json[1]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in the item content', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing 0' })

            const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING 1' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing' })

            const { id: todo_0_id } = await createTestTodo({ name: 'Amazing' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
          },
          { dynamicRouteParams: { q: 'AMAZING' } }
        ))

      test('should search multiple unquoted words', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'amazing super name' })
            await createTestNote({ name: 'amazing' })
            await createTestNote({ name: 'name' })
            const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

            const { id: todo_0_id } = await createTestTodo({ name: 'amazing super name' })
            await createTestTodo({ name: 'amazing' })
            await createTestTodo({ name: 'name' })
            const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(4)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
            expect(json[2]?.id).toBe(note_0_id)
            expect(json[3]?.id).toBe(todo_0_id)
          },
          { dynamicRouteParams: { q: 'amazing name' } }
        ))

      test('should search multiple quoted words', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            await createTestNote({ name: 'amazing super name' })
            await createTestNote({ name: 'amazing' })
            await createTestNote({ name: 'name' })
            const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

            await createTestTodo({ name: 'amazing super name' })
            await createTestTodo({ name: 'amazing' })
            await createTestTodo({ name: 'name' })
            const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
          },
          { dynamicRouteParams: { q: '"amazing name"' } }
        ))

      test('should search multiple words using the OR operator', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'amazing super name' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing' })
            const { id: note_2_id } = await createTestNote({ name: 'name' })
            const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

            const { id: todo_0_id } = await createTestTodo({ name: 'amazing super name' })
            const { id: todo_1_id } = await createTestTodo({ name: 'amazing' })
            const { id: todo_2_id } = await createTestTodo({ name: 'name' })
            const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(8)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
            expect(json[2]?.id).toBe(todo_0_id)
            expect(json[3]?.id).toBe(note_0_id)
            expect(json[4]?.id).toBe(note_1_id)
            expect(json[5]?.id).toBe(todo_1_id)
            expect(json[6]?.id).toBe(todo_2_id)
            expect(json[7]?.id).toBe(note_2_id)
          },
          { dynamicRouteParams: { q: 'amazing OR name' } }
        ))

      test('should search multiple words using the NOT operator', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            await createTestNote({ name: 'amazing super name' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing' })
            await createTestNote({ name: 'name' })
            await createTestNote({ name: 'amazing name' })

            await createTestTodo({ name: 'amazing super name' })
            const { id: todo_1_id } = await createTestTodo({ name: 'amazing' })
            await createTestTodo({ name: 'name' })
            await createTestTodo({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(todo_1_id)
          },
          { dynamicRouteParams: { q: 'amazing -name' } }
        ))
    })
  })
})
