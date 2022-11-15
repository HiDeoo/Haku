import { FolderType, type Note, Prisma } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import slug from 'url-slug'

import {
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
  API_ERROR_NOTE_HTML_OR_TEXT_MISSING,
} from 'constants/error'
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
  const note = await prisma.note.findUnique({ where: { id, userId }, select: noteDataSelect })

  if (!note) {
    throw new TRPCError({ code: 'NOT_FOUND', message: API_ERROR_NOTE_DOES_NOT_EXIST })
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

  for (const note of metaDatas) {
    noteMetadataGroupedByFolder.set(note.folderId, [...(noteMetadataGroupedByFolder.get(note.folderId) ?? []), note])
  }

  return noteMetadataGroupedByFolder
}

export function updateNote(
  id: NoteMetadata['id'],
  userId: UserId,
  data: UpdateNoteData
): Promise<NoteMetadata | NoteData> {
  return prisma.$transaction(async (prisma) => {
    if ((data.html && !data.text) || (data.text && !data.html)) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: API_ERROR_NOTE_HTML_OR_TEXT_MISSING })
    }

    await validateFolder(data.folderId, userId, FolderType.NOTE)

    try {
      return await prisma.note.update({
        where: {
          id,
          userId,
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
        update: API_ERROR_NOTE_DOES_NOT_EXIST,
      })
    }
  })
}

export async function removeNote(id: NoteMetadata['id'], userId: UserId) {
  await deleteFromCloudinaryByTag(id)

  try {
    return await prisma.note.delete({ where: { id, userId } })
  } catch (error) {
    handleDbError(error, {
      delete: API_ERROR_NOTE_DOES_NOT_EXIST,
    })
  }
}

type NoteMetadataGroupedByFolder = Map<NoteMetadata['folderId'], NoteMetadata[]>

type UpdateNoteData = Partial<Pick<NoteMetadata, 'name' | 'folderId'> & Pick<NoteData, 'html'> & Pick<Note, 'text'>>
