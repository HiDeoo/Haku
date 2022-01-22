import { type TodoNode } from '@prisma/client'

import { handleDbError, prisma } from 'libs/db'
import { getTodoById, type TodoMetadata } from 'libs/db/todo'
import {
  ApiError,
  API_ERROR_TODO_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ALREADY_EXISTS,
  API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT,
  API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT,
  API_ERROR_TODO_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_INSERT_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_INSERT_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_EMPTY,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST,
} from 'libs/api/routes/errors'
import { hasKey } from 'libs/object'

export type TodoNodeData = Pick<TodoNode, 'id' | 'content' | 'children'>

export interface TodoNodesData {
  root: TodoNodeData['id'][]
  nodes: TodoNodeDataMap
}

const todoNodeDataSelect = { id: true, content: true, children: true }

export async function getTodoNodes(todoId: TodoMetadata['id'], userId: UserId): Promise<TodoNodesData> {
  const result = await prisma.todo.findFirst({
    where: { id: todoId, userId },
    select: {
      nodes: {
        select: todoNodeDataSelect,
      },
      root: true,
    },
  })

  if (!result) {
    throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
  }

  return { nodes: getTodosNodesMapKeyedById(result.nodes), root: result.root }
}

export function updateTodoNodes(todoId: TodoMetadata['id'], userId: UserId, data: UpdateTodoNodesData): Promise<void> {
  return prisma.$transaction(async (prisma) => {
    const todo = await getTodoById(todoId, userId)

    if (!todo) {
      throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
    }

    const deletedNodeIds = await validateMutations(todoId, data)

    try {
      for (const { id, ...nodeUpdate } of Object.values(data.mutations.update)) {
        await prisma.todoNode.update({ data: nodeUpdate, where: { id } })
      }

      await prisma.todo.update({
        where: {
          id: todoId,
        },
        data: {
          root: data.root,
          nodes: {
            createMany: {
              data: Object.values(data.mutations.insert),
            },
            deleteMany: deletedNodeIds,
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

function getTodoNodesByTodoId(todoId: TodoMetadata['id']) {
  return prisma.todoNode.findMany({ where: { todoId } })
}

async function validateMutations(todoId: TodoMetadata['id'], update: UpdateTodoNodesData): Promise<DeletedTodoNodeIds> {
  if (update.root.length === 0) {
    throw new ApiError(API_ERROR_TODO_NODE_ROOT_NODE_EMPTY)
  }

  const nodes = await getTodoNodesByTodoId(todoId)
  const nodesMap = getTodosNodesMapKeyedById(nodes)

  update.root.forEach((rootId) => {
    if (!hasKey(nodesMap, rootId) && !hasKey(update.mutations.insert, rootId)) {
      throw new ApiError(API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST)
    }
  })

  const deletedNodeIds: DeletedTodoNodeIds = []

  update.mutations.delete.forEach((deletedTodoNodeId) => {
    if (!hasKey(nodesMap, deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_DOES_NOT_EXIST)
    } else if (hasKey(update.mutations.update, deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_UPDATE_CONFLICT)
    } else if (update.root.includes(deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
    }

    const deletedNode = nodesMap[deletedTodoNodeId]
    const parentId = deletedNode?.parentId
    const updatedParent = parentId ? (update.mutations.update as TodoNodeDataMap)[parentId] : undefined

    if (
      (parentId && (!updatedParent || updatedParent.children.includes(deletedTodoNodeId))) ||
      (!parentId && update.root.includes(deletedTodoNodeId))
    ) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT)
    }

    getNestedTodoNodeIds(deletedTodoNodeId, nodesMap, deletedNodeIds)
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

  return deletedNodeIds
}

function getTodosNodesMapKeyedById(nodes: TodoNodeData[]): TodoNodeDataMap {
  const nodesMap: TodoNodeDataMap = {}
  const parentNodesMap: Record<string, { parentId?: TodoNodeData['id'] }> = {}

  for (const node of nodes) {
    nodesMap[node.id] = nodesMap[node.id]
      ? { ...nodesMap[node.id], ...node }
      : parentNodesMap[node.id]
      ? { ...parentNodesMap[node.id], ...node }
      : node

    for (const child of node.children) {
      const childNode = nodesMap[child]

      if (childNode) {
        nodesMap[child] = { ...childNode, parentId: node.id }
      } else {
        parentNodesMap[child] = { parentId: node.id }
      }
    }
  }

  return nodesMap
}

function getNestedTodoNodeIds(id: TodoNodeData['id'], nodes: TodoNodeDataMap, ids: DeletedTodoNodeIds) {
  const deletedNode = nodes[id]

  if (deletedNode) {
    ids.push({ id })

    if (deletedNode.children) {
      for (const child of deletedNode.children) {
        getNestedTodoNodeIds(child, nodes, ids)
      }
    }
  }

  return ids
}

type TodoNodeDataMap = Record<TodoNodeData['id'], TodoNodeData & { parentId?: TodoNodeData['id'] }>

interface UpdateTodoNodesData {
  mutations: {
    delete: TodoNodeData['id'][]
    insert: TodoNodeDataMap
    update: TodoNodeDataMap
  }
  root: TodoNodeData['id'][]
}

type DeletedTodoNodeIds = { id: TodoNodeData['id'] }[]
