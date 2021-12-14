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

type HierarchicalListItemId = string | number
export type HierarchicalListBaseItem = { id: HierarchicalListItemId; parentId: HierarchicalListItemId | null }

type TreeItem<T extends HierarchicalListBaseItem> = T & { children: TreeItem<T>[] }
export type Tree<T extends HierarchicalListBaseItem> = TreeItem<T>[]
