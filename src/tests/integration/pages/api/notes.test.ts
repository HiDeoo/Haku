import { FolderType } from '@prisma/client'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import handler from 'pages/api/notes'
import { prisma } from 'libs/db'
import { type NoteTree } from 'libs/db/tree'

describe('notes', () => {
  describe('GET', () => {
    test('should return an empty tree', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json()

        expect(json).toEqual([])
      }))

    test('should return a tree with only root nodes', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { userId } = getTestUser()

        const folder_0 = 'folder_0'
        const folder_1 = 'folder_1'
        const folder_2 = 'folder_2'

        await prisma.folder.createMany({
          data: [getFolderData(userId, folder_0), getFolderData(userId, folder_1), getFolderData(userId, folder_2)],
        })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTree>()

        expect(json.length).toEqual(3)
        expect(json[0]?.name).toEqual(folder_0)
        expect(json[1]?.name).toEqual(folder_1)
        expect(json[2]?.name).toEqual(folder_2)
      }))

    test('should return a tree with nested nodes', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { userId } = getTestUser()

        /**
         * folder0
         * |__ folder0_0
         * |__ folder0_1
         *     |__ folder0_1_0
         *     |__ folder0_1_1
         * folder1
         * folder2
         * |__ folder2_0
         *     |__ folder2_0_0
         *         |__ folder2_0_0_0
         *         |__ folder2_0_0_1
         * |__ folder2_1
         */

        const folder_0 = 'folder_0'
        const folder_0_0 = 'folder_0_0'
        const folder_0_1 = 'folder_0_1'
        const folder_0_1_0 = 'folder_0_1_0'
        const folder_0_1_1 = 'folder_0_1_1'
        const folder_1 = 'folder_1'
        const folder_2 = 'folder_2'
        const folder_2_0 = 'folder_2_0'
        const folder_2_0_0 = 'folder_2_0_0'
        const folder_2_0_0_0 = 'folder_2_0_0_0'
        const folder_2_0_0_1 = 'folder_2_0_0_1'
        const folder_2_1 = 'folder_2_1'

        const { id: folder_0_id } = await prisma.folder.create({ data: getFolderData(userId, folder_0) })

        await prisma.folder.create({ data: getFolderData(userId, folder_0_0, folder_0_id) })
        const { id: folder_0_1_id } = await prisma.folder.create({
          data: getFolderData(userId, folder_0_1, folder_0_id),
        })

        await prisma.folder.create({ data: getFolderData(userId, folder_0_1_0, folder_0_1_id) })
        await prisma.folder.create({ data: getFolderData(userId, folder_0_1_1, folder_0_1_id) })

        await prisma.folder.create({ data: getFolderData(userId, folder_1) })

        const { id: folder_2_id } = await prisma.folder.create({ data: getFolderData(userId, folder_2) })

        const { id: folder_2_0_id } = await prisma.folder.create({
          data: getFolderData(userId, folder_2_0, folder_2_id),
        })
        await prisma.folder.create({ data: getFolderData(userId, folder_2_1, folder_2_id) })

        const { id: folder_2_0_0_id } = await prisma.folder.create({
          data: getFolderData(userId, folder_2_0_0, folder_2_0_id),
        })

        await prisma.folder.create({ data: getFolderData(userId, folder_2_0_0_0, folder_2_0_0_id) })
        await prisma.folder.create({ data: getFolderData(userId, folder_2_0_0_1, folder_2_0_0_id) })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTree>()

        expect(json.length).toBe(3)

        expect(json[0]?.name).toBe(folder_0)
        expect(json[0]?.children.length).toBe(2)

        expect(json[0]?.children[0]?.name).toBe(folder_0_0)
        expect(json[0]?.children[0]?.children.length).toBe(0)

        expect(json[0]?.children[1]?.name).toBe(folder_0_1)
        expect(json[0]?.children[1]?.children.length).toBe(2)

        expect(json[0]?.children[1]?.children[0]?.name).toBe(folder_0_1_0)
        expect(json[0]?.children[1]?.children[0]?.children.length).toBe(0)

        expect(json[0]?.children[1]?.children[1]?.name).toBe(folder_0_1_1)
        expect(json[0]?.children[1]?.children[1]?.children.length).toBe(0)

        expect(json[1]?.name).toBe(folder_1)
        expect(json[1]?.children.length).toBe(0)

        expect(json[2]?.name).toBe(folder_2)
        expect(json[2]?.children.length).toBe(2)

        expect(json[2]?.children[0]?.name).toBe(folder_2_0)
        expect(json[2]?.children[0]?.children.length).toBe(1)

        expect(json[2]?.children[0]?.children[0]?.name).toBe(folder_2_0_0)
        expect(json[2]?.children[0]?.children[0]?.children.length).toBe(2)

        expect(json[2]?.children[0]?.children[0]?.children[0]?.name).toBe(folder_2_0_0_0)
        expect(json[2]?.children[0]?.children[0]?.children[0]?.children.length).toBe(0)

        expect(json[2]?.children[0]?.children[0]?.children[1]?.name).toBe(folder_2_0_0_1)
        expect(json[2]?.children[0]?.children[0]?.children[1]?.children.length).toBe(0)

        expect(json[2]?.children[1]?.name).toBe(folder_2_1)
        expect(json[2]?.children[1]?.children.length).toBe(0)
      }))

    test('should return only the content of the current user', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { userId: userId_0 } = getTestUser('0')
        const { userId: userId_1 } = getTestUser('1')

        const folder_0_user_0 = 'folder_0_user_0'
        const folder_1_user_0 = 'folder_1_user_0'
        const folder_0_0_user_0 = 'folder_0_0_user_0'
        const folder_0_1_user_0 = 'folder_0_1_user_0'

        const { id: folder_0_user_0_id } = await prisma.folder.create({
          data: getFolderData(userId_0, folder_0_user_0),
        })

        await prisma.folder.create({ data: getFolderData(userId_0, folder_0_0_user_0, folder_0_user_0_id) })
        await prisma.folder.create({ data: getFolderData(userId_0, folder_0_1_user_0, folder_0_user_0_id) })

        await prisma.folder.create({ data: getFolderData(userId_0, folder_1_user_0) })

        await prisma.folder.createMany({
          data: [
            getFolderData(userId_1, 'folder_0_user_1'),
            getFolderData(userId_1, 'folder_1_user_1'),
            getFolderData(userId_1, 'folder_0_0_user_1'),
            getFolderData(userId_1, 'folder_0_1_user_1'),
          ],
        })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTree>()

        expect(json.length).toEqual(2)

        expect(json[0]?.name).toEqual(folder_0_user_0)
        expect(json[0]?.children.length).toEqual(2)

        expect(json[0]?.children[0]?.name).toEqual(folder_0_0_user_0)
        expect(json[0]?.children[0]?.children.length).toEqual(0)

        expect(json[0]?.children[1]?.name).toEqual(folder_0_1_user_0)
        expect(json[0]?.children[1]?.children.length).toEqual(0)

        expect(json[1]?.name).toEqual(folder_1_user_0)
        expect(json[1]?.children.length).toEqual(0)
      }))
  })
})

function getFolderData(userId: string, name: string, parentId?: number) {
  return { type: FolderType.NOTE, userId, name, parentId }
}
