import { FolderType, Prisma } from '@prisma/client'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { getNotesMetaDataGroupedByFolder, type NoteMetaData } from 'libs/db/note'
import { type TodoMetaData } from 'libs/db/todo'
import { type HierarchicalListFolder, type HierarchicalListItem, hierarchicalListToTree, type Tree } from 'libs/tree'

export type NoteTreeData = Tree<FolderData, NoteMetaData>
export type TodoTreeData = Tree<FolderData, TodoMetaData>

export async function getNoteTree(userId: UserId): Promise<NoteTreeData> {
  const notesGroupedByFolder = await getNotesMetaDataGroupedByFolder(userId)

  return getTree<FolderData, NoteMetaData>(userId, FolderType.NOTE, notesGroupedByFolder)
}

async function getTree<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  userId: UserId,
  folderType: FolderType,
  items: Map<Item['folderId'], Item[]>
): Promise<Tree<Folder, Item>> {
  const folders = await getTreeFolders<Folder>(userId, folderType)

  return hierarchicalListToTree(folders, items)
}

export async function getTreeChildrenFolderIds(
  userId: UserId,
  folderType: FolderType,
  folderId: number
): Promise<FolderData['id'][]> {
  const folders = await getTreeFolders(userId, folderType, folderId)

  return folders.map(({ id }) => id)
}

function getTreeFolders<Folder extends HierarchicalListFolder>(
  userId: UserId,
  folderType: FolderType,
  baseFolderId?: Folder['id']
): Promise<Folder[]> {
  return prisma.$queryRaw<Folder[]>`
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
}
