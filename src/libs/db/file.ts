import { ContentType } from 'constants/contentType'
import { ApiError, API_ERROR_SEARCH_QUERY_TOO_SHORT } from 'libs/api/routes/errors'
import { prisma } from 'libs/db'

export type FilesData = FileData[]
export interface FileData {
  id: string
  name: string
  slug: string
  type: ContentType
}

// Number of maximum results to return per search query.
const searchResultLimit = 25

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

export function searchFiles(userId: UserId, query: string, page?: string): Promise<FilesData> {
  if (query.length < 3) {
    throw new ApiError(API_ERROR_SEARCH_QUERY_TOO_SHORT)
  }

  const offset = (page ? parseInt(page, 10) : 0) * searchResultLimit

  return prisma.$queryRaw<FilesData>`
WITH search AS (
  SELECT websearch_to_tsquery('simple', ${query}) AS query
)
SELECT
  note."id",
  note."name",
  note."slug",
  ${ContentType.NOTE} AS "type",
  ts_rank(note."searchVector", search.query) AS "rank"
FROM
  "Note" note,
  search
WHERE
  note."userId" = ${userId}
  AND note."searchVector" @@ search.query
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
            todo."searchVector", search.query
          ),
          0
        ) + COALESCE(
          ts_rank(
            todoNode."searchVector", search.query
          ),
          0
        )
      ) AS "rank"
    FROM
      "Todo" todo
      INNER JOIN "TodoNode" todoNode ON todoNode."todoId" = todo."id",
      search
    WHERE
      todo."userId" = ${userId}
      AND (
        todo."searchVector" @@ search.query
        OR todoNode."searchVector" @@ search.query
      )
    ORDER BY
      "rank" DESC
  ) AS todoAndTodoNode
ORDER BY
  "rank" DESC,
  "name" ASC,
  "type" ASC,
  "id" ASC
LIMIT ${searchResultLimit}
OFFSET ${offset}`
}
