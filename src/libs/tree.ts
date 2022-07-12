// The list should be ordered in such a way that the parent of a folder is always defined before its children.
export function hierarchicalListToTree<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  list: TFolder[],
  items: Map<TItem['folderId'], TItem[]>
): Tree<TFolder, TItem> {
  const hierarchyError = new Error('Unable to generate tree from an unordered hierarchical list')
  const indexMap: Record<string, number> = {}
  const tree: Tree<TFolder, TItem> = []
  let treeFolder: TreeFolder<TFolder, TItem>

  const clonedList = [...list]

  for (const [index, folder] of clonedList.entries()) {
    indexMap[folder.id] = index
    clonedList[index] = treeFolder = { ...folder, children: [], items: [] }

    if (!treeFolder.parentId) {
      addItemsToFolder(treeFolder, items)

      tree.push(treeFolder)
    } else {
      const parentIndex = indexMap[treeFolder.parentId]

      if (typeof parentIndex === 'undefined') {
        throw hierarchyError
      }

      const parent = clonedList[parentIndex]

      if (!parent || !isTreeFolder(parent)) {
        throw hierarchyError
      }

      addItemsToFolder(treeFolder, items)

      parent.children.push(treeFolder)
    }
  }

  addItemsToFolder(tree, items)

  return tree
}

export function isTreeFolder<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  folder?: TItem | TFolder | TreeFolder<TFolder, TItem>
): folder is TreeFolder<TFolder, TItem> {
  return typeof (folder as TreeFolder<TFolder, TItem>).children !== 'undefined'
}

export function assertIsTreeFolder<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  folder?: TItem | TreeFolder<TFolder, TItem>
): asserts folder is TreeFolder<TFolder, TItem> {
  if (!isTreeFolder(folder)) {
    throw new Error('Expected tree folder.')
  }
}

export function assertIsTreeItem<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  item?: TItem | TreeFolder<TFolder, TItem>
): asserts item is TreeFolder<TFolder, TItem> {
  if (isTreeFolder(item)) {
    throw new Error('Expected tree folder.')
  }
}

function addItemsToFolder<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  folder: TreeFolder<TFolder, TItem> | Tree<TFolder, TItem>,
  items: Map<TItem['folderId'], TItem[]>
) {
  const isRoot = Array.isArray(folder)
  const folderId = isRoot ? null : folder.id
  const folderItems = items.get(folderId)

  if (!folderItems) {
    return
  }

  if (isRoot) {
    folder.push(...folderItems)
  } else {
    folder.items.push(...folderItems)
  }
}

export interface HierarchicalListItem {
  id: string
  folderId: string | null
}

export interface HierarchicalListFolder {
  id: string
  parentId: string | null
}

export type TreeFolder<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem> = TFolder & {
  children: TreeFolder<TFolder, TItem>[]
  items: TItem[]
}

export type Tree<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem> = (
  | TreeFolder<TFolder, TItem>
  | TItem
)[]
