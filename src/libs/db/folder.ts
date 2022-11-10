import { Prisma, type Folder, type FolderType } from '@prisma/client'
import { TRPCError } from '@trpc/server'

import {
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_INVALID_TYPE,
} from 'constants/error'
import { handleDbError, prisma } from 'libs/db'
import { getTreeChildrenFolderIds } from 'libs/db/tree'

export type FolderData = Prisma.FolderGetPayload<{ select: typeof folderDataSelect }>

const folderDataSelect = Prisma.validator<Prisma.FolderSelect>()({
  id: true,
  name: true,
  parentId: true,
})

export function addFolder(
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

export function updateFolder(id: FolderData['id'], userId: UserId, data: UpdateFolderData): Promise<FolderData> {
  return prisma.$transaction(async (prisma) => {
    const folder = await getFolderById(id, userId)

    if (!folder) {
      throw new TRPCError({ code: 'NOT_FOUND', message: API_ERROR_FOLDER_DOES_NOT_EXIST })
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

export function removeFolder(id: FolderData['id'], userId: UserId) {
  return prisma.$transaction(async (prisma) => {
    const folder = await getFolderById(id, userId)

    if (!folder) {
      throw new TRPCError({ code: 'NOT_FOUND', message: API_ERROR_FOLDER_DOES_NOT_EXIST })
    }

    const nestedFolders = await getTreeChildrenFolderIds(userId, folder.type, id)

    return prisma.folder.deleteMany({ where: { id: { in: [id, ...nestedFolders] } } })
  })
}

export async function validateFolder(folderId: FolderData['parentId'] | undefined, userId: UserId, type: FolderType) {
  if (folderId) {
    const folder = await getFolderById(folderId, userId)

    if (!folder) {
      throw new TRPCError({ code: 'NOT_FOUND', message: API_ERROR_FOLDER_DOES_NOT_EXIST })
    }

    if (folder.type !== type) {
      throw new TRPCError({ code: 'CONFLICT', message: API_ERROR_FOLDER_INVALID_TYPE })
    }
  }
}

async function validateParentFolder(parentId: FolderData['parentId'] | undefined, userId: UserId, type: FolderType) {
  try {
    await validateFolder(parentId, userId, type)
  } catch (error) {
    if (error instanceof TRPCError) {
      if (error.message === API_ERROR_FOLDER_DOES_NOT_EXIST) {
        throw new TRPCError({ ...error, message: API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST })
      } else if (error.message === API_ERROR_FOLDER_INVALID_TYPE) {
        throw new TRPCError({ ...error, message: API_ERROR_FOLDER_PARENT_INVALID_TYPE })
      }
    }

    throw error
  }
}

function getFolderById(id: Folder['id'], userId: UserId): Promise<Folder | null> {
  return prisma.folder.findUnique({ where: { id, userId } })
}

type UpdateFolderData = Partial<Pick<FolderData, 'name' | 'parentId'>>
