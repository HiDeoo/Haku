import { FolderType, Note, Prisma } from '@prisma/client'
import { StatusCode } from 'status-code-enum'
import slug from 'url-slug'

import {
  ApiError,
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
  API_ERROR_NOTE_HTML_OR_TEXT_MISSING,
} from 'libs/api/routes/errors'
import { deleteFromCloudinaryByTag } from 'libs/cloudinary'
import { handleDbError, prisma } from 'libs/db'
import { validateFolder } from 'libs/db/folder'

export type NoteMetadata = Prisma.NoteGetPayload<{ select: typeof noteMetadataSelect }>
export type NoteData = Prisma.NoteGetPayload<{ select: typeof noteDataSelect }>

const noteMetadataSelect = Prisma.validator<Prisma.NoteSelect>()({
  id: true,
  name: true,
  folderId: true,
  slug: true,
})
const noteDataSelect = Prisma.validator<Prisma.NoteSelect>()({
  ...noteMetadataSelect,
  html: true,
})

export async function addNote(
  userId: UserId,
  name: NoteMetadata['name'],
  folderId?: NoteMetadata['folderId']
): Promise<NoteMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId, FolderType.NOTE)

    try {
      return await prisma.note.create({
        data: { userId, name, folderId, slug: slug(name), html: `<h1>${name}</h1><p></p>`, text: `${name}\n\n` },
        select: noteMetadataSelect,
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

export async function getNote(id: NoteData['id'], userId: UserId): Promise<NoteData> {
  const note = await prisma.note.findFirst({ where: { id, userId }, select: noteDataSelect })

  if (!note) {
    throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST, StatusCode.ClientErrorNotFound)
  }

  return note
}

export async function getNotesMetadataGroupedByFolder(userId: UserId): Promise<NoteMetadataGroupedByFolder> {
  const metaDatas = await prisma.note.findMany({
    where: { userId },
    select: noteMetadataSelect,
    orderBy: [{ name: 'asc' }],
  })

  const noteMetadataGroupedByFolder: NoteMetadataGroupedByFolder = new Map()

  metaDatas.forEach((note) => {
    noteMetadataGroupedByFolder.set(note.folderId, [...(noteMetadataGroupedByFolder.get(note.folderId) ?? []), note])
  })

  return noteMetadataGroupedByFolder
}

export function updateNote(id: NoteMetadata['id'], userId: UserId, data: UpdateNoteData): Promise<NoteMetadata> {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    if ((data.html && !data.text) || (data.text && !data.html)) {
      throw new ApiError(API_ERROR_NOTE_HTML_OR_TEXT_MISSING)
    }

    await validateFolder(data.folderId, userId, FolderType.NOTE)

    try {
      return await prisma.note.update({
        where: {
          id,
        },
        data: {
          folderId: data.folderId,
          name: data.name,
          slug: data.name ? slug(data.name) : undefined,
          html: data.html,
          text: data.text,
          modifiedAt: data.html ? new Date() : undefined,
        },
        select: data.html && data.text ? noteDataSelect : noteMetadataSelect,
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

export function removeNote(id: NoteMetadata['id'], userId: UserId) {
  return prisma.$transaction(async (prisma) => {
    const note = await getNoteById(id, userId)

    if (!note) {
      throw new ApiError(API_ERROR_NOTE_DOES_NOT_EXIST)
    }

    await deleteFromCloudinaryByTag(id)

    return prisma.note.delete({ where: { id } })
  })
}

function getNoteById(id: Note['id'], userId: UserId): Promise<Note | null> {
  return prisma.note.findFirst({ where: { id, userId } })
}

type NoteMetadataGroupedByFolder = Map<NoteMetadata['folderId'], NoteMetadata[]>

type UpdateNoteData = Partial<Pick<NoteMetadata, 'name' | 'folderId'> & Pick<NoteData, 'html'> & Pick<Note, 'text'>>
