import { FolderType } from '@prisma/client'
import StatusCode from 'status-code-enum'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import postHandler from 'pages/api/folder'
import { type FolderData } from 'libs/db/folder'
import { prisma } from 'libs/db'
import { ApiClientErrorResponse } from 'libs/api/routes'

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

        const { id: parentId } = await prisma.folder.create({
          data: { userId, type: FolderType.NOTE, name: 'parent' },
        })

        const name = 'folder'
        const type = FolderType.NOTE

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
        expect(json.error).toBe('The parent folder specified does not exist.')

        const dbFolder = await prisma.folder.findMany({ where: { name, type, parentId, userId } })

        expect(dbFolder.length).toBe(0)
      }))

    test.todo('should not add a new folder inside an existing folder not owned by the current user')

    test.todo('should not add a new duplicated folder at the root')

    test.todo('should not add a new duplicated folder inside an existing folder')
  })
})
