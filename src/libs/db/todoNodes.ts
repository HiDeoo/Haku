import { type TodoNode } from '@prisma/client'

import { prisma } from 'libs/db'
import { getTodoById, type TodoData } from 'libs/db/todo'
import { ApiError, API_ERROR_TODO_DOES_NOT_EXIST } from 'libs/api/routes/errors'

export type TodoNodeData = Pick<TodoNode, 'id' | 'content'>

export function updateTodoNodes(id: TodoData['id'], userId: UserId, data: UpdateTodoNodesData): Promise<void> {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(id, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    try {
      await prisma.todo.update({
        where: {
          id,
        },
        data: {
          rootNodes: {
            set: data.rootNodes,
          },
        },
      })
    } catch (error) {
      // TODO(HiDeoo)
      console.log('error ', error)
    }
  })
}

interface UpdateTodoNodesData {
  // mutations: {
  //   delete: TodoNodeData[]
  //   insert: TodoNodeData[]
  //   update: TodoNodeData[]
  // }
  rootNodes: TodoNodeData['id'][]
}
