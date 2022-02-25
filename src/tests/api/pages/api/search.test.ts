import { HttpMethod } from 'constants/http'
import { type FilesData } from 'libs/db/file'
import indexHandler from 'pages/api/search'
import { testApiRoute } from 'tests/api'
import { createTestNote } from 'tests/api/db'

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

      test('should return multiple notes matching the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
            await createTestNote({})
            const { id: note_2_id } = await createTestNote({ data: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(note_2_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize notes with a match in the name', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should prioritize notes with multiples matches', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
            const { id: note_1_id } = await createTestNote({ name: 'amazing name', data: 'amazing text' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should order alphabetically notes with the same rank', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing z' })
            const { id: note_1_id } = await createTestNote({ name: 'AMAZING A' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_1_id)
            expect(json[1]?.id).toBe(note_0_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in notes', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id: note_0_id } = await createTestNote({ name: 'Amazing 0' })
            const { id: note_1_id } = await createTestNote({ name: 'AMAZING 1' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_0_id)
            expect(json[1]?.id).toBe(note_1_id)
          },
          { dynamicRouteParams: { q: 'amazing' } }
        ))

      test('should ignore the letter case in the query', () =>
        testApiRoute(
          indexHandler,
          async ({ fetch }) => {
            const { id } = await createTestNote({ name: 'Amazing' })

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(id)
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

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(2)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(note_0_id)
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

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(note_3_id)
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

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(4)

            expect(json[0]?.id).toBe(note_3_id)
            expect(json[1]?.id).toBe(note_0_id)
            expect(json[2]?.id).toBe(note_1_id)
            expect(json[3]?.id).toBe(note_2_id)
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

            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<FilesData>()

            expect(json.length).toBe(1)

            expect(json[0]?.id).toBe(note_1_id)
          },
          { dynamicRouteParams: { q: 'amazing -name' } }
        ))
    })
  })
})
