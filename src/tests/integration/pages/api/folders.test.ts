import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { createTestFolder, createTestNote, getTestFolder, getTestFolders, getTestNotes } from 'tests/integration/db'
import { HttpMethod } from 'libs/http'
import postHandler from 'pages/api/folders'
import deleteAndPatchHandler from 'pages/api/folders/[id]'
import { type FolderData } from 'libs/db/folder'
import {
  type ApiErrorResponse,
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_INVALID_TYPE,
} from 'libs/api/routes/errors'

describe('folders', () => {
  describe('POST', () => {
    test('should add a new folder at the root', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
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
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestFolder()

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
      testApiRoute(postHandler, async ({ fetch }) => {
        const name = 'folder'
        const type = FolderType.NOTE
        const parentId = 1

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
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestFolder({ userId: getTestUser('1').userId })

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
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestFolder({ type: FolderType.TODO })

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
      testApiRoute(postHandler, async ({ fetch }) => {
        await createTestFolder({ type: FolderType.TODO })
        const { name, type } = await createTestFolder()

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
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createTestFolder()
        const { name, type } = await createTestFolder({ parentId })

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
      const { id: parentId } = await createTestFolder()
      const { id } = await createTestFolder({ parentId })

      const newName = 'newName'

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id, name } = await createTestFolder()
      const { name: newName } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id: newParentId } = await createTestFolder()
      const { id, name } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id: parentId } = await createTestFolder()
      const { id, name } = await createTestFolder({ parentId })

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id: newParentId } = await createTestFolder()
      await createTestFolder({ name: 'folder', parentId: newParentId })

      const { id, parentId } = await createTestFolder({ name: 'folder' })

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id, parentId } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: 1 }),
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
      const { id: newParentId } = await createTestFolder({ userId: getTestUser('1').userId })
      const { id, parentId } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id: newParentId } = await createTestFolder({ type: FolderType.TODO })
      const { id, parentId } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id: newParentId } = await createTestFolder()
      const { id } = await createTestFolder()

      const newName = 'newName'

      return testApiRoute(
        deleteAndPatchHandler,
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
      const { id, name } = await createTestFolder({ userId: getTestUser('1').userId })

      return testApiRoute(
        deleteAndPatchHandler,
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
        deleteAndPatchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testFolders = await getTestFolders({ name: newName })

          expect(testFolders.length).toBe(0)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })
  })

  describe('DELETE', () => {
    test('should remove an empty folder', async () => {
      const { id } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE })

          const testFolder = await getTestFolder(id)

          expect(testFolder).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should remove a folder containing nested nodes', async () => {
      const { id } = await createTestFolder()

      return testApiRoute(
        deleteAndPatchHandler,
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

          await createTestNote({ folderId: id })
          await createTestNote({ folderId: id })

          await createTestFolder({ parentId: id })
          const { id: folder_0_1_id } = await createTestFolder({ parentId: id })

          await createTestNote({ folderId: folder_0_1_id })

          await createTestFolder({ parentId: folder_0_1_id })
          const { id: folder_0_1_1_id } = await createTestFolder({ parentId: folder_0_1_id })

          await createTestNote({ folderId: folder_0_1_1_id })

          const { id: folder_1_id } = await createTestFolder()

          const { id: folder_1_0_id } = await createTestFolder({ parentId: folder_1_id })

          const { id: note_0_folder_1_0_id } = await createTestNote({ folderId: folder_1_0_id })

          const { id: note_0_id } = await createTestNote()
          const { id: note_1_id } = await createTestNote()

          await fetch({ method: HttpMethod.DELETE })

          const remainingFolderIds = [folder_1_id, folder_1_0_id]
          const testFolders = await getTestFolders()

          expect(testFolders.length).toBe(remainingFolderIds.length)
          expect(testFolders.every((testFolder) => remainingFolderIds.includes(testFolder.id))).toBe(true)

          const remainingNotesIds = [note_0_id, note_1_id, note_0_folder_1_0_id]
          const testNotes = await getTestNotes()

          expect(testNotes.length).toBe(remainingNotesIds.length)
          expect(testNotes.every((testNote) => remainingNotesIds.includes(testNote.id))).toBe(true)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a folder not owned by the current user', async () => {
      const { id } = await createTestFolder({ userId: getTestUser('1').userId })

      return testApiRoute(
        deleteAndPatchHandler,
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
      const id = 1

      return testApiRoute(
        deleteAndPatchHandler,
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
