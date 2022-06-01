import { FolderType, Prisma } from '@prisma/client'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { getNotesMetadataGroupedByFolder, type NoteMetadata } from 'libs/db/note'
import { getTodosMetadataGroupedByFolder, type TodoMetadata } from 'libs/db/todo'
import { type HierarchicalListFolder, type HierarchicalListItem, hierarchicalListToTree, type Tree } from 'libs/tree'

type NoteTreeData = Tree<FolderData, NoteMetadata>
type TodoTreeData = Tree<FolderData, TodoMetadata>

export async function getNoteTree(userId: UserId): Promise<NoteTreeData> {
  const notesGroupedByFolder = await getNotesMetadataGroupedByFolder(userId)

  return getTree<FolderData, NoteMetadata>(userId, FolderType.NOTE, notesGroupedByFolder)
}

export async function getTodoTree(userId: UserId): Promise<TodoTreeData> {
  const todosGroupedByFolder = await getTodosMetadataGroupedByFolder(userId)

  return getTree<FolderData, TodoMetadata>(userId, FolderType.TODO, todosGroupedByFolder)
}

async function getTree<TFolder extends HierarchicalListFolder, TItem extends HierarchicalListItem>(
  userId: UserId,
  folderType: FolderType,
  items: Map<TItem['folderId'], TItem[]>
): Promise<Tree<TFolder, TItem>> {
  const folders = await getTreeFolders<TFolder>(userId, folderType)

  return hierarchicalListToTree(folders, items)
}

export async function getTreeChildrenFolderIds(
  userId: UserId,
  folderType: FolderType,
  folderId: FolderData['id']
): Promise<FolderData['id'][]> {
  const folders = await getTreeFolders(userId, folderType, folderId)

  return folders.map(({ id }) => id)
}

function getTreeFolders<TFolder extends HierarchicalListFolder>(
  userId: UserId,
  folderType: FolderType,
  baseFolderId?: TFolder['id']
): Promise<TFolder[]> {
  return prisma.$queryRaw<TFolder[]>`
WITH RECURSIVE root_to_leaf AS (
  SELECT
    "id",
    "parentId",
    "name",
    0 AS "level"
  FROM
    "Folder"
  WHERE
    ${baseFolderId ? Prisma.sql`"parentId" = ${baseFolderId}` : Prisma.sql`"parentId" IS NULL`}
    AND "type" = ${folderType}::"FolderType"
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
}
