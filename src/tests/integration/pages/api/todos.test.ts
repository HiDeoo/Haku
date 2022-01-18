import StatusCode from 'status-code-enum'
import slug from 'url-slug'

import { getTestUser, testApiRoute } from 'tests/integration'
import {
  createTestNoteFolder,
  createTestTodo,
  createTestTodoFolder,
  getTestTodo,
  getTestTodos,
} from 'tests/integration/db'
import { HttpMethod } from 'libs/http'
import indexHandler from 'pages/api/todos'
import idHandler from 'pages/api/todos/[id]'
import { type TodoTreeData } from 'libs/db/tree'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'
import { type TodoMetadata } from 'libs/db/todo'
import {
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_TODO_ALREADY_EXISTS,
  API_ERROR_TODO_DOES_NOT_EXIST,
  type ApiErrorResponse,
} from 'libs/api/routes/errors'
import { hasKey } from 'libs/object'

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

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          expect(json.length).toBe(2)

          assertIsTreeFolder(json[0])
          expect(json[0]?.name).toBe(folder_0_user_0)
          expect(json[0]?.children.length).toBe(2)
          expect(json[0]?.items.length).toBe(1)

          expect(json[0]?.items[0]?.name).toBe(todo_0_folder_0_user_0)

          expect(json[0]?.children[0]?.name).toBe(folder_0_0_user_0)
          expect(json[0]?.children[0]?.children.length).toBe(0)
          expect(json[0]?.children[0]?.items.length).toBe(1)

          expect(json[0]?.children[0]?.items[0]?.name).toBe(todo_0_folder_0_0_user_0)

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

      test('should return a tree with only metadata and no content', () =>
        testApiRoute(indexHandler, async ({ fetch }) => {
          await createTestTodo()

          const res = await fetch({ method: HttpMethod.GET })
          const json = await res.json<TodoTreeData>()

          assertIsTreeItem(json[0])
          expect(hasKey(json[0], 'rootNodes')).toBe(false)
        }))
    })
  })

  describe('POST', () => {
    test('should add a new todo at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'todo'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<TodoMetadata>()

        const testTodo = await getTestTodo(json.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBeNull()
        expect(testTodo?.slug).toBe(slug(name))
      }))

    test('should add a new todo inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestTodoFolder()

        const name = 'todo'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<TodoMetadata>()

        const testTodo = await getTestTodo(json.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBe(folderId)
        expect(testTodo?.slug).toBe(slug(name))
      }))

    test('should add a new todo and attach to it a valid URL slug', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'todo Todo 1/10 ½ 🤔'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<TodoMetadata>()

        const testTodo = await getTestTodo(json.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.name).toBe(name)
        expect(testTodo?.folderId).toBeNull()
        expect(testTodo?.slug).toBe('todo-todo-1-10-1-2')
      }))

    test('should add a new todo and populate its data', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'Test Note'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<TodoMetadata>()

        const testTodo = await getTestTodo(json.id)

        expect(testTodo).toBeDefined()
        expect(testTodo?.rootNodes).toBeDefined()
        expect(testTodo?.rootNodes.length).toBe(1)

        expect(testTodo?.rootNodes[0]).toBeDefined()
        expect(testTodo?.rootNodes[0]).toBe(json.id)
      }))

    test('should not add a new todo inside a nonexisting folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const name = 'todo'
        const folderId = 1

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new todo inside an existing folder not owned by the current user', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestTodoFolder({ userId: getTestUser('1').userId })

        const name = 'todo'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new todo inside an existing folder of a different type', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestNoteFolder()

        const name = 'todo'

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_FOLDER_INVALID_TYPE)

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(0)
      }))

    test('should not add a new duplicated todo at the root', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { name } = await createTestTodo()

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_TODO_ALREADY_EXISTS)

        const testTodos = await getTestTodos({ name })

        expect(testTodos.length).toBe(1)
      }))

    test('should not add a new duplicated todo inside an existing folder', () =>
      testApiRoute(indexHandler, async ({ fetch }) => {
        const { id: folderId } = await createTestTodoFolder()
        const { name } = await createTestTodo({ folderId })

        const res = await fetch({
          method: HttpMethod.POST,
          body: JSON.stringify({ name, folderId }),
        })
        const json = await res.json<ApiErrorResponse>()

        expect(res.status).toBe(StatusCode.ClientErrorForbidden)
        expect(json.error).toBe(API_ERROR_TODO_ALREADY_EXISTS)

        const testTodos = await getTestTodos({ name, folderId })

        expect(testTodos.length).toBe(1)
      }))
  })

  describe('PATCH', () => {
    test('should rename a todo and update its slug', async () => {
      const { id: folderId } = await createTestTodoFolder()
      const { id } = await createTestTodo({ folderId })

      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<TodoMetadata>()

          expect(json.name).toBe(newName)

          const testNote = await getTestTodo(id)

          expect(testNote?.name).toBe(newName)
          expect(testNote?.slug).toBe(slug(newName))
          expect(testNote?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not rename a todo if becoming duplicated', async () => {
      const { id, name } = await createTestTodo()
      const { name: newName } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_ALREADY_EXISTS)

          const testTodo = await getTestTodo(id)

          expect(testTodo?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a todo inside another folder', async () => {
      const { id: folderId } = await createTestTodoFolder()
      const { id: newFolderId } = await createTestTodoFolder()

      const { id, slug } = await createTestTodo({ folderId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<TodoMetadata>()

          expect(json.folderId).toBe(newFolderId)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBe(newFolderId)
          expect(testTodo?.slug).toBe(slug)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move a todo to the root', async () => {
      const { id: folderId } = await createTestTodoFolder()

      const { id, slug } = await createTestTodo({ folderId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: null }),
          })
          const json = await res.json<TodoMetadata>()

          expect(json.folderId).toBeNull()

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBeNull()
          expect(testTodo?.slug).toBe(slug)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a todo if becoming duplicated', async () => {
      const { id: folderId } = await createTestTodoFolder()
      const { id: newFolderId } = await createTestTodoFolder()

      const { id } = await createTestTodo({ folderId, name: 'todo' })
      await createTestTodo({ folderId: newFolderId, name: 'todo' })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_ALREADY_EXISTS)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a todo inside a nonexisting folder', async () => {
      const { id, folderId } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: 1 }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a todo inside an existing folder not owned by the current user', async () => {
      const { id: newFolderId } = await createTestTodoFolder({ userId: getTestUser('1').userId })

      const { id, folderId } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_DOES_NOT_EXIST)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not move a todo inside an existing folder of a different type', async () => {
      const { id: newFolderId } = await createTestNoteFolder()

      const { id, folderId } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ folderId: newFolderId }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_FOLDER_INVALID_TYPE)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.folderId).toBe(folderId)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should move & rename a todo at the same time', async () => {
      const { id: newFolderId } = await createTestTodoFolder()

      const { id } = await createTestTodo()

      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName, folderId: newFolderId }),
          })
          const json = await res.json<TodoMetadata>()

          expect(json.name).toBe(newName)
          expect(json.folderId).toBe(newFolderId)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.name).toBe(newName)
          expect(testTodo?.folderId).toBe(newFolderId)
          expect(testTodo?.slug).toBe(slug(newName))
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a todo not owned by the current user', async () => {
      const { id, name } = await createTestTodo({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: 'newName' }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeDefined()
          expect(testTodo?.name).toBe(name)
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not update a nonexisting todo', async () => {
      const newName = 'newName'

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({
            method: HttpMethod.PATCH,
            body: JSON.stringify({ name: newName }),
          })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)

          const testTodos = await getTestTodos({ name: newName })

          expect(testTodos.length).toBe(0)
        },
        { dynamicRouteParams: { id: 1 } }
      )
    })
  })

  describe('DELETE', () => {
    test('should remove a todo', async () => {
      const { id } = await createTestTodo()

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          await fetch({ method: HttpMethod.DELETE })

          const testTodo = await getTestTodo(id)

          expect(testTodo).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a todo not owned by the current user', async () => {
      const { id } = await createTestTodo({ userId: getTestUser('1').userId })

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)

          const testFolder = await getTestTodo(id)

          expect(testFolder).toBeDefined()
        },
        { dynamicRouteParams: { id } }
      )
    })

    test('should not remove a nonexisting todo', () => {
      const id = 1

      return testApiRoute(
        idHandler,
        async ({ fetch }) => {
          const res = await fetch({ method: HttpMethod.DELETE })
          const json = await res.json<ApiErrorResponse>()

          expect(res.status).toBe(StatusCode.ClientErrorForbidden)
          expect(json.error).toBe(API_ERROR_TODO_DOES_NOT_EXIST)

          const testFolder = await getTestTodo(id)

          expect(testFolder).toBeNull()
        },
        { dynamicRouteParams: { id } }
      )
    })
  })
})
