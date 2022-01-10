import { type EmailAllowList, FolderType } from '@prisma/client'
import faker from 'faker'
import slug from 'url-slug'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetaData } from 'libs/db/note'
import { getTestUser } from 'tests/integration'

export function createTestFolder(options?: TestFolderOptions) {
  return prisma.folder.create({
    data: {
      name: options?.name ?? faker.lorem.words(),
      parentId: options?.parentId,
      type: options?.type ?? FolderType.NOTE,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestFolders(options?: TestFolderOptions) {
  return prisma.folder.findMany({
    where: {
      ...options,
      type: options?.type ?? FolderType.NOTE,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestFolder(id: FolderData['id']) {
  return prisma.folder.findUnique({ where: { id } })
}

interface TestFolderOptions {
  name?: FolderData['name']
  parentId?: FolderData['parentId']
  type?: FolderType
  userId?: UserId
}

export function createTestNote(options?: TestNoteOptions) {
  const name = options?.name ?? faker.lorem.words()
  const data = faker.lorem.paragraphs(3)

  return prisma.note.create({
    data: {
      name,
      folderId: options?.folderId,
      html: data,
      slug: slug(name),
      text: data,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestNotes(options?: TestNoteOptions) {
  return prisma.note.findMany({
    where: {
      ...options,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestNote(id: NoteMetaData['id']) {
  return prisma.note.findUnique({ where: { id } })
}

interface TestNoteOptions {
  name?: NoteMetaData['name']
  folderId?: NoteMetaData['folderId']
  userId?: UserId
}

export function createTestEmailAllowList() {
  return prisma.emailAllowList.create({
    data: {
      email: faker.internet.email(),
    },
  })
}

export function getTestEmailAllowLists(options: TestEmailAllowListOptions) {
  return prisma.emailAllowList.findMany({
    where: options,
  })
}

export function getTestEmailAllowList(id: EmailAllowList['id']) {
  return prisma.emailAllowList.findUnique({ where: { id } })
}

interface TestEmailAllowListOptions {
  email?: EmailAllowList['email']
}
