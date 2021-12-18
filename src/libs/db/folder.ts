import { type Folder, FolderType } from '@prisma/client'

import { ApiClientError } from 'libs/api/routes'
import { prisma } from 'libs/db'

export type FolderData = Pick<Folder, 'id' | 'parentId' | 'name'>

export async function addFolder(
  userId: UserId,
  type: FolderType,
  name: string,
  parentId?: number
): Promise<FolderData> {
  if (parentId) {
    const parentFolder = await getFolderById(parentId, userId)

    if (!parentFolder) {
      throw new ApiClientError('The parent folder specified does not exist.')
    }
  }

  return await prisma.folder.create({
    data: { userId, type, name, parentId },
    select: { id: true, name: true, parentId: true },
  })
}

function getFolderById(id: number, userId: UserId): Promise<FolderData | null> {
  return prisma.folder.findFirst({ where: { id, userId } })
}
