import { FolderType, Prisma, type TodoNode } from '@prisma/client'
import slug from 'url-slug'

import { API_ERROR_TODO_ALREADY_EXISTS, API_ERROR_TODO_DOES_NOT_EXIST } from 'constants/error'
import { deleteFromCloudinaryByTag } from 'libs/cloudinary'
import { handleDbError, prisma } from 'libs/db'
import { validateFolder } from 'libs/db/folder'

export type TodoMetadata = Prisma.TodoGetPayload<{ select: typeof todoMetadataSelect }>

const todoMetadataSelect = Prisma.validator<Prisma.TodoSelect>()({
  id: true,
  name: true,
  folderId: true,
  slug: true,
})

export async function addTodo(
  userId: UserId,
  name: TodoMetadata['name'],
  folderId?: TodoMetadata['folderId'],
  createDefaultTodoNode = true
): Promise<TodoMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId, FolderType.TODO)

    try {
      let todoNode: TodoNode | undefined

      if (createDefaultTodoNode) {
        todoNode = await prisma.todoNode.create({ data: { content: '' } })
      }

      return await prisma.todo.create({
        data: {
          userId,
          name,
          folderId,
          root: todoNode ? [todoNode.id] : [],
          slug: slug(name),
          nodes: todoNode
            ? {
                connect: [{ id: todoNode.id }],
              }
            : undefined,
        },
        select: todoMetadataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          userId_name: API_ERROR_TODO_ALREADY_EXISTS,
          folderId_userId_name: API_ERROR_TODO_ALREADY_EXISTS,
        },
      })
    }
  })
}

export async function getTodosMetadataGroupedByFolder(userId: UserId): Promise<TodoMetadataGroupedByFolder> {
  const metaDatas = await prisma.todo.findMany({
    where: { userId },
    select: todoMetadataSelect,
    orderBy: [{ name: 'asc' }],
  })

  const todoMetadataGroupedByFolder: TodoMetadataGroupedByFolder = new Map()

  for (const todo of metaDatas) {
    todoMetadataGroupedByFolder.set(todo.folderId, [...(todoMetadataGroupedByFolder.get(todo.folderId) ?? []), todo])
  }

  return todoMetadataGroupedByFolder
}

export function updateTodo(id: TodoMetadata['id'], userId: UserId, data: UpdateTodoData): Promise<TodoMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(data.folderId, userId, FolderType.TODO)

    try {
      return await prisma.todo.update({
        where: {
          id,
          userId,
        },
        data: {
          folderId: data.folderId,
          name: data.name,
          slug: data.name ? slug(data.name) : undefined,
        },
        select: todoMetadataSelect,
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          userId_name: API_ERROR_TODO_ALREADY_EXISTS,
          folderId_userId_name: API_ERROR_TODO_ALREADY_EXISTS,
        },
        update: API_ERROR_TODO_DOES_NOT_EXIST,
      })
    }
  })
}

export async function removeTodo(id: TodoMetadata['id'], userId: UserId) {
  await deleteFromCloudinaryByTag(id)

  try {
    return await prisma.todo.delete({ where: { id, userId } })
  } catch (error) {
    handleDbError(error, {
      delete: API_ERROR_TODO_DOES_NOT_EXIST,
    })
  }
}

type TodoMetadataGroupedByFolder = Map<TodoMetadata['folderId'], TodoMetadata[]>

type UpdateTodoData = Partial<Pick<TodoMetadata, 'name' | 'folderId'>>
