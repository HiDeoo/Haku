import { Prisma } from '@prisma/client'
import { type Sql } from '@prisma/client/runtime'
import { TRPCError } from '@trpc/server'

import { ContentType, SearchableContentType } from 'constants/contentType'
import { API_ERROR_SEARCH_REQUIRES_AT_LEAST_ONE_TYPE } from 'constants/error'
import { isEmpty } from 'libs/array'
import { prisma } from 'libs/db'

export type FilesData = FileData[]
export interface FileData {
  id: string
  name: string
  slug: string
  type: ContentType
}

type InboxEntrySearchData = Omit<FileData, 'name' | 'slug' | 'type'> & {
  name: null
  slug: null
  type: typeof SearchableContentType.INBOX
}

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

export function searchFiles(userId: UserId, query: string, types: SearchContentType): Promise<SearchResultsData> {
  const subQueries: Sql[] = []

  if (types.NOTE) {
    subQueries.push(Prisma.sql`
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
  AND note."searchVector" @@ search."query"`)
  }

  if (types.TODO) {
    subQueries.push(Prisma.sql`
SELECT
  *
FROM
  (
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
  ) AS todoAndTodoNodes`)
  }

  if (types.INBOX) {
    subQueries.push(Prisma.sql`
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
  AND inboxEntry."searchVector" @@ search."query"`)
  }

  if (isEmpty(subQueries)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: API_ERROR_SEARCH_REQUIRES_AT_LEAST_ONE_TYPE })
  }

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
    ${Prisma.join(subQueries, ' UNION ')}
    ORDER BY
      "rank" DESC,
      "name" ASC NULLS LAST,
      "type" ASC,
      "id" ASC
  ) AS results,
  search`
}

export interface SearchContentType {
  [SearchableContentType.INBOX]: boolean
  [SearchableContentType.NOTE]: boolean
  [SearchableContentType.TODO]: boolean
}
