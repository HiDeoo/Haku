import { getTestUser, testApiRoute } from 'tests/integration'
import { createTestNoteFolder, createTestTodo, createTestTodoFolder } from 'tests/integration/db'
import { HttpMethod } from 'libs/http'
import indexHandler from 'pages/api/todos'
import { type TodoTreeData } from 'libs/db/tree'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'

describe('todos', () => {
  describe('GET', () => {
    describe('index', () => {
      test('should return an empty tree', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(0)
        }))

      test('should return a tree with only root todos and no folder', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: todo_0 } = await createTestTodo({ name: 'todo_0' })
          const { name: todo_1 } = await createTestTodo({ name: 'todo_1' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(2)

          assertIsTreeItem(json[0])
          expect(json[0]?.name).toBe(todo_0)

          assertIsTreeItem(json[1])
          expect(json[1]?.name).toBe(todo_1)
        }))

      test('should return a tree with only root nodes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: todo_0 } = await createTestTodo({ name: 'todo_0' })
          const { name: todo_1 } = await createTestTodo({ name: 'todo_1' })
          const { name: todo_2 } = await createTestTodo({ name: 'todo_2' })

          const { name: folder_0 } = await createTestTodoFolder({ name: 'folder_0' })
          const { name: folder_1 } = await createTestTodoFolder({ name: 'folder_1' })
          const { name: folder_2 } = await createTestTodoFolder({ name: 'folder_2' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(6)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0)
          expect(json[0]?.children.length).toBe(0)
          expect(json[0]?.items.length).toBe(0)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1)
          expect(json[1]?.children.length).toBe(0)
          expect(json[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[2])
          expect(json[2]?.name).toBe(folder_2)
          expect(json[2]?.children.length).toBe(0)
          expect(json[2]?.items.length).toBe(0)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(todo_0)

          assertIsTreeItem(json[4])
          expect(json[4]?.name).toBe(todo_1)

          assertIsTreeItem(json[5])
          expect(json[5]?.name).toBe(todo_2)
        }))

      test('should return a tree with nested nodes', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
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

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(5)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0)
          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.items.length).toBe(1)

          expect(json[0]?.children[0]?.name).toBe(folder_0_0)
          expect(json[0]?.children[0]?.children.length).toBe(2)
          expect(json[0]?.children[0]?.items.length).toBe(1)

          expect(json[0]?.items[0]?.name).toBe(todo_0_folder_0)

          expect(json[0]?.children[0]?.items[0]?.name).toBe(todo_0_folder_0_0)

          expect(json[0]?.children[0]?.children[0]?.name).toBe(folder_0_0_0)
          expect(json[0]?.children[0]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.children[0]?.items.length).toBe(0)

          expect(json[0]?.children[0]?.children[1]?.name).toBe(folder_0_0_1)
          expect(json[0]?.children[0]?.children[1]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.children[1]?.items.length).toBe(2)

          expect(json[0]?.children[0]?.children[1]?.items[0]?.name).toBe(todo_0_folder_0_0_1)

          expect(json[0]?.children[0]?.children[1]?.items[1]?.name).toBe(todo_1_folder_0_0_1)

          expect(json[0]?.children[1]?.name).toBe(folder_0_1)
          expect(json[0]?.children[1]?.children.length).toBe(0)
          expect(json[0]?.children[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1)
          expect(json[1]?.children.length).toBe(2)
          expect(json[1]?.items.length).toBe(0)

          expect(json[1]?.children[0]?.name).toBe(folder_1_0)
          expect(json[1]?.children[0]?.children.length).toBe(1)
          expect(json[1]?.children[0]?.items.length).toBe(0)

          expect(json[1]?.children[0]?.children[0]?.name).toBe(folder_1_0_0)
          expect(json[1]?.children[0]?.children[0]?.children.length).toBe(2)
          expect(json[1]?.children[0]?.children[0]?.items.length).toBe(0)

          expect(json[1]?.children[0]?.children[0]?.children[0]?.name).toBe(folder_1_0_0_0)
          expect(json[1]?.children[0]?.children[0]?.children[0]?.children.length).toBe(0)
          expect(json[1]?.children[0]?.children[0]?.children[0]?.items.length).toBe(0)

          expect(json[1]?.children[0]?.children[0]?.children[1]?.name).toBe(folder_1_0_0_1)
          expect(json[1]?.children[0]?.children[0]?.children[1]?.children.length).toBe(0)
          expect(json[1]?.children[0]?.children[0]?.children[1]?.items.length).toBe(2)

          expect(json[1]?.children[0]?.children[0]?.children[1]?.items[0]?.name).toBe(todo_0_folder_1_0_0_1)

          expect(json[1]?.children[0]?.children[0]?.children[1]?.items[1]?.name).toBe(todo_1_folder_1_0_0_1)

          expect(json[1]?.children[1]?.name).toBe(folder_1_1)
          expect(json[1]?.children[1]?.children.length).toBe(0)
          expect(json[1]?.children[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[2])
          expect(json[2]?.name).toBe(folder_2)
          expect(json[2]?.children.length).toBe(0)
          expect(json[2]?.items.length).toBe(0)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(todo_0)

          assertIsTreeItem(json[4])
          expect(json[4]?.name).toBe(todo_1)
        }))

      test('should return only nodes owned by the current user', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
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

          const { name: note_0_folder_0_user_0 } = await createTestTodo({
            name: 'note_0_folder_0_user_0',
            folderId: folder_0_user_0_id,
          })
          const { name: note_0_folder_0_0_user_0 } = await createTestTodo({
            name: 'note_0_folder_0_0_user_0',
            folderId: folder_0_0_user_0_id,
          })

          const { userId: userId1 } = getTestUser('1')

          const { id: folder_0_user_1_id } = await createTestTodoFolder({ name: 'folder_0_user_1', userId: userId1 })

          await createTestTodoFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

          await createTestTodo({ name: 'note_0_folder_0_user_1', folderId: folder_0_user_1_id, userId: userId1 })
          await createTestTodo({ name: 'note_0_folder_0_0_user_1', folderId: folder_0_0_user_0_id, userId: userId1 })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(2)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0_user_0)
          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.items.length).toBe(1)

          expect(json[0]?.items[0]?.name).toBe(note_0_folder_0_user_0)

          expect(json[0]?.children[0]?.name).toBe(folder_0_0_user_0)
          expect(json[0]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.items.length).toBe(1)

          expect(json[0]?.children[0]?.items[0]?.name).toBe(note_0_folder_0_0_user_0)

          expect(json[0]?.children[1]?.name).toBe(folder_0_1_user_0)
          expect(json[0]?.children[1]?.children.length).toBe(0)
          expect(json[0]?.children[1]?.items.length).toBe(0)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_1_user_0)
          expect(json[1]?.children.length).toBe(0)
          expect(json[1]?.items.length).toBe(0)
        }))

      test('should return only the content of the proper type', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: folder_0_type_todo } = await createTestTodoFolder({ name: 'folder_0_type_todo' })

          await createTestNoteFolder({ name: 'folder_0_type_note' })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(1)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0_type_todo)
          expect(json[0]?.children.length).toBe(0)
        }))

      test('should return a tree with nodes ordered alphabetically ignoring letter case', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          const { name: todo_z } = await createTestTodo({ name: 'todo_Z' })
          const { name: todo_a } = await createTestTodo({ name: 'todo_a' })

          const { name: folder_z } = await createTestTodoFolder({ name: 'folder_Z' })
          const { id: folder_a_id, name: folder_a } = await createTestTodoFolder({ name: 'folder_a' })

          const { name: todo_z_folder_a } = await createTestTodo({ name: 'todo_z_folder_a', folderId: folder_a_id })
          const { name: todo_a_folder_a } = await createTestTodo({ name: 'todo_a_folder_a', folderId: folder_a_id })

          const { name: folder_a_z } = await createTestTodoFolder({ name: 'folder_a_z', parentId: folder_a_id })
          const { name: folder_a_a } = await createTestTodoFolder({ name: 'folder_a_a', parentId: folder_a_id })

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(4)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_a)

          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.children[0]?.name).toBe(folder_a_a)
          expect(json[0]?.children[1]?.name).toBe(folder_a_z)

          expect(json[0]?.items.length).toBe(2)
          expect(json[0]?.items[0]?.name).toBe(todo_a_folder_a)
          expect(json[0]?.items[1]?.name).toBe(todo_z_folder_a)

          assertIsTreeFolder(json[1])
          expect(json[1]?.name).toBe(folder_z)

          assertIsTreeItem(json[2])
          expect(json[2]?.name).toBe(todo_a)

          assertIsTreeItem(json[3])
          expect(json[3]?.name).toBe(todo_z)
        }))

      test.todo('should return a tree with only metadata and no content')
    })
  })
})
