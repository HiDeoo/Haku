import { FolderType, Note } from '@prisma/client'
import slug from 'url-slug'

import { handleDbError, prisma } from 'libs/db'
import { getFolderById } from 'libs/db/folder'
import {
  ApiError,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
} from 'libs/api/routes/errors'

export type NoteMetaData = Pick<Note, 'id' | 'folderId' | 'name' | 'slug'>

const noteMetaDataSelect = { id: true, name: true, folderId: true, slug: true }

export async function addNote(
  userId: UserId,
  name: NoteMetaData['name'],
  folderId?: NoteMetaData['folderId']
): Promise<NoteMetaData> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId)

    try {
      return await prisma.note.create({
        data: { userId, name, folderId, slug: slug(name) },
        select: noteMetaDataSelect,
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

export async function getNotesMetaDataGroupedByFolder(userId: UserId): Promise<NotesMetaDataGroupedByFolder> {
  const metaDatas = await prisma.note.findMany({
    where: { userId },
    select: noteMetaDataSelect,
    orderBy: [{ name: 'asc' }],
  })

  const notesMetaDataGroupedByFolder: NotesMetaDataGroupedByFolder = new Map()

  metaDatas.forEach((note) => {
    notesMetaDataGroupedByFolder.set(note.folderId, [...(notesMetaDataGroupedByFolder.get(note.folderId) ?? []), note])
  })

  return notesMetaDataGroupedByFolder
}

export function updateNote(id: NoteMetaData['id'], userId: UserId, data: UpdateNoteData): Promise<NoteMetaData> {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    await validateFolder(data.folderId, userId)

    try {
      return await prisma.note.update({
        where: {
          id,
        },
        data: {
          folderId: data.folderId,
          name: data.name,
          slug: data.name ? slug(data.name) : undefined,
        },
        select: noteMetaDataSelect,
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

export function removeNote(id: NoteMetaData['id'], userId: UserId) {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    return prisma.note.delete({ where: { id } })
  })
}

function getNoteById(id: number, userId: UserId): Promise<Note | null> {
  return prisma.note.findFirst({ where: { id, userId } })
}

async function validateFolder(folderId: NoteMetaData['folderId'] | undefined, userId: UserId) {
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

type NotesMetaDataGroupedByFolder = Map<NoteMetaData['folderId'], NoteMetaData[]>

type UpdateNoteData = Partial<Pick<NoteMetaData, 'name' | 'folderId'>>
