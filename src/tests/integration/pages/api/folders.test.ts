import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import postHandler from 'pages/api/folders'
import patchHandler from 'pages/api/folders/[id]'
import { type FolderData } from 'libs/db/folder'
import { prisma } from 'libs/db'
import { ApiClientErrorResponse } from 'libs/api/routes'
import {
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS,
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

        const dbFolder = await getDbFolder(json.id)

        expect(dbFolder).toBeDefined()
        expect(dbFolder?.id).toBe(json.id)
        expect(dbFolder?.name).toBe(json.name)
        expect(dbFolder?.parentId).toBeNull()
      }))

    test('should add a new folder inside an existing folder', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createDbFolder({ name: 'parent' })

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<FolderData>()

        const dbFolder = await getDbFolder(json.id)

        expect(dbFolder).toBeDefined()
        expect(dbFolder?.id).toBe(json.id)
        expect(dbFolder?.name).toBe(json.name)
        expect(dbFolder?.parentId).toBe(parentId)
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
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)

        const dbFolders = await getDbFolders({ name, type, parentId })

        expect(dbFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder not owned by the current user', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createDbFolder({ name: 'parent', userId: getTestUser('1').userId })

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)

        const dbFolders = await getDbFolders({ name, type, parentId })

        expect(dbFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder of a different type', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createDbFolder({ name: 'parent', type: FolderType.TODO })

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_INVALID_TYPE)

        const dbFolders = await getDbFolders({ name, type, parentId })

        expect(dbFolders.length).toBe(0)
      }))

    test('should not add a new duplicated folder at the root', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        await createDbFolder({ name: 'parent', type: FolderType.TODO })
        const { name, type } = await createDbFolder()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const dbFolders = await getDbFolders({ name, type })

        expect(dbFolders.length).toBe(1)
      }))

    test('should not add a new duplicated folder inside an existing folder', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { id: parentId } = await createDbFolder({ name: 'parent' })
        const { name, type } = await createDbFolder({ parentId })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const dbFolders = await getDbFolders({ name, type, parentId })

        expect(dbFolders.length).toBe(1)
      }))
  })

  describe('PATCH', () => {
    test('should rename a folder', async () => {
      const { id: parentId } = await createDbFolder({ name: 'parent' })
      const { id } = await createDbFolder({ parentId })

      const newName = 'newName'

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<FolderData>()

          expect(json.name).toBe(newName)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder?.name).toBe(newName)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not rename a folder if becoming duplicated', async () => {
      const { id, name } = await createDbFolder()
      const { name: newName } = await createDbFolder({ name: 'otherName' })

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a folder inside another folder', async () => {
      const { id: newParentId } = await createDbFolder({ name: 'parent' })
      const { id } = await createDbFolder()

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<FolderData>()

          expect(json.parentId).toBe(newParentId)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBe(newParentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a folder to the root', async () => {
      const { id: parentId } = await createDbFolder({ name: 'parent' })
      const { id } = await createDbFolder({ parentId })

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: null }),
          })
          const json = await res.json<FolderData>()

          expect(json.parentId).toBeNull()

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder if becoming duplicated', async () => {
      const { id: newParentId } = await createDbFolder({ name: 'parent' })
      await createDbFolder({ parentId: newParentId })

      const { id, parentId } = await createDbFolder()

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside a nonexisting folder', async () => {
      const { id, parentId } = await createDbFolder()

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: 1 }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside an existing folder not owned by the current user', async () => {
      const { id: newParentId } = await createDbFolder({ name: 'parent', userId: getTestUser('1').userId })
      const { id, parentId } = await createDbFolder()

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a folder inside an existing folder of a different type', async () => {
      const { id: newParentId } = await createDbFolder({ name: 'parent', type: FolderType.TODO })
      const { id, parentId } = await createDbFolder()

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ parentId: newParentId }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_PARENT_INVALID_TYPE)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.parentId).toBe(parentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move & rename a folder at the same time', async () => {
      const { id: newParentId } = await createDbFolder({ name: 'parent' })
      const { id } = await createDbFolder()

      const newName = 'newName'

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName, parentId: newParentId }),
          })
          const json = await res.json<FolderData>()

          expect(json.name).toBe(newName)
          expect(json.parentId).toBe(newParentId)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.name).toBe(newName)
          expect(dbFolder?.parentId).toBe(newParentId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a folder not owned by the current user', async () => {
      const { id, name } = await createDbFolder({ userId: getTestUser('1').userId })

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: 'newName' }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const dbFolder = await getDbFolder(id)

          expect(dbFolder).toBeDefined()
          expect(dbFolder?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a nonexisting folder', async () => {
      const newName = 'newName'

      return testApiRoute(
        patchHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiClientErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const dbFolders = await getDbFolders({ name: newName })

          expect(dbFolders.length).toBe(0)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })
  })
})

function createDbFolder(options?: DbFolderOptions) {
  return prisma.folder.create({
    data: {
      name: options?.name ?? 'folder',
      parentId: options?.parentId,
      type: options?.type ?? FolderType.NOTE,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

function getDbFolders(options: DbFolderOptions) {
  return prisma.folder.findMany({
    where: {
      ...options,
      type: options.type ?? FolderType.NOTE,
      userId: options.userId ?? getTestUser().userId,
    },
  })
}

function getDbFolder(id: FolderData['id']) {
  return prisma.folder.findUnique({ where: { id } })
}

interface DbFolderOptions {
  name?: FolderData['name']
  parentId?: FolderData['parentId']
  type?: FolderType
  userId?: UserId
}
