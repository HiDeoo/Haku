import { Todo } from '@prisma/client'

import { prisma } from 'libs/db'

export type TodoMetadata = Pick<Todo, 'id' | 'folderId' | 'name' | 'slug'>
export type TodoData = TodoMetadata

const todoMetadataSelect = { id: true, name: true, folderId: true, slug: true }

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
