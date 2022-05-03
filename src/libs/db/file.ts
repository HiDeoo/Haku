import { ContentType } from 'constants/contentType'
import { SEARCH_QUERY_MIN_LENGTH, SEARCH_RESULT_LIMIT } from 'constants/search'
import { ApiError, API_ERROR_SEARCH_QUERY_TOO_SHORT } from 'libs/api/routes/errors'
import { prisma } from 'libs/db'

export type FilesData = FileData[]
export interface FileData {
  id: string
  name: string
  slug: string
  type: ContentType
}

type InboxEntrySearchData = Omit<FileData, 'name' | 'slug' | 'type'> & { name: null; slug: null; type: 'INBOX' }

export type SearchResultData = (FileData | InboxEntrySearchData) & {
  excerpt: string
}

export type SearchResultsData = SearchResultData[]

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

export function searchFiles(userId: UserId, query: string, page?: string): Promise<SearchResultsData> {
  if (query.length < SEARCH_QUERY_MIN_LENGTH) {
    throw new ApiError(API_ERROR_SEARCH_QUERY_TOO_SHORT)
  }

  const offset = (page ? parseInt(page, 10) : 0) * SEARCH_RESULT_LIMIT

  return prisma.$queryRaw<SearchResultsData>`
WITH search AS (
  SELECT websearch_to_tsquery('simple', ${query}) AS query
)
SELECT
  results.id,
  results.name,
  results.slug,
  results.type,
  ts_headline('simple', results."content", search."query", 'StartSel=<strong>, StopSel=</strong>') AS "excerpt"
FROM
  (
    SELECT
      inboxEntry."id",
      NULL AS "name",
      NULL AS "slug",
      inboxEntry."text" AS "content",
      'INBOX' AS "type",
      ts_rank(inboxEntry."searchVector", search."query") AS "rank"
    FROM
      "InboxEntry" inboxEntry,
      search
    WHERE
      inboxEntry."userId" = ${userId}
      AND inboxEntry."searchVector" @@ search."query"
    UNION
    SELECT
      note."id",
      note."name",
      note."slug",
      note."text" AS "content",
      ${ContentType.NOTE} AS "type",
      ts_rank(note."searchVector", search."query") AS "rank"
    FROM
      "Note" note,
      search
    WHERE
      note."userId" = ${userId}
      AND note."searchVector" @@ search."query"
    UNION
    SELECT DISTINCT ON (todoAndTodoNode."id")
      *
    FROM
      (
        SELECT
          todo."id",
          todo."name",
          todo."slug",
          string_agg(coalesce(todoNode."content", '') || ' ' || coalesce(todoNode."noteText", ''), ' ') AS "content",
          ${ContentType.TODO} AS "type",
          MAX(
            coalesce(
              ts_rank(
                todo."searchVector", search."query"
              ),
              0
            ) + coalesce(
              ts_rank(
                todoNode."searchVector", search."query"
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
            todo."searchVector" @@ search."query"
            OR todoNode."searchVector" @@ search."query"
          )
        GROUP BY
          todo."id"
        ORDER BY
          "rank" DESC
      ) AS todoAndTodoNode
    ORDER BY
      "rank" DESC,
      "name" ASC NULLS LAST,
      "type" ASC,
      "id" ASC
    LIMIT ${SEARCH_RESULT_LIMIT}
    OFFSET ${offset}
  ) AS results,
  search`
}
