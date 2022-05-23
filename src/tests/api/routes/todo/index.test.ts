import assert from 'assert'

import cuid from 'cuid'
import slug from 'url-slug'

import {
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_TODO_ALREADY_EXISTS,
  API_ERROR_TODO_DOES_NOT_EXIST,
} from 'constants/error'
import { HttpMethod } from 'constants/http'
import { getCloudinaryApiUrl } from 'libs/cloudinary'
import { isDateEqual } from 'libs/date'
import { hasKey } from 'libs/object'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'
import { getTestUser, testApiRoute } from 'tests/api'
import {
  createTestNoteFolder,
  createTestTodo,
  createTestTodoFolder,
  getTestTodo,
  getTestTodoNode,
  getTestTodos,
} from 'tests/api/db'

describe('todo', () => {
  describe('list', () => {
    test('should return an empty tree', () =>
      testApiRoute(async ({ caller }) => {
        const res = await caller.query('todo.list')

        expect(res.length).toBe(0)
      }))

    test('should return a tree with only root todos and no folder', () =>
      testApiRoute(async ({ caller }) => {
        const { name: todo_0 } = await createTestTodo({ name: 'todo_0' })
        const { name: todo_1 } = await createTestTodo({ name: 'todo_1' })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(2)

        assertIsTreeItem(res[0])
        expect(res[0].name).toBe(todo_0)

        assertIsTreeItem(res[1])
        expect(res[1].name).toBe(todo_1)
      }))

    test('should return a tree with only root nodes', () =>
      testApiRoute(async ({ caller }) => {
        const { name: todo_0 } = await createTestTodo({ name: 'todo_0' })
        const { name: todo_1 } = await createTestTodo({ name: 'todo_1' })
        const { name: todo_2 } = await createTestTodo({ name: 'todo_2' })

        const { name: folder_0 } = await createTestTodoFolder({ name: 'folder_0' })
        const { name: folder_1 } = await createTestTodoFolder({ name: 'folder_1' })
        const { name: folder_2 } = await createTestTodoFolder({ name: 'folder_2' })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(6)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0)
        expect(res[0].children.length).toBe(0)
        expect(res[0].items.length).toBe(0)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_1)
        expect(res[1].children.length).toBe(0)
        expect(res[1].items.length).toBe(0)

        assertIsTreeFolder(res[2])
        expect(res[2].name).toBe(folder_2)
        expect(res[2].children.length).toBe(0)
        expect(res[2].items.length).toBe(0)

        assertIsTreeItem(res[3])
        expect(res[3].name).toBe(todo_0)

        assertIsTreeItem(res[4])
        expect(res[4].name).toBe(todo_1)

        assertIsTreeItem(res[5])
        expect(res[5].name).toBe(todo_2)
      }))

    test('should return a tree with nested nodes', () =>
      testApiRoute(async ({ caller }) => {
        /**
         * folder_0
         * |__ folder_0_0
         *     |__ folder_0_0_0
         *         |__ todo_0_folder_0_0_0
         *         |__ todo_1_folder_0_0_0
         *     |__ folder_0_0_1
         *     |__ todo_0_folder_0_0
         * |__ folder_0_1
         * |__ todo_0_folder_0
         * folder_1
         * |__ folder_1_0
         *     |__ folder_1_0_0
         *         |__ folder_1_0_0_0
         *         |__ folder_1_0_0_1
         *             |__ todo_0_folder_1_0_0_1
         *             |__ todo_1_folder_1_0_0_1
         * |__ folder_1_1
         * folder_2
         * todo_0
         * todo_1
         */

        const { name: todo_0 } = await createTestTodo({ name: 'todo_0' })
        const { name: todo_1 } = await createTestTodo({ name: 'todo_1' })

        const { id: folder_0_id, name: folder_0 } = await createTestTodoFolder({ name: 'folder_0' })

        const { name: todo_0_folder_0 } = await createTestTodo({ name: 'todo_0_folder_0', folderId: folder_0_id })

        const { id: folder_0_0_id, name: folder_0_0 } = await createTestTodoFolder({
          name: 'folder_0_0',
          parentId: folder_0_id,
        })

        const { name: todo_0_folder_0_0 } = await createTestTodo({
          name: 'todo_0_folder_0_0',
          folderId: folder_0_0_id,
        })

        const { name: folder_0_0_0 } = await createTestTodoFolder({ name: 'folder_0_0_0', parentId: folder_0_0_id })
        const { id: folder_0_0_1_id, name: folder_0_0_1 } = await createTestTodoFolder({
          name: 'folder_0_0_1',
          parentId: folder_0_0_id,
        })

        const { name: todo_0_folder_0_0_1 } = await createTestTodo({
          name: 'todo_0_folder_0_0_1',
          folderId: folder_0_0_1_id,
        })
        const { name: todo_1_folder_0_0_1 } = await createTestTodo({
          name: 'todo_1_folder_0_0_1',
          folderId: folder_0_0_1_id,
        })

        const { name: folder_0_1 } = await createTestTodoFolder({ name: 'folder_0_1', parentId: folder_0_id })

        const { id: folder_1_id, name: folder_1 } = await createTestTodoFolder({ name: 'folder_1' })

        const { id: folder_1_0_id, name: folder_1_0 } = await createTestTodoFolder({
          name: 'folder_1_0',
          parentId: folder_1_id,
        })
        const { name: folder_1_1 } = await createTestTodoFolder({ name: 'folder_1_1', parentId: folder_1_id })

        const { id: folder_1_0_0_id, name: folder_1_0_0 } = await createTestTodoFolder({
          name: 'folder_1_0_0',
          parentId: folder_1_0_id,
        })

        const { name: folder_1_0_0_0 } = await createTestTodoFolder({
          name: 'folder_1_0_0_0',
          parentId: folder_1_0_0_id,
        })
        const { id: folder_1_0_0_1_id, name: folder_1_0_0_1 } = await createTestTodoFolder({
          name: 'folder_1_0_0_1',
          parentId: folder_1_0_0_id,
        })

        const { name: todo_0_folder_1_0_0_1 } = await createTestTodo({
          name: 'todo_0_folder_1_0_0_1',
          folderId: folder_1_0_0_1_id,
        })
        const { name: todo_1_folder_1_0_0_1 } = await createTestTodo({
          name: 'todo_1_folder_1_0_0_1',
          folderId: folder_1_0_0_1_id,
        })

        const { name: folder_2 } = await createTestTodoFolder({ name: 'folder_2' })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(5)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0)
        expect(res[0].children.length).toBe(2)
        expect(res[0].items.length).toBe(1)

        expect(res[0].children[0]?.name).toBe(folder_0_0)
        expect(res[0].children[0]?.children.length).toBe(2)
        expect(res[0].children[0]?.items.length).toBe(1)

        expect(res[0].items[0]?.name).toBe(todo_0_folder_0)

        expect(res[0].children[0]?.items[0]?.name).toBe(todo_0_folder_0_0)

        expect(res[0].children[0]?.children[0]?.name).toBe(folder_0_0_0)
        expect(res[0].children[0]?.children[0]?.children.length).toBe(0)
        expect(res[0].children[0]?.children[0]?.items.length).toBe(0)

        expect(res[0].children[0]?.children[1]?.name).toBe(folder_0_0_1)
        expect(res[0].children[0]?.children[1]?.children.length).toBe(0)
        expect(res[0].children[0]?.children[1]?.items.length).toBe(2)

        expect(res[0].children[0]?.children[1]?.items[0]?.name).toBe(todo_0_folder_0_0_1)

        expect(res[0].children[0]?.children[1]?.items[1]?.name).toBe(todo_1_folder_0_0_1)

        expect(res[0].children[1]?.name).toBe(folder_0_1)
        expect(res[0].children[1]?.children.length).toBe(0)
        expect(res[0].children[1]?.items.length).toBe(0)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_1)
        expect(res[1].children.length).toBe(2)
        expect(res[1].items.length).toBe(0)

        expect(res[1].children[0]?.name).toBe(folder_1_0)
        expect(res[1].children[0]?.children.length).toBe(1)
        expect(res[1].children[0]?.items.length).toBe(0)

        expect(res[1].children[0]?.children[0]?.name).toBe(folder_1_0_0)
        expect(res[1].children[0]?.children[0]?.children.length).toBe(2)
        expect(res[1].children[0]?.children[0]?.items.length).toBe(0)

        expect(res[1].children[0]?.children[0]?.children[0]?.name).toBe(folder_1_0_0_0)
        expect(res[1].children[0]?.children[0]?.children[0]?.children.length).toBe(0)
        expect(res[1].children[0]?.children[0]?.children[0]?.items.length).toBe(0)

        expect(res[1].children[0]?.children[0]?.children[1]?.name).toBe(folder_1_0_0_1)
        expect(res[1].children[0]?.children[0]?.children[1]?.children.length).toBe(0)
        expect(res[1].children[0]?.children[0]?.children[1]?.items.length).toBe(2)

        expect(res[1].children[0]?.children[0]?.children[1]?.items[0]?.name).toBe(todo_0_folder_1_0_0_1)

        expect(res[1].children[0]?.children[0]?.children[1]?.items[1]?.name).toBe(todo_1_folder_1_0_0_1)

        expect(res[1].children[1]?.name).toBe(folder_1_1)
        expect(res[1].children[1]?.children.length).toBe(0)
        expect(res[1].children[1]?.items.length).toBe(0)

        assertIsTreeFolder(res[2])
        expect(res[2].name).toBe(folder_2)
        expect(res[2].children.length).toBe(0)
        expect(res[2].items.length).toBe(0)

        assertIsTreeItem(res[3])
        expect(res[3].name).toBe(todo_0)

        assertIsTreeItem(res[4])
        expect(res[4].name).toBe(todo_1)
      }))

    test('should return only nodes owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createTestTodoFolder({
          name: 'folder_0_user_0',
        })
        const { name: folder_1_user_0 } = await createTestTodoFolder({ name: 'folder_1_user_0' })

        const { id: folder_0_0_user_0_id, name: folder_0_0_user_0 } = await createTestTodoFolder({
          name: 'folder_0_0_user_0',
          parentId: folder_0_user_0_id,
        })
        const { name: folder_0_1_user_0 } = await createTestTodoFolder({
          name: 'folder_0_1_user_0',
          parentId: folder_0_user_0_id,
        })

        const { name: todo_0_folder_0_user_0 } = await createTestTodo({
          name: 'todo_0_folder_0_user_0',
          folderId: folder_0_user_0_id,
        })
        const { name: todo_0_folder_0_0_user_0 } = await createTestTodo({
          name: 'todo_0_folder_0_0_user_0',
          folderId: folder_0_0_user_0_id,
        })

        const { userId: userId1 } = getTestUser('1')

        const { id: folder_0_user_1_id } = await createTestTodoFolder({ name: 'folder_0_user_1', userId: userId1 })

        await createTestTodoFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

        await createTestTodo({ name: 'todo_0_folder_0_user_1', folderId: folder_0_user_1_id, userId: userId1 })
        await createTestTodo({ name: 'todo_0_folder_0_0_user_1', folderId: folder_0_0_user_0_id, userId: userId1 })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(2)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0_user_0)
        expect(res[0].children.length).toBe(2)
        expect(res[0].items.length).toBe(1)

        expect(res[0].items[0]?.name).toBe(todo_0_folder_0_user_0)

        expect(res[0].children[0]?.name).toBe(folder_0_0_user_0)
        expect(res[0].children[0]?.children.length).toBe(0)
        expect(res[0].children[0]?.items.length).toBe(1)

        expect(res[0].children[0]?.items[0]?.name).toBe(todo_0_folder_0_0_user_0)

        expect(res[0].children[1]?.name).toBe(folder_0_1_user_0)
        expect(res[0].children[1]?.children.length).toBe(0)
        expect(res[0].children[1]?.items.length).toBe(0)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_1_user_0)
        expect(res[1].children.length).toBe(0)
        expect(res[1].items.length).toBe(0)
      }))

    test('should return only the content of the proper type', () =>
      testApiRoute(async ({ caller }) => {
        const { name: folder_0_type_todo } = await createTestTodoFolder({ name: 'folder_0_type_todo' })

        await createTestNoteFolder({ name: 'folder_0_type_note' })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(1)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0_type_todo)
        expect(res[0].children.length).toBe(0)
      }))

    test('should return a tree with nodes ordered alphabetically ignoring letter case', () =>
      testApiRoute(async ({ caller }) => {
        const { name: todo_z } = await createTestTodo({ name: 'todo_Z' })
        const { name: todo_a } = await createTestTodo({ name: 'todo_a' })

        const { name: folder_z } = await createTestTodoFolder({ name: 'folder_Z' })
        const { id: folder_a_id, name: folder_a } = await createTestTodoFolder({ name: 'folder_a' })

        const { name: todo_z_folder_a } = await createTestTodo({ name: 'todo_z_folder_a', folderId: folder_a_id })
        const { name: todo_a_folder_a } = await createTestTodo({ name: 'todo_a_folder_a', folderId: folder_a_id })

        const { name: folder_a_z } = await createTestTodoFolder({ name: 'folder_a_z', parentId: folder_a_id })
        const { name: folder_a_a } = await createTestTodoFolder({ name: 'folder_a_a', parentId: folder_a_id })

        const res = await caller.query('todo.list')

        expect(res.length).toBe(4)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_a)

        expect(res[0].children.length).toBe(2)
        expect(res[0].children[0]?.name).toBe(folder_a_a)
        expect(res[0].children[1]?.name).toBe(folder_a_z)

        expect(res[0].items.length).toBe(2)
        expect(res[0].items[0]?.name).toBe(todo_a_folder_a)
        expect(res[0].items[1]?.name).toBe(todo_z_folder_a)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_z)

        assertIsTreeItem(res[2])
        expect(res[2].name).toBe(todo_a)

        assertIsTreeItem(res[3])
        expect(res[3].name).toBe(todo_z)
      }))

    test('should return a tree with only metadata and no content', () =>
      testApiRoute(async ({ caller }) => {
        await createTestTodo()

        const res = await caller.query('todo.list')

        assertIsTreeItem(res[0])
        expect(hasKey(res[0], 'root')).toBe(false)
        expect(hasKey(res[0], 'modifiedAt')).toBe(false)
      }))
  })

  describe('add', () => {
    test('should add a new todo at the root', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'todo'

        const res = await caller.mutation('todo.add', { name })

        const testTodo = await getTestTodo(res.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBeNull()
        expect(testTodo?.slug).toBe(slug(name))
      }))

    test('should add a new todo inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()

        const name = 'todo'

        const res = await caller.mutation('todo.add', { name, folderId })

        const testTodo = await getTestTodo(res.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBe(folderId)
        expect(testTodo?.slug).toBe(slug(name))
      }))

    test('should add a new todo and attach to it a valid URL slug', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'todo Todo 1/10 ½ 🤔'

        const res = await caller.mutation('todo.add', { name })

        const testTodo = await getTestTodo(res.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBeNull()
        expect(testTodo?.slug).toBe('todo-todo-1-10-1-2')
      }))

    test('should add a new todo and populate its data', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'Test Note'

        const res = await caller.mutation('todo.add', { name })

        const testTodo = await getTestTodo(res.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.root).toBeDefined()
        expect(testTodo?.root.length).toBe(1)

        expect(testTodo?.root[0]).toBeDefined()
        expect(testTodo?.modifiedAt).toBeDefined()

        assert(typeof testTodo?.root[0] === 'string')

        const testTodoNode = await getTestTodoNode(testTodo?.root[0])

        expect(testTodoNode).toBeDefined()
        expect(testTodoNode?.todoId).toBe(res.id)
      }))

    test('should not add a new todo inside a nonexisting folder', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'todo'
        const folderId = cuid()

        await expect(() => caller.mutation('todo.add', { name, folderId })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new todo inside an existing folder not owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder({ userId: getTestUser('1').userId })

        const name = 'todo'

        await expect(() => caller.mutation('todo.add', { name, folderId })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new todo inside an existing folder of a different type', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()

        const name = 'todo'

        await expect(() => caller.mutation('todo.add', { name, folderId })).rejects.toThrow(
          API_ERROR_FOLDER_INVALID_TYPE
        )

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new duplicated todo at the root', () =>
      testApiRoute(async ({ caller }) => {
        const { name } = await createTestTodo()

        await expect(() => caller.mutation('todo.add', { name })).rejects.toThrow(API_ERROR_TODO_ALREADY_EXISTS)

        const testTodos = await getTestTodos({ name })

        expect(testTodos.length).toBe(1)
      }))

    test('should not add a new duplicated todo inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()
        const { name } = await createTestTodo({ folderId })

        await expect(() => caller.mutation('todo.add', { name, folderId })).rejects.toThrow(
          API_ERROR_TODO_ALREADY_EXISTS
        )

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(1)
      }))
  })

  describe('update', () => {
    test('should rename a todo and update its slug', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()
        const { id, modifiedAt } = await createTestTodo({ folderId })

        const newName = 'newName'

        const res = await caller.mutation('todo.update', { id, name: newName })

        expect(res.name).toBe(newName)

        const testTodo = await getTestTodo(id)

        expect(testTodo?.name).toBe(newName)
        expect(testTodo?.slug).toBe(slug(newName))
        expect(testTodo?.folderId).toBe(folderId)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not rename a todo if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, name } = await createTestTodo()
        const { name: newName } = await createTestTodo()

        await expect(() => caller.mutation('todo.update', { id, name: newName })).rejects.toThrow(
          API_ERROR_TODO_ALREADY_EXISTS
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo?.name).toBe(name)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move a todo inside another folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()
        const { id: newFolderId } = await createTestTodoFolder()

        const { id, modifiedAt, slug } = await createTestTodo({ folderId })

        const res = await caller.mutation('todo.update', { id, folderId: newFolderId })

        expect(res.folderId).toBe(newFolderId)

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBe(newFolderId)
        expect(testTodo?.slug).toBe(slug)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move a todo to the root', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()

        const { id, modifiedAt, slug } = await createTestTodo({ folderId })

        const res = await caller.mutation('todo.update', { id, folderId: null })

        expect(res.folderId).toBeNull()

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBeNull()
        expect(testTodo?.slug).toBe(slug)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a todo if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()
        const { id: newFolderId } = await createTestTodoFolder()

        const { id, modifiedAt } = await createTestTodo({ folderId, name: 'todo' })
        await createTestTodo({ folderId: newFolderId, name: 'todo' })

        await expect(() => caller.mutation('todo.update', { id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_TODO_ALREADY_EXISTS
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBe(folderId)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a todo inside a nonexisting folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, folderId, modifiedAt } = await createTestTodo()

        await expect(() => caller.mutation('todo.update', { id, folderId: cuid() })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBe(folderId)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a todo inside an existing folder not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestTodoFolder({ userId: getTestUser('1').userId })

        const { id, folderId, modifiedAt } = await createTestTodo()

        await expect(() => caller.mutation('todo.update', { id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBe(folderId)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a todo inside an existing folder of a different type', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestNoteFolder()

        const { id, folderId, modifiedAt } = await createTestTodo()

        await expect(() => caller.mutation('todo.update', { id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_FOLDER_INVALID_TYPE
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.folderId).toBe(folderId)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move & rename a todo at the same time', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestTodoFolder()

        const { id, modifiedAt } = await createTestTodo()

        const newName = 'newName'

        const res = await caller.mutation('todo.update', { id, name: newName, folderId: newFolderId })

        expect(res.name).toBe(newName)
        expect(res.folderId).toBe(newFolderId)

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(newName)
        expect(testTodo?.folderId).toBe(newFolderId)
        expect(testTodo?.slug).toBe(slug(newName))
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a todo not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, name } = await createTestTodo({ userId: getTestUser('1').userId })

        await expect(() => caller.mutation('todo.update', { id, name: 'newName' })).rejects.toThrow(
          API_ERROR_TODO_DOES_NOT_EXIST
        )

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(isDateEqual(testTodo?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a nonexisting todo', async () =>
      testApiRoute(async ({ caller }) => {
        const newName = 'newName'

        await expect(() => caller.mutation('todo.update', { id: cuid(), name: newName })).rejects.toThrow(
          API_ERROR_TODO_DOES_NOT_EXIST
        )

        const testTodos = await getTestTodos({ name: newName })

        expect(testTodos.length).toBe(0)
      }))
  })

  describe('delete', () => {
    test('should remove a todo and its associated images', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo()

        const fetchSpy = jest.spyOn(global, 'fetch')

        await caller.mutation('todo.delete', { id })

        const testTodo = await getTestTodo(id)

        expect(testTodo).toBeNull()

        const deleteUrl = getCloudinaryApiUrl(`/resources/image/tags/${id}`)
        const cloudinaryApiReqIndex = fetchSpy.mock.calls.findIndex(([callUrl]) => callUrl === deleteUrl)

        const cloudinaryApiReq = fetchSpy.mock.calls[cloudinaryApiReqIndex]
        assert(cloudinaryApiReq)

        const [cloudinaryApiCallUrl, cloudinaryApiCallOptions] = cloudinaryApiReq

        expect(cloudinaryApiCallUrl).toBe(deleteUrl)
        expect(cloudinaryApiCallOptions?.method).toBe(HttpMethod.DELETE)

        fetchSpy.mockRestore()
      }))

    test('should not remove a todo not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestTodo({ userId: getTestUser('1').userId })

        await expect(() => caller.mutation('todo.delete', { id })).rejects.toThrow(API_ERROR_TODO_DOES_NOT_EXIST)

        const testFolder = await getTestTodo(id)

        expect(testFolder).toBeDefined()
      }))

    test('should not remove a nonexisting todo', () =>
      testApiRoute(async ({ caller }) => {
        const id = cuid()

        await expect(() => caller.mutation('todo.delete', { id })).rejects.toThrow(API_ERROR_TODO_DOES_NOT_EXIST)

        const testFolder = await getTestTodo(id)

        expect(testFolder).toBeNull()
      }))
  })
})
