import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { createTestFolder, createTestNote, getTestNote, getTestNotes } from 'tests/integration/db'
import { HttpMethod } from 'libs/http'
import handler from 'pages/api/notes'
import { type NoteTreeData } from 'libs/db/tree'
import { type NoteData } from 'libs/db/note'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'
import {
  type ApiErrorResponse,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
} from 'libs/api/routes/errors'

describe('notes', () => {
  describe('GET', () => {
    test('should return an empty tree', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(0)
      }))

    test('should return a tree with only root notes and no folder', () =>
      testApiRoute(handler, async ({ fetch }) => {
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
      testApiRoute(handler, async ({ fetch }) => {
        const { name: note_0 } = await createTestNote({ name: 'note_0' })
        const { name: note_1 } = await createTestNote({ name: 'note_1' })
        const { name: note_2 } = await createTestNote({ name: 'note_2' })

        const { name: folder_0 } = await createTestFolder({ name: 'folder_0' })
        const { name: folder_1 } = await createTestFolder({ name: 'folder_1' })
        const { name: folder_2 } = await createTestFolder({ name: 'folder_2' })

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
      testApiRoute(handler, async ({ fetch }) => {
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

        const { id: folder_0_id, name: folder_0 } = await createTestFolder({ name: 'folder_0' })

        const { name: note_0_folder_0 } = await createTestNote({ name: 'note_0_folder_0', folderId: folder_0_id })

        const { name: folder_0_0 } = await createTestFolder({ name: 'folder_0_0', parentId: folder_0_id })
        const { id: folder_0_1_id, name: folder_0_1 } = await createTestFolder({
          name: 'folder_0_1',
          parentId: folder_0_id,
        })

        const { name: note_0_folder_0_1 } = await createTestNote({ name: 'note_0_folder_0_1', folderId: folder_0_1_id })

        const { name: folder_0_1_0 } = await createTestFolder({ name: 'folder_0_1_0', parentId: folder_0_1_id })
        const { id: folder_0_1_1_id, name: folder_0_1_1 } = await createTestFolder({
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

        const { name: folder_1 } = await createTestFolder({ name: 'folder_1' })

        const { id: folder_2_id, name: folder_2 } = await createTestFolder({ name: 'folder_2' })

        const { id: folder_2_0_id, name: folder_2_0 } = await createTestFolder({
          name: 'folder_2_0',
          parentId: folder_2_id,
        })
        const { name: folder_2_1 } = await createTestFolder({ name: 'folder_2_1', parentId: folder_2_id })

        const { id: folder_2_0_0_id, name: folder_2_0_0 } = await createTestFolder({
          name: 'folder_2_0_0',
          parentId: folder_2_0_id,
        })

        const { name: folder_2_0_0_0 } = await createTestFolder({ name: 'folder_2_0_0_0', parentId: folder_2_0_0_id })
        const { id: folder_2_0_0_1_id, name: folder_2_0_0_1 } = await createTestFolder({
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
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createTestFolder({ name: 'folder_0_user_0' })
        const { name: folder_1_user_0 } = await createTestFolder({ name: 'folder_1_user_0' })

        const { id: folder_0_0_user_0_id, name: folder_0_0_user_0 } = await createTestFolder({
          name: 'folder_0_0_user_0',
          parentId: folder_0_user_0_id,
        })
        const { name: folder_0_1_user_0 } = await createTestFolder({
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

        const { id: folder_0_user_1_id } = await createTestFolder({ name: 'folder_0_user_1', userId: userId1 })

        await createTestFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

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
      testApiRoute(handler, async ({ fetch }) => {
        const { name: folder_0_type_note } = await createTestFolder({ name: 'folder_0_type_note' })

        await createTestFolder({ name: 'folder_0_type_todo', type: FolderType.TODO })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(1)

        assertIsTreeFolder(json[0])
        expect(json[0]?.name).toBe(folder_0_type_note)
        expect(json[0]?.children.length).toBe(0)
      }))

    test('should return a tree with nodes ordered alphabetically', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { name: note_z } = await createTestNote({ name: 'note_z' })
        const { name: note_a } = await createTestNote({ name: 'note_a' })

        const { name: folder_z } = await createTestFolder({ name: 'folder_z' })
        const { id: folder_a_id, name: folder_a } = await createTestFolder({ name: 'folder_a' })

        const { name: note_z_folder_a } = await createTestNote({ name: 'note_z_folder_a', folderId: folder_a_id })
        const { name: note_a_folder_a } = await createTestNote({ name: 'note_a_folder_a', folderId: folder_a_id })

        const { name: folder_a_z } = await createTestFolder({ name: 'folder_a_z', parentId: folder_a_id })
        const { name: folder_a_a } = await createTestFolder({ name: 'folder_a_a', parentId: folder_a_id })

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
  })

  describe('POST', () => {
    test('should add a new note at the root', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<NoteData>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBeNull()
      }))

    test('should add a new note inside an existing folder', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createTestFolder({ name: 'parent' })

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<NoteData>()

        const testNote = await getTestNote(json.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBe(folderId)
      }))

    test('should not add a new note inside a nonexisting folder', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const name = 'note'
        const folderId = 1

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
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createTestFolder({ name: 'parent', userId: getTestUser('1').userId })

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
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createTestFolder({ name: 'parent', type: FolderType.TODO })

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
      testApiRoute(handler, async ({ fetch }) => {
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
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createTestFolder({ name: 'parent' })
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
})
