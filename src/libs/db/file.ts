import { ContentType } from 'constants/contentType'
import { prisma } from 'libs/db'

export type FilesData = FileData[]
export interface FileData {
  id: string
  name: string
  slug: string
  type: ContentType
}

export function getFiles(userId: UserId): Promise<FilesData> {
  return prisma.$queryRaw<FilesData>`
SELECT
  "id",
  "name",
  "slug",
  ${ContentType.NOTE} AS "type"
FROM
  "Note"
WHERE
  "userId" = ${userId}
UNION
SELECT
  "id",
  "name",
  "slug",
  ${ContentType.TODO} AS "type"
FROM
  "Todo"
WHERE
  "userId" = ${userId}
ORDER BY
  "name" ASC`
}

export function searchFiles(userId: UserId, query: string): Promise<FilesData> {
  return prisma.$queryRaw<FilesData>`
SELECT
  "id",
  "name",
  "slug",
  ${ContentType.NOTE} AS "type",
  ts_rank("searchVector", websearch_to_tsquery('simple', ${query})) AS "rank"
FROM
  "Note"
WHERE
  "userId" = ${userId}
  AND "searchVector" @@ websearch_to_tsquery('simple', ${query})
UNION
SELECT
  "id",
  "name",
  "slug",
  ${ContentType.TODO} AS "type",
  ts_rank("searchVector", websearch_to_tsquery('simple', ${query})) AS "rank"
FROM
  "Todo"
WHERE
  "userId" = ${userId}
  AND "searchVector" @@ websearch_to_tsquery('simple', ${query})
ORDER BY
  "rank" DESC,
  "name" ASC`
}
