import { FolderType, Note } from '@prisma/client'

import { handleDbError, prisma } from 'libs/db'
import { getFolderById } from 'libs/db/folder'
import {
  ApiError,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
} from 'libs/api/routes/errors'

export type NoteData = Pick<Note, 'id' | 'folderId' | 'name'>

const noteDataSelect = { id: true, name: true, folderId: true }

export async function addNote(
  userId: UserId,
  name: NoteData['name'],
  folderId?: NoteData['folderId']
): Promise<NoteData> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId)

    try {
      return await prisma.note.create({
        data: { userId, name, folderId },
        select: noteDataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
          folderId_userId_name: API_ERROR_NOTE_ALREADY_EXISTS,
        },
      })
    }
  })
}

async function validateFolder(folderId: NoteData['folderId'] | undefined, userId: UserId) {
  if (folderId) {
    const folder = await getFolderById(folderId, userId)

    if (!folder) {
      throw new ApiError(API_ERROR_FOLDER_DOES_NOT_EXIST)
    }

    if (folder.type !== FolderType.NOTE) {
      throw new ApiError(API_ERROR_FOLDER_INVALID_TYPE)
    }
  }
}
