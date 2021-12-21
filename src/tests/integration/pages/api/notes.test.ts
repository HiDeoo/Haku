import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import handler from 'pages/api/notes'
import { prisma } from 'libs/db'
import { type NoteTreeData } from 'libs/db/tree'
import { type FolderData } from 'libs/db/folder'
import { type NoteData } from 'libs/db/note'
import {
  type ApiErrorResponse,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
} from 'libs/api/routes/errors'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'

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
        const { name: note_0 } = await createDbNote({ name: 'note_0' })
        const { name: note_1 } = await createDbNote({ name: 'note_1' })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(2)

        assertIsTreeItem(json[0])
        expect(json[0]?.name).toEqual(note_0)

        assertIsTreeItem(json[1])
        expect(json[1]?.name).toEqual(note_1)
      }))

    test('should return a tree with only root nodes', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { name: note_0 } = await createDbNote({ name: 'note_0' })
        const { name: note_1 } = await createDbNote({ name: 'note_1' })
        const { name: note_2 } = await createDbNote({ name: 'note_2' })

        const { name: folder_0 } = await createDbFolder({ name: 'folder_0' })
        const { name: folder_1 } = await createDbFolder({ name: 'folder_1' })
        const { name: folder_2 } = await createDbFolder({ name: 'folder_2' })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(6)

        assertIsTreeFolder(json[0])
        expect(json[0]?.name).toEqual(folder_0)
        expect(json[0]?.children.length).toBe(0)
        expect(json[0]?.items.length).toBe(0)

        assertIsTreeFolder(json[1])
        expect(json[1]?.name).toEqual(folder_1)
        expect(json[1]?.children.length).toBe(0)
        expect(json[1]?.items.length).toBe(0)

        assertIsTreeFolder(json[2])
        expect(json[2]?.name).toEqual(folder_2)
        expect(json[2]?.children.length).toBe(0)
        expect(json[2]?.items.length).toBe(0)

        assertIsTreeItem(json[3])
        expect(json[3]?.name).toEqual(note_0)

        assertIsTreeItem(json[4])
        expect(json[4]?.name).toEqual(note_1)

        assertIsTreeItem(json[5])
        expect(json[5]?.name).toEqual(note_2)
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

        const { name: note_0 } = await createDbNote({ name: 'note_0' })
        const { name: note_1 } = await createDbNote({ name: 'note_1' })

        const { id: folder_0_id, name: folder_0 } = await createDbFolder({ name: 'folder_0' })

        const { name: note_0_folder_0 } = await createDbNote({ name: 'note_0_folder_0', folderId: folder_0_id })

        const { name: folder_0_0 } = await createDbFolder({ name: 'folder_0_0', parentId: folder_0_id })
        const { id: folder_0_1_id, name: folder_0_1 } = await createDbFolder({
          name: 'folder_0_1',
          parentId: folder_0_id,
        })

        const { name: note_0_folder_0_1 } = await createDbNote({ name: 'note_0_folder_0_1', folderId: folder_0_1_id })

        const { name: folder_0_1_0 } = await createDbFolder({ name: 'folder_0_1_0', parentId: folder_0_1_id })
        const { id: folder_0_1_1_id, name: folder_0_1_1 } = await createDbFolder({
          name: 'folder_0_1_1',
          parentId: folder_0_1_id,
        })

        const { name: note_0_folder_0_1_1 } = await createDbNote({
          name: 'note_0_folder_0_1_1',
          folderId: folder_0_1_1_id,
        })
        const { name: note_1_folder_0_1_1 } = await createDbNote({
          name: 'note_1_folder_0_1_1',
          folderId: folder_0_1_1_id,
        })

        const { name: folder_1 } = await createDbFolder({ name: 'folder_1' })

        const { id: folder_2_id, name: folder_2 } = await createDbFolder({ name: 'folder_2' })

        const { id: folder_2_0_id, name: folder_2_0 } = await createDbFolder({
          name: 'folder_2_0',
          parentId: folder_2_id,
        })
        const { name: folder_2_1 } = await createDbFolder({ name: 'folder_2_1', parentId: folder_2_id })

        const { id: folder_2_0_0_id, name: folder_2_0_0 } = await createDbFolder({
          name: 'folder_2_0_0',
          parentId: folder_2_0_id,
        })

        const { name: folder_2_0_0_0 } = await createDbFolder({ name: 'folder_2_0_0_0', parentId: folder_2_0_0_id })
        const { id: folder_2_0_0_1_id, name: folder_2_0_0_1 } = await createDbFolder({
          name: 'folder_2_0_0_1',
          parentId: folder_2_0_0_id,
        })

        const { name: note_0_folder_2_0_0_1 } = await createDbNote({
          name: 'note_0_folder_2_0_0_1',
          folderId: folder_2_0_0_1_id,
        })
        const { name: note_1_folder_2_0_0_1 } = await createDbNote({
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
        const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createDbFolder({ name: 'folder_0_user_0' })
        const { name: folder_1_user_0 } = await createDbFolder({ name: 'folder_1_user_0' })

        const { id: folder_0_0_user_0_id, name: folder_0_0_user_0 } = await createDbFolder({
          name: 'folder_0_0_user_0',
          parentId: folder_0_user_0_id,
        })
        const { name: folder_0_1_user_0 } = await createDbFolder({
          name: 'folder_0_1_user_0',
          parentId: folder_0_user_0_id,
        })

        const { name: note_0_folder_0_user_0 } = await createDbNote({
          name: 'note_0_folder_0_user_0',
          folderId: folder_0_user_0_id,
        })
        const { name: note_0_folder_0_0_user_0 } = await createDbNote({
          name: 'note_0_folder_0_0_user_0',
          folderId: folder_0_0_user_0_id,
        })

        const { userId: userId1 } = getTestUser('1')

        const { id: folder_0_user_1_id } = await createDbFolder({ name: 'folder_0_user_1', userId: userId1 })

        await createDbFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

        await createDbNote({ name: 'note_0_folder_0_user_1', folderId: folder_0_user_1_id, userId: userId1 })
        await createDbNote({ name: 'note_0_folder_0_0_user_1', folderId: folder_0_0_user_0_id, userId: userId1 })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(2)

        assertIsTreeFolder(json[0])
        expect(json[0]?.name).toEqual(folder_0_user_0)
        expect(json[0]?.children.length).toBe(2)
        expect(json[0]?.items.length).toBe(1)

        expect(json[0]?.items[0]?.name).toBe(note_0_folder_0_user_0)

        expect(json[0]?.children[0]?.name).toEqual(folder_0_0_user_0)
        expect(json[0]?.children[0]?.children.length).toBe(0)
        expect(json[0]?.children[0]?.items.length).toBe(1)

        expect(json[0]?.children[0]?.items[0]?.name).toBe(note_0_folder_0_0_user_0)

        expect(json[0]?.children[1]?.name).toEqual(folder_0_1_user_0)
        expect(json[0]?.children[1]?.children.length).toBe(0)
        expect(json[0]?.children[1]?.items.length).toBe(0)

        assertIsTreeFolder(json[1])
        expect(json[1]?.name).toEqual(folder_1_user_0)
        expect(json[1]?.children.length).toBe(0)
        expect(json[1]?.items.length).toBe(0)
      }))

    test('should return only the content of the proper type', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { name: folder_0_type_note } = await createDbFolder({ name: 'folder_0_type_note' })

        await createDbFolder({ name: 'folder_0_type_todo', type: FolderType.TODO })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toBe(1)

        assertIsTreeFolder(json[0])
        expect(json[0]?.name).toEqual(folder_0_type_note)
        expect(json[0]?.children.length).toBe(0)
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

        const dbNote = await getDbNote(json.id)

        expect(dbNote).toBeDefined()
        expect(dbNote?.name).toBe(name)
        expect(dbNote?.folderId).toBeNull()
      }))

    test('should add a new note inside an existing folder', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createDbFolder({ name: 'parent' })

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<NoteData>()

        const dbNote = await getDbNote(json.id)

        expect(dbNote).toBeDefined()
        expect(dbNote?.name).toBe(name)
        expect(dbNote?.folderId).toBe(folderId)
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

        const dbNotes = await getDbNotes({ name, folderId })

        expect(dbNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder not owned by the current user', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createDbFolder({ name: 'parent', userId: getTestUser('1').userId })

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const dbNotes = await getDbNotes({ name, folderId })

        expect(dbNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder of a different type', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createDbFolder({ name: 'parent', type: FolderType.TODO })

        const name = 'note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_INVALID_TYPE)

        const dbNotes = await getDbNotes({ name, folderId })

        expect(dbNotes.length).toBe(0)
      }))

    test('should not add a new duplicated note at the root', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { name } = await createDbNote()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

        const dbNotes = await getDbNotes({ name })

        expect(dbNotes.length).toBe(1)
      }))

    test('should not add a new duplicated note inside an existing folder', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { id: folderId } = await createDbFolder({ name: 'parent' })
        const { name } = await createDbNote({ folderId })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_NOTE_ALREADY_EXISTS)

        const dbNotes = await getDbNotes({ name, folderId })

        expect(dbNotes.length).toBe(1)
      }))
  })
})

function createDbFolder(options: DbFolderOptions) {
  return prisma.folder.create({
    data: {
      name: options.name,
      parentId: options?.parentId,
      type: options?.type ?? FolderType.NOTE,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

function getDbNotes(options: DbNoteOptions) {
  return prisma.note.findMany({
    where: {
      ...options,
      userId: options.userId ?? getTestUser().userId,
    },
  })
}

function createDbNote(options?: DbNoteOptions) {
  return prisma.note.create({
    data: {
      name: options?.name ?? 'note',
      folderId: options?.folderId,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

function getDbNote(id: NoteData['id']) {
  return prisma.note.findUnique({ where: { id } })
}

interface DbFolderOptions {
  name: FolderData['name']
  parentId?: FolderData['parentId']
  type?: FolderType
  userId?: UserId
}

interface DbNoteOptions {
  name?: NoteData['name']
  folderId?: NoteData['folderId']
  userId?: UserId
}