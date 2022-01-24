import StatusCode from 'status-code-enum'
import slug from 'url-slug'

import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestNoteFolder, createTestTodoFolder, getTestNote, getTestNotes } from 'tests/api/db'
import { HttpMethod } from 'libs/http'
import indexHandler from 'pages/api/notes'
import idHandler from 'pages/api/notes/[id]'
import { type NoteTreeData } from 'libs/db/tree'
import { type NoteData, type NoteMetadata } from 'libs/db/note'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'
import {
  type ApiErrorResponse,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
  API_ERROR_NOTE_HTML_OR_TEXT_MISSING,
} from 'libs/api/routes/errors'
import { hasKey } from 'libs/object'

describe('notes', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return an empty tree', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(0)
        }))

      test('should return a tree with only root notes and no folder', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: note_0 } = await createTestNote({ name: 'note_0' })
          const { name: note_1 } = await createTestNote({ name: 'note_1' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(2)

          assertIsTreeItem(json[0])
          expect(json[0]?.name).toBe(note_0)

          assertIsTreeItem(json[1])
          expect(json[1]?.name).toBe(note_1)
        }))

      test('should return a tree with only root nodes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: note_0 } = await createTestNote({ name: 'note_0' })
          const { name: note_1 } = await createTestNote({ name: 'note_1' })
          const { name: note_2 } = await createTestNote({ name: 'note_2' })

          const { name: folder_0 } = await createTestNoteFolder({ name: 'folder_0' })
          const { name: folder_1 } = await createTestNoteFolder({ name: 'folder_1' })
          const { name: folder_2 } = await createTestNoteFolder({ name: 'folder_2' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(6)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0)
          expect(json[0]?.children.length).toBe(0)
          expect(json[0]?.items.length).toBe(0)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1)
          expect(json[1]?.children.length).toBe(0)
          expect(json[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[2])
          expect(json[2]?.name).toBe(folder_2)
          expect(json[2]?.children.length).toBe(0)
          expect(json[2]?.items.length).toBe(0)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(note_0)

          assertIsTreeItem(json[4])
          expect(json[4]?.name).toBe(note_1)

          assertIsTreeItem(json[5])
          expect(json[5]?.name).toBe(note_2)
        }))

      test('should return a tree with nested nodes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          /**
           * folder_0
           * |__ folder_0_0
           * |__ folder_0_1
           *     |__ folder_0_1_0
           *     |__ folder_0_1_1
           *         |__ note_0_folder_0_1_1
           *         |__ note_1_folder_0_1_1
           *     |__ note_0_folder_0_1
           * |__ note_0_folder_0
           * folder_1
           * folder_2
           * |__ folder_2_0
           *     |__ folder_2_0_0
           *         |__ folder_2_0_0_0
           *         |__ folder_2_0_0_1
           *             |__ note_0_folder_2_0_0_1
           *             |__ note_1_folder_2_0_0_1
           * |__ folder_2_1
           * note_0
           * note_1
           */

          const { name: note_0 } = await createTestNote({ name: 'note_0' })
          const { name: note_1 } = await createTestNote({ name: 'note_1' })

          const { id: folder_0_id, name: folder_0 } = await createTestNoteFolder({ name: 'folder_0' })

          const { name: note_0_folder_0 } = await createTestNote({ name: 'note_0_folder_0', folderId: folder_0_id })

          const { name: folder_0_0 } = await createTestNoteFolder({ name: 'folder_0_0', parentId: folder_0_id })
          const { id: folder_0_1_id, name: folder_0_1 } = await createTestNoteFolder({
            name: 'folder_0_1',
            parentId: folder_0_id,
          })

          const { name: note_0_folder_0_1 } = await createTestNote({
            name: 'note_0_folder_0_1',
            folderId: folder_0_1_id,
          })

          const { name: folder_0_1_0 } = await createTestNoteFolder({ name: 'folder_0_1_0', parentId: folder_0_1_id })
          const { id: folder_0_1_1_id, name: folder_0_1_1 } = await createTestNoteFolder({
            name: 'folder_0_1_1',
            parentId: folder_0_1_id,
          })

          const { name: note_0_folder_0_1_1 } = await createTestNote({
            name: 'note_0_folder_0_1_1',
            folderId: folder_0_1_1_id,
          })
          const { name: note_1_folder_0_1_1 } = await createTestNote({
            name: 'note_1_folder_0_1_1',
            folderId: folder_0_1_1_id,
          })

          const { name: folder_1 } = await createTestNoteFolder({ name: 'folder_1' })

          const { id: folder_2_id, name: folder_2 } = await createTestNoteFolder({ name: 'folder_2' })

          const { id: folder_2_0_id, name: folder_2_0 } = await createTestNoteFolder({
            name: 'folder_2_0',
            parentId: folder_2_id,
          })
          const { name: folder_2_1 } = await createTestNoteFolder({ name: 'folder_2_1', parentId: folder_2_id })

          const { id: folder_2_0_0_id, name: folder_2_0_0 } = await createTestNoteFolder({
            name: 'folder_2_0_0',
            parentId: folder_2_0_id,
          })

          const { name: folder_2_0_0_0 } = await createTestNoteFolder({
            name: 'folder_2_0_0_0',
            parentId: folder_2_0_0_id,
          })
          const { id: folder_2_0_0_1_id, name: folder_2_0_0_1 } = await createTestNoteFolder({
            name: 'folder_2_0_0_1',
            parentId: folder_2_0_0_id,
          })

          const { name: note_0_folder_2_0_0_1 } = await createTestNote({
            name: 'note_0_folder_2_0_0_1',
            folderId: folder_2_0_0_1_id,
          })
          const { name: note_1_folder_2_0_0_1 } = await createTestNote({
            name: 'note_1_folder_2_0_0_1',
            folderId: folder_2_0_0_1_id,
          })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(5)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0)
          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.items.length).toBe(1)

          expect(json[0]?.children[0]?.name).toBe(folder_0_0)
          expect(json[0]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.items.length).toBe(0)

          expect(json[0]?.children[1]?.name).toBe(folder_0_1)
          expect(json[0]?.children[1]?.children.length).toBe(2)
          expect(json[0]?.children[1]?.items.length).toBe(1)

          expect(json[0]?.items[0]?.name).toBe(note_0_folder_0)

          expect(json[0]?.children[1]?.items[0]?.name).toBe(note_0_folder_0_1)

          expect(json[0]?.children[1]?.children[0]?.name).toBe(folder_0_1_0)
          expect(json[0]?.children[1]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[1]?.children[0]?.items.length).toBe(0)

          expect(json[0]?.children[1]?.children[1]?.name).toBe(folder_0_1_1)
          expect(json[0]?.children[1]?.children[1]?.children.length).toBe(0)
          expect(json[0]?.children[1]?.children[1]?.items.length).toBe(2)

          expect(json[0]?.children[1]?.children[1]?.items[0]?.name).toBe(note_0_folder_0_1_1)

          expect(json[0]?.children[1]?.children[1]?.items[1]?.name).toBe(note_1_folder_0_1_1)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1)
          expect(json[1]?.children.length).toBe(0)
          expect(json[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[2])
          expect(json[2]?.name).toBe(folder_2)
          expect(json[2]?.children.length).toBe(2)
          expect(json[2]?.items.length).toBe(0)

          expect(json[2]?.children[0]?.name).toBe(folder_2_0)
          expect(json[2]?.children[0]?.children.length).toBe(1)
          expect(json[2]?.children[0]?.items.length).toBe(0)

          expect(json[2]?.children[0]?.children[0]?.name).toBe(folder_2_0_0)
          expect(json[2]?.children[0]?.children[0]?.children.length).toBe(2)
          expect(json[2]?.children[0]?.children[0]?.items.length).toBe(0)

          expect(json[2]?.children[0]?.children[0]?.children[0]?.name).toBe(folder_2_0_0_0)
          expect(json[2]?.children[0]?.children[0]?.children[0]?.children.length).toBe(0)
          expect(json[2]?.children[0]?.children[0]?.children[0]?.items.length).toBe(0)

          expect(json[2]?.children[0]?.children[0]?.children[1]?.name).toBe(folder_2_0_0_1)
          expect(json[2]?.children[0]?.children[0]?.children[1]?.children.length).toBe(0)
          expect(json[2]?.children[0]?.children[0]?.children[1]?.items.length).toBe(2)

          expect(json[2]?.children[0]?.children[0]?.children[1]?.items[0]?.name).toBe(note_0_folder_2_0_0_1)

          expect(json[2]?.children[0]?.children[0]?.children[1]?.items[1]?.name).toBe(note_1_folder_2_0_0_1)

          expect(json[2]?.children[1]?.name).toBe(folder_2_1)
          expect(json[2]?.children[1]?.children.length).toBe(0)
          expect(json[2]?.children[1]?.items.length).toBe(0)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(note_0)

          assertIsTreeItem(json[4])
          expect(json[4]?.name).toBe(note_1)
        }))

      test('should return only nodes owned by the current user', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createTestNoteFolder({
            name: 'folder_0_user_0',
          })
          const { name: folder_1_user_0 } = await createTestNoteFolder({ name: 'folder_1_user_0' })

          const { id: folder_0_0_user_0_id, name: folder_0_0_user_0 } = await createTestNoteFolder({
            name: 'folder_0_0_user_0',
            parentId: folder_0_user_0_id,
          })
          const { name: folder_0_1_user_0 } = await createTestNoteFolder({
            name: 'folder_0_1_user_0',
            parentId: folder_0_user_0_id,
          })

          const { name: note_0_folder_0_user_0 } = await createTestNote({
            name: 'note_0_folder_0_user_0',
            folderId: folder_0_user_0_id,
          })
          const { name: note_0_folder_0_0_user_0 } = await createTestNote({
            name: 'note_0_folder_0_0_user_0',
            folderId: folder_0_0_user_0_id,
          })

          const { userId: userId1 } = getTestUser('1')

          const { id: folder_0_user_1_id } = await createTestNoteFolder({ name: 'folder_0_user_1', userId: userId1 })

          await createTestNoteFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

          await createTestNote({ name: 'note_0_folder_0_user_1', folderId: folder_0_user_1_id, userId: userId1 })
          await createTestNote({ name: 'note_0_folder_0_0_user_1', folderId: folder_0_0_user_0_id, userId: userId1 })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(2)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0_user_0)
          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.items.length).toBe(1)

          expect(json[0]?.items[0]?.name).toBe(note_0_folder_0_user_0)

          expect(json[0]?.children[0]?.name).toBe(folder_0_0_user_0)
          expect(json[0]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.items.length).toBe(1)

          expect(json[0]?.children[0]?.items[0]?.name).toBe(note_0_folder_0_0_user_0)

          expect(json[0]?.children[1]?.name).toBe(folder_0_1_user_0)
          expect(json[0]?.children[1]?.children.length).toBe(0)
          expect(json[0]?.children[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1_user_0)
          expect(json[1]?.children.length).toBe(0)
          expect(json[1]?.items.length).toBe(0)
        }))

      test('should return only the content of the proper type', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: folder_0_type_note } = await createTestNoteFolder({ name: 'folder_0_type_note' })

          await createTestTodoFolder({ name: 'folder_0_type_todo' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(1)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0_type_note)
          expect(json[0]?.children.length).toBe(0)
        }))

      test('should return a tree with nodes ordered alphabetically ignoring letter case', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: note_z } = await createTestNote({ name: 'note_Z' })
          const { name: note_a } = await createTestNote({ name: 'note_a' })

          const { name: folder_z } = await createTestNoteFolder({ name: 'folder_Z' })
          const { id: folder_a_id, name: folder_a } = await createTestNoteFolder({ name: 'folder_a' })

          const { name: note_z_folder_a } = await createTestNote({ name: 'note_z_folder_a', folderId: folder_a_id })
          const { name: note_a_folder_a } = await createTestNote({ name: 'note_a_folder_a', folderId: folder_a_id })

          const { name: folder_a_z } = await createTestNoteFolder({ name: 'folder_a_z', parentId: folder_a_id })
          const { name: folder_a_a } = await createTestNoteFolder({ name: 'folder_a_a', parentId: folder_a_id })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          expect(json.length).toBe(4)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_a)

          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.children[0]?.name).toBe(folder_a_a)
          expect(json[0]?.children[1]?.name).toBe(folder_a_z)

          expect(json[0]?.items.length).toBe(2)
          expect(json[0]?.items[0]?.name).toBe(note_a_folder_a)
          expect(json[0]?.items[1]?.name).toBe(note_z_folder_a)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_z)

          assertIsTreeItem(json[2])
          expect(json[2]?.name).toBe(note_a)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(note_z)
        }))

      test('should return a tree with only metadata and no content', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          await createTestNote()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<NoteTreeData>()

          assertIsTreeItem(json[0])
          expect(hasKey(json[0], 'html')).toBe(false)
        }))
    })

    describe('id', () => {
      test('should return a note', async () => {
        const { html, folderId, id, name, slug } = await createTestNote()

        return testApiRoute(
          idHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<NoteData>()

            expect(json.name).toBe(name)
            expect(json.slug).toBe(slug)
            expect(json.folderId).toBe(folderId)
            expect(json.html).toBe(html)
            expect(hasKey(json, 'text')).toBe(false)
          },
          { dynamicRouteParams: { id } }
        )
      })

      test('should not return a nonexisting note', async () => {
        return testApiRoute(
          idHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<ApiErrorResponse>()

            expect(res.status).toBe(StatusCode.ClientErrorNotFound)
            expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)
          },
          { dynamicRouteParams: { id: 1 } }
        )
      })

      test('should not return a note not owned by the current user', async () => {
        const { id } = await createTestNote({ userId: getTestUser('1').userId })

        return testApiRoute(
          idHandler,
          async ({ fetch }) => {
            const res = await fetch({ method: HttpMethod.GET })
            const json = await res.json<ApiErrorResponse>()

            expect(res.status).toBe(StatusCode.ClientErrorNotFound)
            expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)
          },
          { dynamicRouteParams: { id } }
        )
      })
    })
  })

  describe('POST', () => {
    test('should add a new note at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<NoteMetadata>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBeNull()
        expect(testNote?.slug).toBe(slug(name))
      }))

    test('should add a new note inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestNoteFolder()

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<NoteMetadata>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBe(folderId)
        expect(testNote?.slug).toBe(slug(name))
      }))

    test('should add a new note and attach to it a valid URL slug', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'note Note 1/10 ½ 🤔'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<NoteMetadata>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBeNull()
        expect(testNote?.slug).toBe('note-note-1-10-1-2')
      }))

    test('should add a new note and populate its data', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'Test Note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<NoteMetadata>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.html).toBe(`<h1>${name}</h1><p></p>`)
        expect(testNote?.text).toBe(`${name}\n\n`)
      }))

    test('should not add a new note inside a nonexisting folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'note'
        const folderId = 'nonexistingFolderId'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder not owned by the current user', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder of a different type', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestTodoFolder()

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_INVALID_TYPE)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new duplicated note at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { name } = await createTestNote()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

        const testNotes = await getTestNotes({ name })

        expect(testNotes.length).toBe(1)
      }))

    test('should not add a new duplicated note inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestNoteFolder()
        const { name } = await createTestNote({ folderId })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(1)
      }))
  })

  describe('PATCH', () => {
    test('should rename a note and update its slug', async () => {
      const { id: folderId } = await createTestNoteFolder()
      const { html, id, text } = await createTestNote({ folderId })

      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<NoteMetadata>()

          expect(json.name).toBe(newName)
          expect(hasKey(json, 'html')).toBe(false)

          const testNote = await getTestNote(id)

          expect(testNote?.name).toBe(newName)
          expect(testNote?.slug).toBe(slug(newName))
          expect(testNote?.folderId).toBe(folderId)
          expect(testNote?.html).toBe(html)
          expect(testNote?.text).toBe(text)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not rename a note if becoming duplicated', async () => {
      const { id, name } = await createTestNote()
      const { name: newName } = await createTestNote()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

          const testNote = await getTestNote(id)

          expect(testNote?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a note inside another folder', async () => {
      const { id: folderId } = await createTestNoteFolder()
      const { id: newFolderId } = await createTestNoteFolder()

      const { html, id, slug, text } = await createTestNote({ folderId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<NoteMetadata>()

          expect(json.folderId).toBe(newFolderId)
          expect(hasKey(json, 'html')).toBe(false)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBe(newFolderId)
          expect(testNote?.slug).toBe(slug)
          expect(testNote?.html).toBe(html)
          expect(testNote?.text).toBe(text)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a note to the root', async () => {
      const { id: folderId } = await createTestNoteFolder()

      const { html, id, slug, text } = await createTestNote({ folderId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: null }),
          })
          const json = await res.json<NoteMetadata>()

          expect(json.folderId).toBeNull()
          expect(hasKey(json, 'html')).toBe(false)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBeNull()
          expect(testNote?.slug).toBe(slug)
          expect(testNote?.html).toBe(html)
          expect(testNote?.text).toBe(text)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a note if becoming duplicated', async () => {
      const { id: folderId } = await createTestNoteFolder()
      const { id: newFolderId } = await createTestNoteFolder()

      const { id } = await createTestNote({ folderId, name: 'note' })
      await createTestNote({ folderId: newFolderId, name: 'note' })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a note inside a nonexisting folder', async () => {
      const { id, folderId } = await createTestNote()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: 'nonexistingFolderId' }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a note inside an existing folder not owned by the current user', async () => {
      const { id: newFolderId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

      const { id, folderId } = await createTestNote()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a note inside an existing folder of a different type', async () => {
      const { id: newFolderId } = await createTestTodoFolder()

      const { id, folderId } = await createTestNote()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_INVALID_TYPE)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move, rename & update a note at the same time', async () => {
      const { id: newFolderId } = await createTestNoteFolder()

      const { id } = await createTestNote()

      const newName = 'newName'
      const newHtml = '<p>test</p>'
      const newText = 'test\n\n'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName, folderId: newFolderId, html: newHtml, text: newText }),
          })
          const json = await res.json<NoteData>()

          expect(json.name).toBe(newName)
          expect(json.folderId).toBe(newFolderId)
          expect(json.html).toBe(newHtml)
          expect(hasKey(json, 'text')).toBe(false)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.name).toBe(newName)
          expect(testNote?.folderId).toBe(newFolderId)
          expect(testNote?.slug).toBe(slug(newName))
          expect(testNote?.html).toBe(newHtml)
          expect(testNote?.text).toBe(newText)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a note not owned by the current user', async () => {
      const { id, name } = await createTestNote({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: 'newName' }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)

          const testNote = await getTestNote(id)

          expect(testNote).toBeDefined()
          expect(testNote?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a nonexisting note', async () => {
      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)

          const testNotes = await getTestNotes({ name: newName })

          expect(testNotes.length).toBe(0)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })

    test('should update a note content', async () => {
      const { id, name, folderId } = await createTestNote()

      const newHtml = '<p>test</p>'
      const newText = 'test\n\n'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ html: newHtml, text: newText }),
          })
          const json = await res.json<NoteData>()

          expect(json.name).toBe(name)
          expect(json.folderId).toBe(folderId)
          expect(json.html).toBe(newHtml)
          expect(hasKey(json, 'text')).toBe(false)

          const testNote = await getTestNote(id)

          expect(testNote?.name).toBe(name)
          expect(testNote?.folderId).toBe(folderId)
          expect(testNote?.html).toBe(newHtml)
          expect(testNote?.text).toBe(newText)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a note content if the content html is missing', async () => {
      const { html, id, text } = await createTestNote()

      const newHtml = '<p>test</p>'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ html: newHtml }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_HTML_OR_TEXT_MISSING)

          const testNote = await getTestNote(id)

          expect(testNote?.html).toBe(html)
          expect(testNote?.text).toBe(text)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a note content if the content text is missing', async () => {
      const { html, id, text } = await createTestNote()

      const newText = 'test\n\n'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ text: newText }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_HTML_OR_TEXT_MISSING)

          const testNote = await getTestNote(id)

          expect(testNote?.html).toBe(html)
          expect(testNote?.text).toBe(text)
        },
        { dynamicRouteParams: { id } }
      )
    })
  })

  describe('DELETE', () => {
    test('should remove a note', async () => {
      const { id } = await createTestNote()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE })

          const testNote = await getTestNote(id)

          expect(testNote).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a note not owned by the current user', async () => {
      const { id } = await createTestNote({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)

          const testFolder = await getTestNote(id)

          expect(testFolder).toBeDefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a nonexisting note', () => {
      const id = 'nonexistingNoteId'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_NOTE_DOES_NOT_EXIST)

          const testFolder = await getTestNote(id)

          expect(testFolder).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})
