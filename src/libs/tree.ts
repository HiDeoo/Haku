// The list should be ordered in such a way that the parent of a folder is always defined before its children.
export function hierarchicalListToTree<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  list: Folder[],
  items: Map<Item['folderId'], Item[]>
): Tree<Folder, Item> {
  const hierarchyError = new Error('Unable to generate tree from an unordered hierarchical list')
  const indexMap: Record<number, number> = {}
  const tree: Tree<Folder, Item> = []
  let treeFolder: TreeFolder<Folder, Item>

  const clonedList = [...list]

  clonedList.forEach((folder, index) => {
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
  })

  addItemsToFolder(tree, items)

  return tree
}

export function isTreeFolder<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  folder?: Item | Folder | TreeFolder<Folder, Item>
): folder is TreeFolder<Folder, Item> {
  return typeof (folder as TreeFolder<Folder, Item>).children !== 'undefined'
}

export function assertIsTreeFolder<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  folder?: Item | TreeFolder<Folder, Item>
): asserts folder is TreeFolder<Folder, Item> {
  if (!isTreeFolder(folder)) {
    throw new Error('Expected tree folder.')
  }
}

export function assertIsTreeItem<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  item?: Item | TreeFolder<Folder, Item>
): asserts item is TreeFolder<Folder, Item> {
  if (isTreeFolder(item)) {
    throw new Error('Expected tree folder.')
  }
}

function addItemsToFolder<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  folder: TreeFolder<Folder, Item> | Tree<Folder, Item>,
  items: Map<Item['folderId'], Item[]>
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

export type HierarchicalListItem = { id: number; folderId: number | null }
export type HierarchicalListFolder = { id: number; parentId: number | null }

export type TreeFolder<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem> = Folder & {
  children: TreeFolder<Folder, Item>[]
  items: Item[]
}

export type Tree<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem> = (
  | TreeFolder<Folder, Item>
  | Item
)[]
