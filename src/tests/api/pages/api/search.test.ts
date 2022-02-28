import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import { ApiErrorResponse, API_ERROR_SEARCH_QUERY_TOO_SHORT } from 'libs/api/routes/errors'
import { type FilesData } from 'libs/db/file'
import indexHandler from 'pages/api/search'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestTodo, createTestTodoNode } from 'tests/api/db'

describe('search', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should require a search query of at least 3 characters long', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            await createTestNote()
            await createTestTodo()

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<ApiErrorResponse>()

            expect(res.status).toBe(StatusCode.ClientErrorForbidden)
            expect(json.error).toBe(API_ERROR_SEARCH_QUERY_TOO_SHORT)
          },
          { dynamicRouteParams: { q: 'it' } }
        ))

      test('should return an empty list of result', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            await createTestNote()
            await createTestTodo()

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(0)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

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

      test('should return a todo with a todo node content matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestTodo()
            await createTestTodoNode({ todoId: id, content: 'amazing content' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return a todo with a todo node note matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestTodo()
            await createTestTodoNode({ todoId: id, noteText: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should dedupe todos with a name and todo node content matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestTodo({ name: 'amazing name' })
            await createTestTodoNode({ todoId: id, noteText: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return only items owned by the current user', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { userId: userId1 } = getTestUser('1')

            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })
            await createTestTodo({ name: 'amazing name', userId: userId1 })

            const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
            await createTestNote({ name: 'amazing name', userId: userId1 })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return items matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
            await createTestNote()
            const { id: note_2_id } = await createTestNote({ name: 'note_2', data: 'amazing text' })

            await createTestTodo()
            const { id: todo_1_id } = await createTestTodo({ name: 'amazing name' })

            const { id: todo_2_id } = await createTestTodo({ name: 'todo_2' })
            await createTestTodoNode({ todoId: todo_2_id, content: 'amazing content' })
            const { id: todo_3_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_3_id })
            const { id: todo_4_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_4_id, noteText: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(5)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_1_id)
            expect(json[2]?.id).toBe(note_2_id)
            expect(json[3]?.id).toBe(todo_2_id)
            expect(json[4]?.id).toBe(todo_4_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize items with a match in the name', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'note_0', data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name' })

            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

            const { id: todo_1_id } = await createTestTodo({ name: 'todo_1' })
            await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(4)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(note_0_id)
            expect(json[3]?.id).toBe(todo_1_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize items with multiples matches', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: todo_0_id } = await createTestTodo({ name: 'amazing name 0' })

            const { id: todo_1_id } = await createTestTodo({ name: 'amazing name 1' })
            await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

            const { id: todo_2_id } = await createTestTodo({ name: 'amazing name 2' })
            await createTestTodoNode({ todoId: todo_2_id, content: 'amazing content', noteText: 'amazing text' })

            const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name', data: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(5)

            expect(json[0]?.id).toBe(todo_2_id)
            expect(json[1]?.id).toBe(todo_1_id)
            expect(json[2]?.id).toBe(note_1_id)
            expect(json[3]?.id).toBe(todo_0_id)
            expect(json[4]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should order alphabetically item with the same rank', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing z' })
            const { id: note_1_id } = await createTestNote({ name: 'item z', data: 'amazing text' })

            const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING A' })

            const { id: todo_1_id } = await createTestTodo({ name: 'ITEM A' })
            await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(4)

            expect(json[0]?.id).toBe(todo_0_id)
            expect(json[1]?.id).toBe(note_0_id)
            expect(json[2]?.id).toBe(todo_1_id)
            expect(json[3]?.id).toBe(note_1_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in the item content', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing 0' })

            const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING 1' })

            const { id: todo_1_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_1_id, content: 'amAZIng content' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(todo_1_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing' })

            const { id: todo_0_id } = await createTestTodo({ name: 'Amazing' })

            const { id: todo_1_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_1_id, content: 'Amazing content' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(todo_0_id)
            expect(json[2]?.id).toBe(todo_1_id)
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

            const { id: todo_4_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
            const { id: todo_5_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
            const { id: todo_6_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
            const { id: todo_7_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(6)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
            expect(json[2]?.id).toBe(note_0_id)
            expect(json[3]?.id).toBe(todo_0_id)
            expect(json[4]?.id).toBe(todo_7_id)
            expect(json[5]?.id).toBe(todo_4_id)
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

            const { id: todo_4_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
            const { id: todo_5_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
            const { id: todo_6_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
            const { id: todo_7_id } = await createTestTodo()
            await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
            expect(json[2]?.id).toBe(todo_7_id)
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

            const { id: todo_4_id } = await createTestTodo({ name: 'todo_4' })
            await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
            const { id: todo_5_id } = await createTestTodo({ name: 'todo_5' })
            await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
            const { id: todo_6_id } = await createTestTodo({ name: 'todo_6' })
            await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
            const { id: todo_7_id } = await createTestTodo({ name: 'todo_7' })
            await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(12)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(todo_3_id)
            expect(json[2]?.id).toBe(note_0_id)
            expect(json[3]?.id).toBe(todo_0_id)
            expect(json[4]?.id).toBe(note_1_id)
            expect(json[5]?.id).toBe(todo_1_id)
            expect(json[6]?.id).toBe(note_2_id)
            expect(json[7]?.id).toBe(todo_2_id)
            expect(json[8]?.id).toBe(todo_4_id)
            expect(json[9]?.id).toBe(todo_7_id)
            expect(json[10]?.id).toBe(todo_5_id)
            expect(json[11]?.id).toBe(todo_6_id)
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

            const { id: todo_4_id } = await createTestTodo({ name: 'todo_4' })
            await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
            const { id: todo_5_id } = await createTestTodo({ name: 'todo_5' })
            await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
            const { id: todo_6_id } = await createTestTodo({ name: 'todo_6' })
            await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
            const { id: todo_7_id } = await createTestTodo({ name: 'todo_7' })
            await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(3)

            expect(json[0]?.id).toBe(todo_1_id)
            expect(json[1]?.id).toBe(todo_5_id)
            expect(json[2]?.id).toBe(note_1_id)
          },
          { dynamicRouteParams: { q: 'amazing -name' } }
        ))

      test('should return at most 25 results per page', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            // 2 pages: 25 + 1
            const names = Array.from({ length: 26 }, (_, index) => `amazing name ${'a'.repeat(index + 1)}`)

            for (let index = 0; index < 26; index++) {
              await createTestNote({ name: names[index] })
            }

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(25)

            expect(json[0]?.name).toBe(names[0])
            expect(json[json.length - 1]?.name).toBe(names[24])
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should return paginated results', async () => {
        // 3 pages: 25 + 25 + 2
        const names = Array.from({ length: 52 }, (_, index) => `amazing name ${'a'.repeat(index + 1)}`)

        for (let index = 0; index < names.length; index++) {
          await createTestNote({ name: names[index] })
        }

        await testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(25)

            expect(json[0]?.name).toBe(names[0])
            expect(json[24]?.name).toBe(names[24])
          },
          { dynamicRouteParams: { q: 'amazing' } }
        )

        await testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(25)

            expect(json[0]?.name).toBe(names[25])
            expect(json[24]?.name).toBe(names[49])
          },
          { dynamicRouteParams: { q: 'amazing', page: '1' } }
        )

        return testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.name).toBe(names[50])
            expect(json[1]?.name).toBe(names[51])
          },
          { dynamicRouteParams: { q: 'amazing', page: '2' } }
        )
      })
    })
  })
})
