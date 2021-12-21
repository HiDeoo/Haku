import { FolderType } from '@prisma/client'

import { prisma } from 'libs/db'
import { type FolderData } from 'libs/db/folder'
import { getNotesGroupedByFolder, type NoteData } from 'libs/db/note'
import { type HierarchicalListFolder, type HierarchicalListItem, hierarchicalListToTree, type Tree } from 'libs/tree'

export type NoteTreeData = Tree<FolderData, NoteData>

export async function getNoteTree(userId: UserId): Promise<NoteTreeData> {
  const notesGroupedByFolder = await getNotesGroupedByFolder(userId)

  return getTree<FolderData, NoteData>(userId, FolderType.NOTE, notesGroupedByFolder)
}

async function getTree<Folder extends HierarchicalListFolder, Item extends HierarchicalListItem>(
  userId: UserId,
  folderType: FolderType,
  items: Map<Item['folderId'], Item[]>
): Promise<Tree<Folder, Item>> {
  const folders = await prisma.$queryRaw<Folder[]>`
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

  return hierarchicalListToTree(folders, items)
}
