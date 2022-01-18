import { type TodoNode } from '@prisma/client'

import { handleDbError, prisma } from 'libs/db'
import { getTodoById, type TodoData } from 'libs/db/todo'
import {
  ApiError,
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DOES_NOT_EXIST,
} from 'libs/api/routes/errors'

export type TodoNodeData = Pick<TodoNode, 'id' | 'content'>

export function updateTodoNodes(id: TodoData['id'], userId: UserId, data: UpdateTodoNodesData): Promise<void> {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(id, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    try {
      for (const { id, ...nodeUpdate } of Object.values(data.mutations.update)) {
        await prisma.todoNode.update({ data: nodeUpdate, where: { id } })
      }

      await prisma.todo.update({
        where: {
          id,
        },
        data: {
          rootNodes: data.rootNodes,
          nodes: {
            createMany: {
              data: Object.values(data.mutations.insert),
            },
            deleteMany: data.mutations.delete.map((id) => ({ id })),
          },
        },
      })
    } catch (error) {
      handleDbError(error, {
        unique: {
          id: API_ERROR_TODO_NODE_ALREADY_EXISTS,
        },
        update: API_ERROR_TODO_NODE_DOES_NOT_EXIST,
      })
    }
  })
}

type TodoNodeDataMap = Record<TodoNodeData['id'], TodoNodeData>

interface UpdateTodoNodesData {
  mutations: {
    delete: TodoNodeData['id'][]
    insert: TodoNodeDataMap
    update: TodoNodeDataMap
  }
  rootNodes: TodoNodeData['id'][]
}
