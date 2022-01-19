import { type TodoNode } from '@prisma/client'

import { handleDbError, prisma } from 'libs/db'
import { getTodoById, type TodoData } from 'libs/db/todo'
import {
  ApiError,
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT,
  API_ERROR_TODO_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST,
} from 'libs/api/routes/errors'
import { hasKey } from 'libs/object'

export type TodoNodeData = Pick<TodoNode, 'id' | 'content' | 'children'>

export function updateTodoNodes(todoId: TodoData['id'], userId: UserId, data: UpdateTodoNodesData): Promise<void> {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(todoId, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    await validateMutations(todoId, data)

    try {
      for (const { id, ...nodeUpdate } of Object.values(data.mutations.update)) {
        await prisma.todoNode.update({ data: nodeUpdate, where: { id } })
      }

      await prisma.todo.update({
        where: {
          id: todoId,
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

function getTodoNodes(todoId: TodoData['id']) {
  return prisma.todoNode.findMany({ where: { todoId } })
}

async function validateMutations(todoId: TodoData['id'], update: UpdateTodoNodesData) {
  const nodes = await getTodoNodes(todoId)

  const nodesMap = nodes.reduce<TodoNodeDataMap>((acc, node) => {
    acc[node.id] = node

    return acc
  }, {})

  update.rootNodes.forEach((rootNodeId) => {
    if (!hasKey(nodesMap, rootNodeId) && !hasKey(update.mutations.insert, rootNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST)
    }
  })

  update.mutations.delete.forEach((deletedTodoNodeId) => {
    if (!hasKey(nodesMap, deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST)
    } else if (hasKey(update.mutations.update, deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT)
    } else if (update.rootNodes.includes(deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
    }
  })

  for (const insertedTodoNode of Object.values(update.mutations.insert)) {
    insertedTodoNode.children.forEach((childrenId) => {
      if (!hasKey(nodesMap, childrenId) && !hasKey(update.mutations.insert, childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST)
      } else if (update.mutations.delete.includes(childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT)
      }
    })
  }

  for (const updatedTodoNode of Object.values(update.mutations.update)) {
    if (!hasKey(nodesMap, updatedTodoNode.id)) {
      throw new ApiError(API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST)
    }

    updatedTodoNode.children.forEach((childrenId) => {
      if (!hasKey(nodesMap, childrenId) && !hasKey(update.mutations.insert, childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST)
      } else if (update.mutations.delete.includes(childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT)
      }
    })
  }

  return
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
