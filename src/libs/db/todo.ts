import { FolderType, Prisma, type Todo } from '@prisma/client'
import slug from 'url-slug'

import { ApiError, API_ERROR_TODO_ALREADY_EXISTS, API_ERROR_TODO_DOES_NOT_EXIST } from 'libs/api/routes/errors'
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
  folderId?: TodoMetadata['folderId']
): Promise<TodoMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId, FolderType.TODO)

    try {
      const todoNode = await prisma.todoNode.create({ data: { content: '' } })

      return await prisma.todo.create({
        data: {
          userId,
          name,
          folderId,
          root: [todoNode.id],
          slug: slug(name),
          nodes: {
            connect: [{ id: todoNode.id }],
          },
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

  metaDatas.forEach((todo) => {
    todoMetadataGroupedByFolder.set(todo.folderId, [...(todoMetadataGroupedByFolder.get(todo.folderId) ?? []), todo])
  })

  return todoMetadataGroupedByFolder
}

export function updateTodo(id: TodoMetadata['id'], userId: UserId, data: UpdateTodoData): Promise<TodoMetadata> {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(id, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    await validateFolder(data.folderId, userId, FolderType.TODO)

    try {
      return await prisma.todo.update({
        where: {
          id,
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
      })
    }
  })
}

export function removeTodo(id: TodoMetadata['id'], userId: UserId) {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(id, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    await deleteFromCloudinaryByTag(id)

    return prisma.todo.delete({ where: { id } })
  })
}

export function getTodoById(id: Todo['id'], userId: UserId): Promise<Todo | null> {
  return prisma.todo.findFirst({ where: { id, userId } })
}

type TodoMetadataGroupedByFolder = Map<TodoMetadata['folderId'], TodoMetadata[]>

type UpdateTodoData = Partial<Pick<TodoMetadata, 'name' | 'folderId'>>
