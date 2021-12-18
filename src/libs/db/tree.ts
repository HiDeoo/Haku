import { FolderType } from '@prisma/client'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'

export type NoteTreeData = Tree<NoteTreeItem>

export async function getNoteTree(userId: UserId): Promise<NoteTreeData> {
  return getTree(userId, FolderType.NOTE)
}

async function getTree<T extends HierarchicalListBaseItem>(userId: UserId, folderType: FolderType): Promise<Tree<T>> {
  const folders = await prisma.$queryRaw<T[]>`
WITH RECURSIVE root_to_leaf AS (
  SELECT
    "id",
    "parentId",
    "name",
    0 AS "level"
  FROM
    "Folder"
  WHERE
    "parentId" IS NULL
    AND "type" = ${folderType}
    AND "userId" = ${userId}

  UNION

  SELECT
    folder."id",
    folder."parentId",
    folder."name",
    parent."level" + 1
  FROM
    root_to_leaf parent
    INNER JOIN "Folder" folder ON folder."parentId" = parent."id"
)

SELECT
  *
FROM
  root_to_leaf
ORDER BY
  "level" ASC,
  "name" ASC`

  return hierarchicalListToTree(folders)
}

// The list should be ordered in such a way that the parent of an item is always defined before its children.
export function hierarchicalListToTree<T extends HierarchicalListBaseItem>(list: (T | TreeItem<T>)[]): Tree<T> {
  const hierarchyError = new Error('Unable to generate tree from an unordered hierarchical list')
  const indexMap: Record<HierarchicalListItemId, number> = {}
  const tree: TreeItem<T>[] = []
  let treeItem: TreeItem<T>

  const clonedList = [...list]

  clonedList.forEach((item, index) => {
    indexMap[item.id] = index
    clonedList[index] = treeItem = { ...item, children: [] }

    if (!treeItem.parentId) {
      tree.push(treeItem)
    } else {
      const parentIndex = indexMap[treeItem.parentId]

      if (typeof parentIndex === 'undefined') {
        throw hierarchyError
      }

      const parent = clonedList[parentIndex]

      if (!parent || !isHierarchicalTreeItem(parent)) {
        throw hierarchyError
      }

      parent.children.push(treeItem)
    }
  })

  return tree
}

function isHierarchicalTreeItem<T extends HierarchicalListBaseItem>(item: T | TreeItem<T>): item is TreeItem<T> {
  return typeof (item as TreeItem<T>).children !== 'undefined'
}

type NoteTreeItem = FolderData & { level: number }

type HierarchicalListItemId = string | number
type HierarchicalListBaseItem = { id: HierarchicalListItemId; parentId: HierarchicalListItemId | null }

type TreeItem<T extends HierarchicalListBaseItem> = T & { children: TreeItem<T>[] }
type Tree<T extends HierarchicalListBaseItem> = TreeItem<T>[]
