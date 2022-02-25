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
SELECT DISTINCT ON (todoAndTodoNode."id")
  *
FROM
  (
    SELECT
      todo."id",
      todo."name",
      todo."slug",
      ${ContentType.TODO} AS "type",
      (
        COALESCE(
          ts_rank(
            todo."searchVector",
            websearch_to_tsquery('simple', ${query})
          ),
          0
        ) + COALESCE(
          ts_rank(
            todoNode."searchVector",
            websearch_to_tsquery('simple', ${query})
          ),
          0
        )
      ) AS "rank"
    FROM
      "Todo" todo
      INNER JOIN "TodoNode" todoNode ON todoNode."todoId" = todo."id"
    WHERE
      todo."userId" = ${userId}
      AND (
        todo."searchVector" @@ websearch_to_tsquery('simple', ${query})
        OR todoNode."searchVector" @@ websearch_to_tsquery('simple', ${query})
      )
    ORDER BY
      "rank" DESC
  ) AS todoAndTodoNode
ORDER BY
  "rank" DESC,
  "name" ASC,
  "type" ASC`
}
