import { Folder } from '@prisma/client'

import { prisma } from 'libs/db'
import { hierarchicalListToTree, type Tree } from 'libs/tree'

// TODO(HiDeoo) user id
// TODO(HiDeoo) type
export async function getNoteTree(userId: UserId): Promise<NoteTree> {
  const folders = await prisma.$queryRaw<NoteTreeItem[]>`
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

type NoteTreeItem = Pick<Folder, 'id' | 'parentId' | 'name'> & { level: number }
export type NoteTree = Tree<NoteTreeItem>
