import { type EmailAllowList, FolderType } from '@prisma/client'
import faker from '@faker-js/faker'
import slug from 'url-slug'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { getTestUser } from 'tests/integration'

function createTestFolder(options: TestFolderOptions) {
  return prisma.folder.create({
    data: {
      name: options?.name ?? faker.lorem.words(),
      parentId: options?.parentId,
      type: options.type,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function createTestNoteFolder(options?: Omit<TestFolderOptions, 'type'>) {
  return createTestFolder({ ...options, type: FolderType.NOTE })
}

export function createTestTodoFolder(options?: Omit<TestFolderOptions, 'type'>) {
  return createTestFolder({ ...options, type: FolderType.TODO })
}

export function getTestFolders(options: TestFolderOptions) {
  return prisma.folder.findMany({
    where: {
      ...options,
      type: options.type,
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
  type: FolderType
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

export function createTestTodo(options?: TestTodoOptions) {
  const name = options?.name ?? faker.lorem.words()

  return prisma.todo.create({
    data: {
      name,
      folderId: options?.folderId,
      slug: slug(name),
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

export function getTestNote(id: NoteMetadata['id']) {
  return prisma.note.findUnique({ where: { id } })
}

interface TestNoteOptions {
  name?: NoteMetadata['name']
  folderId?: NoteMetadata['folderId']
  userId?: UserId
}

interface TestTodoOptions {
  name?: TodoMetadata['name']
  folderId?: TodoMetadata['folderId']
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
