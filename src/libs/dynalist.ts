import { TodoNodeStatus } from '@prisma/client'
import cuid from 'cuid'
import { decode } from 'html-entities'
import markdownToTxt from 'markdown-to-txt'
import { opmlToJSON, type opmlToJsonResult } from 'opml-to-json'

import {
  ApiError,
  API_ERROR_IMPORT_DYNALIST_INVALID_OPML,
  API_ERROR_TODO_NODE_ROOT_NODE_EMPTY,
} from 'libs/api/routes/errors'
import { type TodoNodeDataMap, type TodoNodeChildrenMapWithRoot, type TodoNodeData } from 'libs/db/todoNodes'

export async function getTodoFromDynalistOpml(opml: string): Promise<TodoFromDynalistOpml> {
  try {
    const json = await opmlToJSON(opml)

    const rootNode = json.children[0]

    if (
      !rootNode ||
      json.children.length !== 1 ||
      !isValidTodoNodeDynalistOpml(rootNode) ||
      rootNode.text.length === 0
    ) {
      throw new Error('Invalid Dynalist OPML root todo node.')
    }

    const children: TodoFromDynalistOpml['children'] = { root: [] }
    const nodes: TodoNodeDataMap = {}

    getTodoNodesFromDynalistOpml(rootNode, children, nodes)

    if (Object.keys(nodes).length === 0) {
      throw new ApiError(API_ERROR_TODO_NODE_ROOT_NODE_EMPTY)
    }

    return { children, name: `${rootNode.text} (Dynalist ${Date.now()})`, nodes }
  } catch (error) {
    throw new ApiError(API_ERROR_IMPORT_DYNALIST_INVALID_OPML)
  }
}

function getTodoNodesFromDynalistOpml(
  node: TodoNodeDynalistOpml,
  children: TodoFromDynalistOpml['children'],
  nodes: TodoNodeDataMap,
  parentId?: TodoNodeData['id']
) {
  node.children?.forEach((child) => {
    if (!isValidTodoNodeDynalistOpml(child)) {
      throw new Error('Invalid Dynalist OPML todo node.')
    }

    const id = cuid()

    const pId = parentId ?? 'root'
    children[pId]?.push(id)

    children[id] = []

    let note: string | null = null

    if (child._note && child._note.length > 0) {
      note = markdownToTxt(decode(child._note))
    }

    nodes[id] = {
      collapsed: child.collapsed === 'true',
      content: child.text,
      id,
      noteHtml: note,
      noteText: note,
      status: child.complete === 'true' ? TodoNodeStatus.COMPLETED : TodoNodeStatus.ACTIVE,
    }

    getTodoNodesFromDynalistOpml(child, children, nodes, id)
  })
}

function isValidTodoNodeDynalistOpml(todoNodeDynalistOpml: unknown): todoNodeDynalistOpml is TodoNodeDynalistOpml {
  if (
    !todoNodeDynalistOpml ||
    typeof todoNodeDynalistOpml !== 'object' ||
    typeof (todoNodeDynalistOpml as TodoNodeDynalistOpml).text !== 'string'
  ) {
    return false
  }

  if (
    typeof (todoNodeDynalistOpml as TodoNodeDynalistOpml).children !== 'undefined' &&
    !Array.isArray((todoNodeDynalistOpml as TodoNodeDynalistOpml).children)
  ) {
    return false
  }

  return true
}

interface TodoFromDynalistOpml {
  children: TodoNodeChildrenMapWithRoot
  name: string
  nodes: TodoNodeDataMap
}

interface TodoNodeDynalistOpml {
  children?: opmlToJsonResult['children']
  collapsed?: 'true'
  complete?: 'true'
  _note?: string
  text: string
}
