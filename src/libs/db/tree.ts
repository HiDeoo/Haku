import { FolderType } from '@prisma/client'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'

export type NoteTreeData = Tree<NoteTreeItem>

export async function getNoteTree(userId: UserId): Promise<NoteTreeData> {
  return getTree(userId, FolderType.NOTE)
}

async function getTree<Item extends HierarchicalListBaseItem>(
  userId: UserId,
  folderType: FolderType
): Promise<Tree<Item>> {
  const folders = await prisma.$queryRaw<Item[]>`
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
export function hierarchicalListToTree<Item extends HierarchicalListBaseItem>(
  list: (Item | TreeItem<Item>)[]
): Tree<Item> {
  const hierarchyError = new Error('Unable to generate tree from an unordered hierarchical list')
  const indexMap: Record<HierarchicalListItemId, number> = {}
  const tree: TreeItem<Item>[] = []
  let treeItem: TreeItem<Item>

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

function isHierarchicalTreeItem<Item extends HierarchicalListBaseItem>(
  item: Item | TreeItem<Item>
): item is TreeItem<Item> {
  return typeof (item as TreeItem<Item>).children !== 'undefined'
}

type NoteTreeItem = FolderData & { level: number }

type HierarchicalListItemId = string | number
type HierarchicalListBaseItem = { id: HierarchicalListItemId; parentId: HierarchicalListItemId | null }

type TreeItem<Item extends HierarchicalListBaseItem> = Item & { children: TreeItem<Item>[] }
type Tree<Item extends HierarchicalListBaseItem> = TreeItem<Item>[]
