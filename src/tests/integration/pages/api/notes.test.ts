import { FolderType } from '@prisma/client'

import { getTestUser, testApiRoute } from 'tests/integration'
import { HttpMethod } from 'libs/http'
import handler from 'pages/api/notes'
import { prisma } from 'libs/db'
import { type NoteTreeData } from 'libs/db/tree'
import { type FolderData } from 'libs/db/folder'

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
        const { name: folder_0 } = await createDbFolder({ name: 'folder_0' })
        const { name: folder_1 } = await createDbFolder({ name: 'folder_1' })
        const { name: folder_2 } = await createDbFolder({ name: 'folder_2' })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toEqual(3)
        expect(json[0]?.name).toEqual(folder_0)
        expect(json[1]?.name).toEqual(folder_1)
        expect(json[2]?.name).toEqual(folder_2)
      }))

    test('should return a tree with nested nodes', () =>
      testApiRoute(handler, async ({ fetch }) => {
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

        const { id: folder_0_id, name: folder_0 } = await createDbFolder({ name: 'folder_0' })

        const { name: folder_0_0 } = await createDbFolder({ name: 'folder_0_0', parentId: folder_0_id })
        const { id: folder_0_1_id, name: folder_0_1 } = await createDbFolder({
          name: 'folder_0_1',
          parentId: folder_0_id,
        })

        const { name: folder_0_1_0 } = await createDbFolder({ name: 'folder_0_1_0', parentId: folder_0_1_id })
        const { name: folder_0_1_1 } = await createDbFolder({ name: 'folder_0_1_1', parentId: folder_0_1_id })

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
        const { name: folder_2_0_0_1 } = await createDbFolder({ name: 'folder_2_0_0_1', parentId: folder_2_0_0_id })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

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
        const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createDbFolder({ name: 'folder_0_user_0' })
        const { name: folder_1_user_0 } = await createDbFolder({ name: 'folder_1_user_0' })

        const { name: folder_0_0_user_0 } = await createDbFolder({
          name: 'folder_0_0_user_0',
          parentId: folder_0_user_0_id,
        })
        const { name: folder_0_1_user_0 } = await createDbFolder({
          name: 'folder_0_1_user_0',
          parentId: folder_0_user_0_id,
        })

        const { userId: userId1 } = getTestUser('1')

        const { id: folder_0_user_1_id } = await createDbFolder({ name: 'folder_0_user_1', userId: userId1 })

        await createDbFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

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

    test('should return only the content of the proper type', () =>
      testApiRoute(handler, async ({ fetch }) => {
        const { name: folder_0_type_note } = await createDbFolder({ name: 'folder_0_type_note' })

        await createDbFolder({ name: 'folder_0_type_todo', type: FolderType.TODO })

        const res = await fetch({ method: HttpMethod.GET })
        const json = await res.json<NoteTreeData>()

        expect(json.length).toEqual(1)

        expect(json[0]?.name).toEqual(folder_0_type_note)
        expect(json[0]?.children.length).toEqual(0)
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

interface DbFolderOptions {
  name: FolderData['name']
  parentId?: FolderData['parentId']
  type?: FolderType
  userId?: UserId
}
