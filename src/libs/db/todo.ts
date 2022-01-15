import { FolderType, Todo } from '@prisma/client'
import slug from 'url-slug'

import { handleDbError, prisma } from 'libs/db'
import { API_ERROR_TODO_ALREADY_EXISTS } from 'libs/api/routes/errors'
import { validateFolder } from 'libs/db/folder'

export type TodoMetadata = Pick<Todo, 'id' | 'folderId' | 'name' | 'slug'>
export type TodoData = TodoMetadata

const todoMetadataSelect = { id: true, name: true, folderId: true, slug: true }

export async function addTodo(
  userId: UserId,
  name: TodoMetadata['name'],
  folderId?: TodoMetadata['folderId']
): Promise<TodoMetadata> {
  return prisma.$transaction(async (prisma) => {
    await validateFolder(folderId, userId, FolderType.TODO)

    try {
      return await prisma.todo.create({
        data: { userId, name, folderId, slug: slug(name) },
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

type TodoMetadataGroupedByFolder = Map<TodoMetadata['folderId'], TodoMetadata[]>
