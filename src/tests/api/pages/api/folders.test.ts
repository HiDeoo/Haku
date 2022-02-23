import { FolderType } from '@prisma/client'
import cuid from 'cuid'
import StatusCode from 'status-code-enum'

import { HttpMethod } from 'constants/http'
import {
  type ApiErrorResponse,
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_INVALID_TYPE,
} from 'libs/api/routes/errors'
import { type FolderData } from 'libs/db/folder'
import indexHandler from 'pages/api/folders'
import idHandler from 'pages/api/folders/[id]'
import { getTestUser, testApiRoute } from 'tests/api'
import {
  createTestNote,
  createTestNoteFolder,
  createTestTodo,
  createTestTodoFolder,
  getTestFolder,
  getTestFolders,
  getTestNotes,
  getTestTodos,
} from 'tests/api/db'

describe('folders', () => {
  describe('POST', () => {
    test('should add a new folder at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type }),
        })
        const json = await res.json<FolderData>()

        const testFolder = await getTestFolder(json.id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBeNull()
      }))

    test('should add a new folder inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestNoteFolder()

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<FolderData>()

        const testFolder = await getTestFolder(json.id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not add a new folder inside a nonexisting folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'folder'
        const type = FolderType.NOTE
        const parentId = cuid()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST)

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder not owned by the current user', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST)

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder of a different type', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestTodoFolder()

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_INVALID_TYPE)

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new duplicated folder at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        await createTestTodoFolder()
        const { name, type } = await createTestTodoFolder()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const testFolders = await getTestFolders({ name, type })

        expect(testFolders.length).toBe(1)
      }))

    test('should not add a new duplicated folder inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestNoteFolder()
        const { name, type } = await createTestNoteFolder({ parentId })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(1)
      }))
  })

  describe('PATCH', () => {
    test('should rename a folder', async () => {
      const { id: parentId } = await createTestNoteFolder()
      const { id } = await createTestNoteFolder({ parentId })

      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<FolderData>()

          expect(json.name).toBe(newName)

          const testFolder = await getTestFolder(id)

          expect(testFolder?.name).toBe(newName)
          expect(testFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not rename a folder if becoming duplicated', async () => {
      const { id, name } = await createTestNoteFolder()
      const { name: newName } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

          const testFolder = await getTestFolder(id)

          expect(testFolder?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a folder inside another folder', async () => {
      const { id: newParentId } = await createTestNoteFolder()
      const { id, name } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<FolderData>()

          expect(json.parentId).toBe(newParentId)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.name).toBe(name)
          expect(testFolder?.parentId).toBe(newParentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a folder to the root', async () => {
      const { id: parentId } = await createTestNoteFolder()
      const { id, name } = await createTestNoteFolder({ parentId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: null }),
          })
          const json = await res.json<FolderData>()

          expect(json.parentId).toBeNull()

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.name).toBe(name)
          expect(testFolder?.parentId).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder if becoming duplicated', async () => {
      const { id: newParentId } = await createTestNoteFolder()
      await createTestNoteFolder({ name: 'folder', parentId: newParentId })

      const { id, parentId } = await createTestNoteFolder({ name: 'folder' })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside a nonexisting folder', async () => {
      const { id, parentId } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: cuid() }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside an existing folder not owned by the current user', async () => {
      const { id: newParentId } = await createTestNoteFolder({ userId: getTestUser('1').userId })
      const { id, parentId } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside an existing folder of a different type', async () => {
      const { id: newParentId } = await createTestTodoFolder()
      const { id, parentId } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_INVALID_TYPE)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move & rename a folder at the same time', async () => {
      const { id: newParentId } = await createTestNoteFolder()
      const { id } = await createTestNoteFolder()

      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName, parentId: newParentId }),
          })
          const json = await res.json<FolderData>()

          expect(json.name).toBe(newName)
          expect(json.parentId).toBe(newParentId)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.name).toBe(newName)
          expect(testFolder?.parentId).toBe(newParentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a folder not owned by the current user', async () => {
      const { id, name } = await createTestNoteFolder({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: 'newName' }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
          expect(testFolder?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a nonexisting folder', async () => {
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
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testNoteFolders = await getTestFolders({ name: newName, type: FolderType.NOTE })
          const testTodoFolders = await getTestFolders({ name: newName, type: FolderType.TODO })

          expect(testNoteFolders.length).toBe(0)
          expect(testTodoFolders.length).toBe(0)
        },
        { dynamicRouteParams: { id: cuid() } }
      )
    })
  })

  describe('DELETE', () => {
    test('should remove an empty folder', async () => {
      const { id } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE })

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should remove a note folder containing nested nodes', async () => {
      const { id: folder_0_id } = await createTestNoteFolder()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          /**
           * folder_0
           * |__ folder_0_0
           * |__ folder_0_1
           *     |__ folder_0_1_0
           *     |__ folder_0_1_1
           *         |__ note_0_folder_0_1_1
           *     |__ note_0_folder_0_1
           * |__ note_0_folder_0
           * |__ note_1_folder_0
           * folder_1
           * |__ folder_1_0
           *     |__ note_0_folder_1_0
           * note_0
           * note_1
           */

          await createTestNote({ folderId: folder_0_id })
          await createTestNote({ folderId: folder_0_id })

          await createTestNoteFolder({ parentId: folder_0_id })
          const { id: folder_0_1_id } = await createTestNoteFolder({ parentId: folder_0_id })

          await createTestNote({ folderId: folder_0_1_id })

          await createTestNoteFolder({ parentId: folder_0_1_id })
          const { id: folder_0_1_1_id } = await createTestNoteFolder({ parentId: folder_0_1_id })

          await createTestNote({ folderId: folder_0_1_1_id })

          const { id: folder_1_id } = await createTestNoteFolder()

          const { id: folder_1_0_id } = await createTestNoteFolder({ parentId: folder_1_id })

          const { id: note_0_folder_1_0_id } = await createTestNote({ folderId: folder_1_0_id })

          const { id: note_0_id } = await createTestNote()
          const { id: note_1_id } = await createTestNote()

          await fetch({ method: HttpMethod.DELETE })

          const remainingFolderIds = [folder_1_id, folder_1_0_id]
          const testFolders = await getTestFolders({ type: FolderType.NOTE })

          expect(testFolders.length).toBe(remainingFolderIds.length)
          expect(testFolders.every((testFolder) => remainingFolderIds.includes(testFolder.id))).toBe(true)

          const remainingNotesIds = [note_0_id, note_1_id, note_0_folder_1_0_id]
          const testNotes = await getTestNotes()

          expect(testNotes.length).toBe(remainingNotesIds.length)
          expect(testNotes.every((testNote) => remainingNotesIds.includes(testNote.id))).toBe(true)
        },
        { dynamicRouteParams: { id: folder_0_id } }
      )
    })

    test('should remove a todo folder containing nested nodes', async () => {
      const { id: folder_0_id } = await createTestTodoFolder()
      const { id: folder_0_0_id } = await createTestTodoFolder({ parentId: folder_0_id })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          /**
           * folder_0
           * |__ folder_0_0
           *     |__ folder_0_0_0
           *     |__ folder_0_0_1
           *         |__ note_0_folder_0_0_1
           *     |__ todo_0_folder_0_1
           * |__ todo_0_folder_0
           * |__ todo_1_folder_0
           * todo_0
           * todo_1
           */

          const { id: todo_0_folder_0_id } = await createTestTodo({ folderId: folder_0_id })
          const { id: todo_1_folder_0_id } = await createTestTodo({ folderId: folder_0_id })

          await createTestTodo({ folderId: folder_0_0_id })

          await createTestTodoFolder({ parentId: folder_0_0_id })
          const { id: folder_0_0_1_id } = await createTestTodoFolder({ parentId: folder_0_0_id })

          await createTestTodo({ folderId: folder_0_0_1_id })

          const { id: todo_0_id } = await createTestTodo()
          const { id: todo_1_id } = await createTestTodo()

          await fetch({ method: HttpMethod.DELETE })

          const remainingFolderIds = [folder_0_id]
          const testFolders = await getTestFolders({ type: FolderType.TODO })

          expect(testFolders.length).toBe(remainingFolderIds.length)
          expect(testFolders.every((testFolder) => remainingFolderIds.includes(testFolder.id))).toBe(true)

          const remainingNotesIds = [todo_0_id, todo_1_id, todo_0_folder_0_id, todo_1_folder_0_id]
          const testTodos = await getTestTodos()

          expect(testTodos.length).toBe(remainingNotesIds.length)
          expect(testTodos.every((testNote) => remainingNotesIds.includes(testNote.id))).toBe(true)
        },
        { dynamicRouteParams: { id: folder_0_0_id } }
      )
    })

    test('should not remove a folder not owned by the current user', async () => {
      const { id } = await createTestNoteFolder({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeDefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a nonexisting folder', () => {
      const id = cuid()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})
