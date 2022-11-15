import { faker } from '@faker-js/faker'

import { SearchableContentType } from 'constants/contentType'
import { API_ERROR_SEARCH_REQUIRES_AT_LEAST_ONE_TYPE } from 'constants/error'
import { SEARCH_QUERY_MIN_LENGTH } from 'constants/search'
import { type SearchContentType, type SearchResultsData } from 'libs/db/file'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestInboxEntry, createTestNote, createTestTodo, createTestTodoNode } from 'tests/api/db'

const allSearchFilesTypes: SearchContentType = {
  [SearchableContentType.INBOX]: true,
  [SearchableContentType.NOTE]: true,
  [SearchableContentType.TODO]: true,
}

const mixedSearchFilesTypes = [
  {
    label: 'note, todo & inbox',
    searchFilesTypes: allSearchFilesTypes,
  },
  {
    label: 'only note',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: false,
      [SearchableContentType.NOTE]: true,
      [SearchableContentType.TODO]: false,
    },
  },
  {
    label: 'only todo',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: false,
      [SearchableContentType.NOTE]: false,
      [SearchableContentType.TODO]: true,
    },
  },
  {
    label: 'only inbox',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: true,
      [SearchableContentType.NOTE]: false,
      [SearchableContentType.TODO]: false,
    },
  },
  {
    label: 'only note & todo',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: false,
      [SearchableContentType.NOTE]: true,
      [SearchableContentType.TODO]: true,
    },
  },
  {
    label: 'only note & inbox',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: true,
      [SearchableContentType.NOTE]: true,
      [SearchableContentType.TODO]: false,
    },
  },
  {
    label: 'only todo & inbox',
    searchFilesTypes: {
      [SearchableContentType.INBOX]: true,
      [SearchableContentType.NOTE]: false,
      [SearchableContentType.TODO]: true,
    },
  },
]

describe('search', () => {
  test(`should require a search query of at least ${SEARCH_QUERY_MIN_LENGTH} characters long`, () =>
    testApiRoute(async ({ caller }) => {
      await expect(() => caller.search({ q: 'ab', types: allSearchFilesTypes })).rejects.toThrow()
    }))

  test('should return an empty list of result', () =>
    testApiRoute(async ({ caller }) => {
      await createTestNote()
      await createTestTodo()

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(0)
    }))

  test('should return an inbox entry with a text matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestInboxEntry({ text: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
      expect(res[0]?.type).toBe('INBOX')
    }))

  test('should return a note with a name matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestNote({ name: 'amazing name' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a note with a text matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestNote({ data: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a todo with a name matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestTodo({ name: 'amazing name' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a todo with a todo node content matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestTodo()
      await createTestTodoNode({ todoId: id, content: 'amazing content' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a todo with a todo node note matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestTodo()
      await createTestTodoNode({ todoId: id, noteText: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a single note with a name & content matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestNote({ name: 'amazing name', data: 'amazing content' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return a single todo with a name, todo node content & notes matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestTodo({ name: 'amazing name' })
      await createTestTodoNode({ todoId: id, content: 'amazing text' })
      await createTestTodoNode({ todoId: id })
      await createTestTodoNode({ todoId: id, noteText: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
    }))

  test('should return only items owned by the current user', () =>
    testApiRoute(async ({ caller }) => {
      const { userId: userId1 } = getTestUser('1')

      const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })
      await createTestTodo({ name: 'amazing name', userId: userId1 })

      const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
      await createTestNote({ name: 'amazing name', userId: userId1 })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing text' })
      await createTestInboxEntry({ text: 'amazing name', userId: userId1 })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(3)

      expect(res[0]?.id).toBe(note_0_id)
      expect(res[1]?.id).toBe(todo_0_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
    }))

  test('should return items matching the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
      await createTestNote()
      const { id: note_2_id } = await createTestNote({ name: 'note_2', data: 'amazing text' })

      await createTestTodo()
      const { id: todo_1_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_2_id } = await createTestTodo({ name: 'todo_2' })
      await createTestTodoNode({ todoId: todo_2_id, content: 'amazing content' })
      const { id: todo_3_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_3_id })
      const { id: todo_4_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_4_id, noteText: 'amazing text' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing text' })
      await createTestInboxEntry()

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(6)

      expect(res[0]?.id).toBe(note_0_id)
      expect(res[1]?.id).toBe(todo_1_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(res[3]?.id).toBe(note_2_id)
      expect(res[4]?.id).toBe(todo_2_id)
      expect(res[5]?.id).toBe(todo_4_id)
    }))

  test('should prioritize items with a match in the name', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'note_0', data: 'amazing text' })
      const { id: note_1_id } = await createTestNote({ name: 'amazing name' })

      const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_1_id } = await createTestTodo({ name: 'todo_1' })
      await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(5)

      expect(res[0]?.id).toBe(note_1_id)
      expect(res[1]?.id).toBe(todo_0_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(res[3]?.id).toBe(note_0_id)
      expect(res[4]?.id).toBe(todo_1_id)
    }))

  test('should prioritize items with multiples matches', () =>
    testApiRoute(async ({ caller }) => {
      const { id: todo_0_id } = await createTestTodo({ name: 'amazing name 0' })

      const { id: todo_1_id } = await createTestTodo({ name: 'amazing name 1' })
      await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

      const { id: todo_2_id } = await createTestTodo({ name: 'amazing name 2' })
      await createTestTodoNode({ todoId: todo_2_id, content: 'amazing content', noteText: 'amazing text' })

      const { id: note_0_id } = await createTestNote({ data: 'amazing text' })
      const { id: note_1_id } = await createTestNote({ name: 'amazing name', data: 'amazing text' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(6)

      expect(res[0]?.id).toBe(todo_2_id)
      expect(res[1]?.id).toBe(todo_1_id)
      expect(res[2]?.id).toBe(note_1_id)
      expect(res[3]?.id).toBe(todo_0_id)
      expect(res[4]?.id).toBe(inbox_entry_0_id)
      expect(res[5]?.id).toBe(note_0_id)
    }))

  test('should order alphabetically item with the same rank', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'Amazing z' })
      const { id: note_1_id } = await createTestNote({ name: 'item z', data: 'amazing text' })

      const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING A' })

      const { id: todo_1_id } = await createTestTodo({ name: 'ITEM A' })
      await createTestTodoNode({ todoId: todo_1_id, content: 'amazing content' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(5)

      expect(res[0]?.id).toBe(todo_0_id)
      expect(res[1]?.id).toBe(note_0_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(res[3]?.id).toBe(todo_1_id)
      expect(res[4]?.id).toBe(note_1_id)
    }))

  test('should ignore the letter case in the item content', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'Amazing 0' })

      const { id: todo_0_id } = await createTestTodo({ name: 'AMAZING 1' })

      const { id: todo_1_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_1_id, content: 'amAZIng content' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'AMaziNG text' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(4)

      expect(res[0]?.id).toBe(note_0_id)
      expect(res[1]?.id).toBe(todo_0_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(res[3]?.id).toBe(todo_1_id)
    }))

  test('should ignore the letter case in the query', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'Amazing' })

      const { id: todo_0_id } = await createTestTodo({ name: 'Amazing' })

      const { id: todo_1_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_1_id, content: 'Amazing content' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'Amazing text' })

      const res = await caller.search({ q: 'AMAZING', types: allSearchFilesTypes })

      expect(res.length).toBe(4)

      expect(res[0]?.id).toBe(note_0_id)
      expect(res[1]?.id).toBe(todo_0_id)
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(res[3]?.id).toBe(todo_1_id)
    }))

  test('should search multiple unquoted words', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'amazing super name' })
      await createTestNote({ name: 'amazing' })
      await createTestNote({ name: 'name' })
      const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

      const { id: todo_0_id } = await createTestTodo({ name: 'amazing super name' })
      await createTestTodo({ name: 'amazing' })
      await createTestTodo({ name: 'name' })
      const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_4_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
      const { id: todo_5_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
      const { id: todo_6_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
      const { id: todo_7_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing super name' })
      await createTestInboxEntry({ text: 'amazing' })
      await createTestInboxEntry({ text: 'name' })
      const { id: inbox_entry_3_id } = await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: 'amazing name', types: allSearchFilesTypes })

      expect(res.length).toBe(8)

      expect(res[0]?.id).toBe(note_3_id)
      expect(res[1]?.id).toBe(todo_3_id)
      expect(res[2]?.id).toBe(inbox_entry_3_id)
      expect(res[3]?.id).toBe(note_0_id)
      expect(res[4]?.id).toBe(todo_0_id)
      expect(res[5]?.id).toBe(inbox_entry_0_id)
      expect(res[6]?.id).toBe(todo_7_id)
      expect(res[7]?.id).toBe(todo_4_id)
    }))

  test('should search multiple quoted words', () =>
    testApiRoute(async ({ caller }) => {
      await createTestNote({ name: 'amazing super name' })
      await createTestNote({ name: 'amazing' })
      await createTestNote({ name: 'name' })
      const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

      await createTestTodo({ name: 'amazing super name' })
      await createTestTodo({ name: 'amazing' })
      await createTestTodo({ name: 'name' })
      const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_4_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
      const { id: todo_5_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
      const { id: todo_6_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
      const { id: todo_7_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

      await createTestInboxEntry({ text: 'amazing super name' })
      await createTestInboxEntry({ text: 'amazing' })
      await createTestInboxEntry({ text: 'name' })
      const { id: inbox_entry_3_id } = await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: '"amazing name"', types: allSearchFilesTypes })

      expect(res.length).toBe(4)

      expect(res[0]?.id).toBe(note_3_id)
      expect(res[1]?.id).toBe(todo_3_id)
      expect(res[2]?.id).toBe(inbox_entry_3_id)
      expect(res[3]?.id).toBe(todo_7_id)
    }))

  test('should search multiple words using the OR operator', () =>
    testApiRoute(async ({ caller }) => {
      const { id: note_0_id } = await createTestNote({ name: 'amazing super name' })
      const { id: note_1_id } = await createTestNote({ name: 'amazing' })
      const { id: note_2_id } = await createTestNote({ name: 'name' })
      const { id: note_3_id } = await createTestNote({ name: 'amazing name' })

      const { id: todo_0_id } = await createTestTodo({ name: 'amazing super name' })
      const { id: todo_1_id } = await createTestTodo({ name: 'amazing' })
      const { id: todo_2_id } = await createTestTodo({ name: 'name' })
      const { id: todo_3_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_4_id } = await createTestTodo({ name: 'todo_4' })
      await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
      const { id: todo_5_id } = await createTestTodo({ name: 'todo_5' })
      await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
      const { id: todo_6_id } = await createTestTodo({ name: 'todo_6' })
      await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
      const { id: todo_7_id } = await createTestTodo({ name: 'todo_7' })
      await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: 'amazing super name' })
      const { id: inbox_entry_1_id } = await createTestInboxEntry({ text: 'amazing' })
      const { id: inbox_entry_2_id } = await createTestInboxEntry({ text: 'name' })
      const { id: inbox_entry_3_id } = await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: 'amazing OR name', types: allSearchFilesTypes })

      expect(res.length).toBe(16)

      expect(res[0]?.id).toBe(note_3_id)
      expect(res[1]?.id).toBe(todo_3_id)
      expect(res[2]?.id).toBe(note_0_id)
      expect(res[3]?.id).toBe(todo_0_id)
      expect(res[4]?.id).toBe(inbox_entry_0_id)
      expect(res[5]?.id).toBe(inbox_entry_3_id)
      expect(res[6]?.id).toBe(note_1_id)
      expect(res[7]?.id).toBe(todo_1_id)
      expect(res[8]?.id).toBe(note_2_id)
      expect(res[9]?.id).toBe(todo_2_id)
      expect(res[10]?.id).toBe(inbox_entry_1_id)
      expect(res[11]?.id).toBe(inbox_entry_2_id)
      expect(res[12]?.id).toBe(todo_4_id)
      expect(res[13]?.id).toBe(todo_7_id)
      expect(res[14]?.id).toBe(todo_5_id)
      expect(res[15]?.id).toBe(todo_6_id)
    }))

  test('should search multiple words using the NOT operator', () =>
    testApiRoute(async ({ caller }) => {
      await createTestNote({ name: 'amazing super name' })
      const { id: note_1_id } = await createTestNote({ name: 'amazing' })
      await createTestNote({ name: 'name' })
      await createTestNote({ name: 'amazing name' })

      await createTestTodo({ name: 'amazing super name' })
      const { id: todo_1_id } = await createTestTodo({ name: 'amazing' })
      await createTestTodo({ name: 'name' })
      await createTestTodo({ name: 'amazing name' })

      const { id: todo_4_id } = await createTestTodo({ name: 'todo_4' })
      await createTestTodoNode({ todoId: todo_4_id, content: 'amazing super name' })
      const { id: todo_5_id } = await createTestTodo({ name: 'todo_5' })
      await createTestTodoNode({ todoId: todo_5_id, content: 'amazing' })
      const { id: todo_6_id } = await createTestTodo({ name: 'todo_6' })
      await createTestTodoNode({ todoId: todo_6_id, content: 'name' })
      const { id: todo_7_id } = await createTestTodo({ name: 'todo_7' })
      await createTestTodoNode({ todoId: todo_7_id, content: 'amazing name' })

      await createTestInboxEntry({ text: 'amazing super name' })
      const { id: inbox_entry_1_id } = await createTestInboxEntry({ text: 'amazing' })
      await createTestInboxEntry({ text: 'name' })
      await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: 'amazing -name', types: allSearchFilesTypes })

      expect(res.length).toBe(4)

      expect(res[0]?.id).toBe(todo_1_id)
      expect(res[1]?.id).toBe(todo_5_id)
      expect(res[2]?.id).toBe(note_1_id)
      expect(res[3]?.id).toBe(inbox_entry_1_id)
    }))

  test('should return valid excerpts', () =>
    testApiRoute(async ({ caller }) => {
      const highlightedContent = `${faker.lorem.sentences(10)} The amazing content. ${faker.lorem.sentences(10)}`

      const { id: note_0_id } = await createTestNote({ name: 'amazing name' })
      const { id: note_1_id } = await createTestNote({ name: 'note_1', data: highlightedContent })

      const { id: todo_0_id } = await createTestTodo({ name: 'amazing name' })

      const { id: todo_1_id } = await createTestTodo({ name: 'todo_1' })
      await createTestTodoNode({ todoId: todo_1_id, content: highlightedContent })

      const { id: todo_2_id } = await createTestTodo()
      await createTestTodoNode({ todoId: todo_2_id, noteText: highlightedContent })

      const { id: inbox_entry_0_id } = await createTestInboxEntry({ text: highlightedContent })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(6)

      // The note content does not match the search query, the excerpt should not contain an highlight.
      expect(res[0]?.id).toBe(note_0_id)
      expect(getExcerptHighlightCount(res[0]?.excerpt)).toBe(0)

      // The note content matches the search query, the excerpt should highlight the match.
      expect(res[3]?.id).toBe(note_1_id)
      expect(getExcerptHighlightCount(res[2]?.excerpt)).toBe(1)

      // The content of the todo nodes does not match the search query, the excerpt should not contain an
      // highlight.
      expect(res[1]?.id).toBe(todo_0_id)
      expect(getExcerptHighlightCount(res[1]?.excerpt)).toBe(0)

      // The content of a todo nodes matches the search query, the excerpt should highlight the match.
      expect(res[4]?.id).toBe(todo_1_id)
      expect(getExcerptHighlightCount(res[3]?.excerpt)).toBe(1)

      // The note of a todo nodes matches the search query, the excerpt should highlight the match.
      expect(res[5]?.id).toBe(todo_2_id)
      expect(getExcerptHighlightCount(res[4]?.excerpt)).toBe(1)

      // The inbox entry content matches the search query, the excerpt should highlight the match.
      expect(res[2]?.id).toBe(inbox_entry_0_id)
      expect(getExcerptHighlightCount(res[2]?.excerpt)).toBe(1)
    }))

  test('should return an excerpt with multiple highlights', () =>
    testApiRoute(async ({ caller }) => {
      const { id } = await createTestNote({ data: 'amazing super name' })

      const res = await caller.search({ q: 'amazing name', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.id).toBe(id)
      expect(getExcerptHighlightCount(res[0]?.excerpt)).toBe(2)
    }))

  test('should return a list with only the ID, name, slug, type & excerpt', () =>
    testApiRoute(async ({ caller }) => {
      await createTestNote({ name: 'amazing name' })
      await createTestTodo({ name: 'amazing name' })
      await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(3)

      for (const result of res) {
        expect(Object.keys(result).length).toBe(5)
      }
    }))

  test('should return a null name & slug for inbox entry search results', () =>
    testApiRoute(async ({ caller }) => {
      await createTestInboxEntry({ text: 'amazing name' })

      const res = await caller.search({ q: 'amazing', types: allSearchFilesTypes })

      expect(res.length).toBe(1)

      expect(res[0]?.name).toBeNull()
      expect(res[0]?.slug).toBeNull()
    }))

  test('should require at least 1 file type', () =>
    testApiRoute(async ({ caller }) => {
      await expect(() =>
        caller.search({
          q: 'amazing',
          types: {
            [SearchableContentType.INBOX]: false,
            [SearchableContentType.NOTE]: false,
            [SearchableContentType.TODO]: false,
          },
        })
      ).rejects.toThrow(API_ERROR_SEARCH_REQUIRES_AT_LEAST_ONE_TYPE)
    }))

  test.each(mixedSearchFilesTypes)('should return $label entries', ({ searchFilesTypes }) =>
    testApiRoute(async ({ caller }) => {
      await createTestNote({ name: 'amazing name' })
      await createTestTodo({ name: 'amazing name' })
      await createTestInboxEntry({ text: 'amazing text' })

      const expectedSearchFileTypes = Object.entries(searchFilesTypes)
        .filter(([, value]) => value === true)
        .map(([key]) => key)

      const res = await caller.search({ q: 'amazing', types: searchFilesTypes })

      expect(res.length).toBe(expectedSearchFileTypes.length)

      for (const result of res) {
        expect(expectedSearchFileTypes.includes(result.type)).toBe(true)
      }
    })
  )
})

function getExcerptHighlightCount(excerpt?: SearchResultsData[number]['excerpt']) {
  return (excerpt?.match(/<\/?strong>/g)?.length ?? 0) / 2
}
