import { Prisma } from '@prisma/client'

import { ContentType } from 'constants/contentType'
import { prisma } from 'libs/db'

export interface HistoryData {
  notes: HistoryNoteData[]
  todos: HistoryTodoData[]
}

type HistoryNoteData = Prisma.NoteGetPayload<{ select: typeof noteHistoryDataSelect }>
type HistoryTodoData = Prisma.TodoGetPayload<{ select: typeof todoHistoryDataSelect }>

const noteHistoryDataSelect = Prisma.validator<Prisma.NoteSelect>()({
  id: true,
  name: true,
  slug: true,
})

const todoHistoryDataSelect = Prisma.validator<Prisma.TodoSelect>()({
  id: true,
  name: true,
  slug: true,
})

export const HISTORY_RESULT_LIMIT_PER_TYPE = 10

export async function getHistory(userId: UserId): Promise<HistoryData> {
  const results = await prisma.$queryRaw<
    ((HistoryNoteData & { type: ContentType.NOTE }) | (HistoryTodoData & { type: ContentType.TODO }))[]
  >`
(SELECT
  "id",
  "name",
  "slug",
  ${ContentType.NOTE} AS "type"
FROM
  "Note"
WHERE
  "userId" = ${userId}
ORDER BY
  "modifiedAt" DESC
LIMIT ${HISTORY_RESULT_LIMIT_PER_TYPE})
UNION ALL
(SELECT
  "id",
  "name",
  "slug",
  ${ContentType.TODO} AS "type"
FROM
  "Todo"
WHERE
  "userId" = ${userId}
ORDER BY
  "modifiedAt" DESC
LIMIT ${HISTORY_RESULT_LIMIT_PER_TYPE})`

  const history: HistoryData = { notes: [], todos: [] }

  for (const result of results) {
    const { type, ...resultWithoutType } = result

    if (type === ContentType.NOTE) {
      history.notes.push(resultWithoutType)
    } else {
      history.todos.push(resultWithoutType)
    }
  }

  return history
}
