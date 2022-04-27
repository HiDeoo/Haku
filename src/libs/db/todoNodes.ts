import { Prisma } from '@prisma/client'

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
  API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING,
  API_ERROR_TODO_NODE_ROOT_NODE_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_ROOT_NODE_EMPTY,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT,
  API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST,
  API_ERROR_TODO_NODE_UPDATE_DOES_NOT_EXIST,
} from 'libs/api/routes/errors'
import { isNonEmptyArray } from 'libs/array'
import { handleDbError, prisma } from 'libs/db'
import { getTodoById, type TodoMetadata } from 'libs/db/todo'
import { hasKey } from 'libs/object'

type TodoNodeDataWithChildren = Prisma.TodoNodeGetPayload<{ select: typeof todoNodeDataSelect }>
export type TodoNodeData = Omit<TodoNodeDataWithChildren, 'children'>

export interface TodoNodesData {
  children: TodoNodeChildrenMapWithRoot
  name: string
  nodes: TodoNodeDataMap
}

const todoNodeDataSelect = Prisma.validator<Prisma.TodoNodeSelect>()({
  id: true,
  children: true,
  collapsed: true,
  content: true,
  noteHtml: true,
  noteText: true,
  status: true,
})

export async function getTodoNodes(todoId: TodoMetadata['id'], userId: UserId): Promise<TodoNodesData> {
  const result = await prisma.todo.findFirst({
    where: { id: todoId, userId },
    select: {
      name: true,
      nodes: {
        select: todoNodeDataSelect,
      },
      root: true,
    },
  })

  if (!result) {
    throw new ApiError(API_ERROR_TODO_DOES_NOT_EXIST)
  }

  const [nodes, children] = getTodosNodesMapKeyedById(result.nodes)

  return { children: { ...children, root: result.root }, name: result.name, nodes }
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
        await prisma.todoNode.update({ data: { ...nodeUpdate, children: data.children[id] }, where: { id } })
      }

      await prisma.todo.update({
        where: {
          id: todoId,
        },
        data: {
          root: data.children.root,
          nodes: {
            createMany: {
              data: Object.values(data.mutations.insert).map((mutation) => ({
                ...mutation,
                children: data.children[mutation.id],
              })),
            },
            deleteMany: deletedNodeIds,
          },
          modifiedAt: new Date(),
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
  if (!isNonEmptyArray(update.children.root)) {
    throw new ApiError(API_ERROR_TODO_NODE_ROOT_NODE_EMPTY)
  }

  const nodes = await getTodoNodesByTodoId(todoId)
  const [nodesMap, children] = getTodosNodesMapKeyedById(nodes)

  update.children.root.forEach((rootId) => {
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
    } else if (update.children.root.includes(deletedTodoNodeId)) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_ROOT_NODE_CONFLICT)
    }

    const deletedNode = nodesMap[deletedTodoNodeId]
    const parentId = deletedNode?.parentId
    const updatedParentChildren = parentId ? update.children[parentId] : undefined

    if (
      (parentId && (!updatedParentChildren || updatedParentChildren.includes(deletedTodoNodeId))) ||
      (!parentId && update.children.root.includes(deletedTodoNodeId))
    ) {
      throw new ApiError(API_ERROR_TODO_NODE_DELETE_PARENT_NODE_CONFLICT)
    }

    getNestedTodoNodeIds(deletedTodoNodeId, nodesMap, children, deletedNodeIds)
  })

  for (const insertedTodoNode of Object.values(update.mutations.insert)) {
    if (
      (insertedTodoNode.noteHtml && !insertedTodoNode.noteText) ||
      (insertedTodoNode.noteText && !insertedTodoNode.noteHtml)
    ) {
      throw new ApiError(API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING)
    }

    update.children[insertedTodoNode.id]?.forEach((childrenId) => {
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
    } else if (
      (updatedTodoNode.noteHtml && !updatedTodoNode.noteText) ||
      (updatedTodoNode.noteText && !updatedTodoNode.noteHtml)
    ) {
      throw new ApiError(API_ERROR_TODO_NODE_NOTE_HTML_OR_TEXT_MISSING)
    }

    update.children[updatedTodoNode.id]?.forEach((childrenId) => {
      if (!hasKey(nodesMap, childrenId) && !hasKey(update.mutations.insert, childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_UPDATE_CHILD_DOES_NOT_EXIST)
      } else if (update.mutations.delete.includes(childrenId)) {
        throw new ApiError(API_ERROR_TODO_NODE_UPDATE_CHILD_DELETE_CONFLICT)
      }
    })
  }

  return deletedNodeIds
}

function getTodosNodesMapKeyedById(nodes: TodoNodeDataWithChildren[]): [TodoNodeDataMap, TodoNodeChildrenMap] {
  const nodesMap: TodoNodeDataMap = {}
  const childrenMap: TodoNodeChildrenMap = {}
  const parentNodesMap: Record<string, { parentId?: TodoNodeData['id'] }> = {}

  for (const node of nodes) {
    const { children, ...nodeWithoutChildren } = node

    nodesMap[node.id] = nodesMap[node.id]
      ? { ...nodesMap[node.id], ...nodeWithoutChildren }
      : parentNodesMap[node.id]
      ? { ...parentNodesMap[node.id], ...nodeWithoutChildren }
      : nodeWithoutChildren

    for (const child of children) {
      const childNode = nodesMap[child]

      if (childNode) {
        nodesMap[child] = { ...childNode, parentId: node.id }
      } else {
        parentNodesMap[child] = { parentId: node.id }
      }
    }

    childrenMap[node.id] = children
  }

  return [nodesMap, childrenMap]
}

function getNestedTodoNodeIds(
  id: TodoNodeData['id'],
  nodes: TodoNodeDataMap,
  children: TodoNodeChildrenMap,
  ids: DeletedTodoNodeIds
) {
  const deletedNode = nodes[id]

  if (deletedNode) {
    ids.push({ id })

    const deletedNodeChildren = children[id]

    if (deletedNodeChildren) {
      for (const child of deletedNodeChildren) {
        getNestedTodoNodeIds(child, nodes, children, ids)
      }
    }
  }

  return ids
}

type TodoNodeChildrenMap = Record<TodoNodeData['id'], TodoNodeDataWithChildren['children']>
export type TodoNodeChildrenMapWithRoot = TodoNodeChildrenMap & { root: TodoNodeData['id'][] }
export type TodoNodeDataWithParentId = TodoNodeData & { parentId?: TodoNodeData['id'] }
export type TodoNodeDataMap = Record<TodoNodeData['id'], TodoNodeDataWithParentId>

interface UpdateTodoNodesData {
  children: TodoNodeChildrenMapWithRoot
  mutations: {
    delete: TodoNodeData['id'][]
    insert: TodoNodeDataMap
    update: TodoNodeDataMap
  }
}

type DeletedTodoNodeIds = { id: TodoNodeData['id'] }[]
