import { type Folder, FolderType } from '@prisma/client'

import { ApiClientError } from 'libs/api/routes'
import {
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_INVALID_TYPE,
} from 'libs/api/routes/errors'
import { handleDbError, prisma } from 'libs/db'

export type FolderData = Pick<Folder, 'id' | 'parentId' | 'name'>

const folderDataSelect = { id: true, name: true, parentId: true }

export async function addFolder(
  userId: UserId,
  type: FolderType,
  name: FolderData['name'],
  parentId?: FolderData['parentId']
): Promise<FolderData> {
  return prisma.$transaction(async (prisma) => {
    await validateParentFolder(parentId, userId, type)

    try {
      return await prisma.folder.create({
        data: { userId, type, name, parentId },
        select: folderDataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
          parentId_type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
        },
      })
    }
  })
}

export async function updateFolder(id: FolderData['id'], userId: UserId, data: UpdateFolderData): Promise<FolderData> {
  return prisma.$transaction(async (prisma) => {
    const folder = await getFolderById(id, userId)

    if (!folder) {
      throw new ApiClientError(API_ERROR_FOLDER_DOES_NOT_EXIST)
    }

    await validateParentFolder(data.parentId, userId, folder.type)

    try {
      return await prisma.folder.update({
        where: {
          id,
        },
        data: {
          name: data.name,
          parentId: data.parentId,
        },
        select: folderDataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
          parentId_type_userId_name: API_ERROR_FOLDER_ALREADY_EXISTS,
        },
      })
    }
  })
}

function getFolderById(id: number, userId: UserId): Promise<Folder | null> {
  return prisma.folder.findFirst({ where: { id, userId } })
}

async function validateParentFolder(parentId: FolderData['parentId'] | undefined, userId: UserId, type: FolderType) {
  if (parentId) {
    const parentFolder = await getFolderById(parentId, userId)

    if (!parentFolder) {
      throw new ApiClientError(API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST)
    }

    if (parentFolder.type !== type) {
      throw new ApiClientError(API_ERROR_FOLDER_PARENT_INVALID_TYPE)
    }
  }
}

type UpdateFolderData = Partial<Pick<FolderData, 'name' | 'parentId'>>
