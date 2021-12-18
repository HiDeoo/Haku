import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import postHandler from 'pages/api/folder'
import { type FolderData } from 'libs/db/folder'
import { prisma } from 'libs/db'
import { ApiClientErrorResponse } from 'libs/api/routes'
import { API_ERROR_FOLDER_ALREADY_EXISTS, API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS } from 'libs/api/routes/errors'

describe('folder', () => {
  describe('POST', () => {
    test('should add a new folder at the root', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type }),
        })
        const json = await res.json<FolderData>()

        const dbFolder = await prisma.folder.findMany({ where: { name, type, parentId: null, userId } })

        expect(dbFolder.length).toBe(1)
        expect(dbFolder[0]?.id).toBe(json.id)
        expect(dbFolder[0]?.name).toBe(json.name)
        expect(dbFolder[0]?.parentId).toBeNull()
      }))

    test('should add a new folder inside an existing folder', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const name = 'folder'
        const type = FolderType.NOTE

        const { id: parentId } = await prisma.folder.create({ data: { userId, type, name: 'parent' } })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<FolderData>()

        const dbFolder = await prisma.folder.findMany({ where: { name, type, parentId, userId } })

        expect(dbFolder.length).toBe(1)
        expect(dbFolder[0]?.id).toBe(json.id)
        expect(dbFolder[0]?.name).toBe(json.name)
        expect(dbFolder[0]?.parentId).toBe(parentId)
      }))

    test('should not add a new folder inside an nonexisting folder', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

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

        const dbFolder = await prisma.folder.findMany({ where: { name, type, parentId, userId } })

        expect(dbFolder.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder not owned by the current user', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId: userId0 } = getTestUser('0')
        const { userId: userId1 } = getTestUser('1')

        const name = 'folder'
        const type = FolderType.NOTE

        const { id: parentId } = await prisma.folder.create({ data: { userId: userId1, type, name: 'parent' } })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)

        const dbFolder = await prisma.folder.findMany({ where: { name, type, parentId, userId: userId0 } })

        expect(dbFolder.length).toBe(0)
      }))

    test('should not add a new duplicated folder at the root', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const name = 'folder'
        const type = FolderType.NOTE

        await prisma.folder.create({ data: { userId, type, name } })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const dbFolder = await prisma.folder.findMany({ where: { name, type, userId } })

        expect(dbFolder.length).toBe(1)
      }))

    test('should not add a new duplicated folder inside an existing folder', () =>
      testApiRoute(postHandler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const name = 'folder'
        const type = FolderType.NOTE

        const { id: parentId } = await prisma.folder.create({ data: { userId, type, name: 'parent' } })

        await prisma.folder.create({ data: { userId, type, name, parentId } })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, type, parentId }),
        })
        const json = await res.json<ApiClientErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_ALREADY_EXISTS)

        const dbFolder = await prisma.folder.findMany({ where: { name, type, userId, parentId } })

        expect(dbFolder.length).toBe(1)
      }))
  })
})
