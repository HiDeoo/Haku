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

export type NoteData = Pick<Note, 'id' | 'folderId' | 'name' | 'slug'>

const noteDataSelect = { id: true, name: true, folderId: true, slug: true }

export async function addNote(
  userId: UserId,
  name: NoteData['name'],
  folderId?: NoteData['folderId']
): Promise<NoteData> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId)

    try {
      return await prisma.note.create({
        data: { userId, name, folderId, slug: slug(name) },
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

export async function getNotesGroupedByFolder(userId: UserId): Promise<NotesGroupedByFolder> {
  const notes = await prisma.note.findMany({ where: { userId }, select: noteDataSelect, orderBy: [{ name: 'asc' }] })

  const notesGroupedByFolder: NotesGroupedByFolder = new Map()

  notes.forEach((note) => {
    notesGroupedByFolder.set(note.folderId, [...(notesGroupedByFolder.get(note.folderId) ?? []), note])
  })

  return notesGroupedByFolder
}

export function updateNote(id: NoteData['id'], userId: UserId, data: UpdateNoteData): Promise<NoteData> {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    await validateFolder(data.folderId, userId)

    const name = data.name ?? note.name
    const folderId = typeof data.folderId !== 'undefined' ? data.folderId : note.folderId

    try {
      return await prisma.note.update({
        where: {
          id,
        },
        data: {
          folderId,
          name,
          slug: slug(name),
        },
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

function getNoteById(id: number, userId: UserId): Promise<Note | null> {
  return prisma.note.findFirst({ where: { id, userId } })
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

type NotesGroupedByFolder = Map<NoteData['folderId'], NoteData[]>

type UpdateNoteData = Partial<Pick<NoteData, 'name' | 'folderId'>>
