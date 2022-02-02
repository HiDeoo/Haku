import { type EmailAllowList, FolderType, TodoNode } from '@prisma/client'
import faker from '@faker-js/faker'
import slug from 'url-slug'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { getTestUser } from 'tests/api'

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

export async function createTestTodo(options?: TestTodoOptions, root?: TodoNodeData['id'][]) {
  const name = options?.name ?? faker.lorem.words()

  const todoNode = await createTestTodoNode()

  return prisma.todo.create({
    data: {
      name,
      folderId: options?.folderId,
      slug: slug(name),
      userId: options?.userId ?? getTestUser().userId,
      root: root ?? [todoNode.id],
      nodes: {
        connect: root?.map((id) => ({ id })) ?? [{ id: todoNode.id }],
      },
    },
    include: {
      nodes: true,
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

export function getTestTodos(options?: TestTodoOptions) {
  return prisma.todo.findMany({
    where: {
      ...options,
      userId: options?.userId ?? getTestUser().userId,
    },
  })
}

export function getTestNote(id: NoteMetadata['id']) {
  return prisma.note.findUnique({ where: { id } })
}

export function getTestTodo(id: TodoMetadata['id']) {
  return prisma.todo.findUnique({ where: { id }, include: { nodes: true } })
}

export function getTestTodoNode(id: TodoNodeData['id']) {
  return prisma.todoNode.findUnique({ where: { id } })
}

export function createTestTodoNode(options?: TestTodoNodeOptions) {
  return prisma.todoNode.create({
    data: {
      id: options?.id,
      children: options?.children,
      completed: options?.completed ?? faker.datatype.boolean(),
      content: options?.content ?? faker.lorem.words(),
      note: options?.note ?? (faker.datatype.boolean() ? faker.lorem.sentences() : null),
      todoId: options?.todoId,
    },
  })
}

export function updateTestTodoNodeChildren(id: TodoNode['id'], children: TodoNode['children']) {
  return prisma.todoNode.update({
    data: {
      children,
    },
    where: {
      id,
    },
  })
}

export function updateTestTodoRoot(id: TodoMetadata['id'], root: TodoNode['children']) {
  return prisma.todo.update({ data: { root }, where: { id } })
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

interface TestFolderOptions {
  name?: FolderData['name']
  parentId?: FolderData['parentId']
  type: FolderType
  userId?: UserId
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

interface TestTodoNodeOptions {
  id?: TodoNode['id']
  children?: TodoNode['children']
  content?: TodoNode['content']
  note?: TodoNode['note']
  completed?: TodoNode['completed']
  todoId?: TodoNode['todoId']
}

interface TestEmailAllowListOptions {
  email?: EmailAllowList['email']
}
