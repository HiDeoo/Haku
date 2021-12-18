import { type Folder, FolderType } from '@prisma/client'

import { ApiClientError } from 'libs/api/routes'
import { API_ERROR_FOLDER_ALREADY_EXISTS, API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS } from 'libs/api/routes/errors'
import { handleDbError, prisma } from 'libs/db'

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
      throw new ApiClientError(API_ERROR_FOLDER_PARENT_DOES_NOT_EXISTS)
    }
  }

  try {
    return await prisma.folder.create({
      data: { userId, type, name, parentId },
      select: { id: true, name: true, parentId: true },
    })
  } catch (error) {
    handleDbError(error, {
      unique: {
        type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
        parentId_type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
      },
    })
  }
}

function getFolderById(id: number, userId: UserId): Promise<FolderData | null> {
  return prisma.folder.findFirst({ where: { id, userId } })
}
