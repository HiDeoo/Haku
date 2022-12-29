import { faker } from '@faker-js/faker'
import { type TodoNode, TodoNodeStatus } from '@prisma/client'
import slug from 'url-slug'
import { assert, describe, expect, test } from 'vitest'

import { API_ERROR_IMPORT_DYNALIST_INVALID_OPML } from 'constants/error'
import { type TodoNodeData } from 'libs/db/todoNodes'
import { testApiRoute } from 'tests/api'
import { getTestTodo, getTestTodoNode } from 'tests/api/db'

const opmlHead = `<head>
  <title></title>
  <flavor>dynalist</flavor>
  <source>https://dynalist.io</source>
  <ownerName>user</ownerName>
  <ownerEmail>user@example.com</ownerEmail>
</head>`

describe('import', () => {
  describe('dynalist', () => {
    test('should not import from an invalid OPML', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.import.dynalist({ opml: '<?xml version="1.0" encoding="utf-8"?>' })).rejects.toThrow(
          API_ERROR_IMPORT_DYNALIST_INVALID_OPML
        )
      }))

    test('should not import from an empty OPML', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() =>
          caller.import.dynalist({
            opml: `<?xml version="1.0" encoding="utf-8"?>
          <opml version="2.0">
            ${opmlHead}
            <body>
            </body>
          </opml>`,
          })
        ).rejects.toThrow(API_ERROR_IMPORT_DYNALIST_INVALID_OPML)
      }))

    test('should not import from an OPML with multiple root entries', () =>
      testApiRoute(async ({ caller }) => {
        await expect(() =>
          caller.import.dynalist({
            opml: `<?xml version="1.0" encoding="utf-8"?>
            <opml version="2.0">
            ${opmlHead}
              <body>
                <outline text="name1" />
                <outline text="name2" />
              </body>
            </opml>`,
          })
        ).rejects.toThrow(API_ERROR_IMPORT_DYNALIST_INVALID_OPML)
      }))

    test('should not import an OPML with no todos', () =>
      testApiRoute(async ({ caller }) => {
        const { opml } = getFakeOpml([])

        await expect(() => caller.import.dynalist({ opml })).rejects.toThrow(API_ERROR_IMPORT_DYNALIST_INVALID_OPML)
      }))

    test('should import a basic todo', () =>
      testApiRoute(async ({ caller }) => {
        const content = 'todo node content'

        const { name, opml } = getFakeOpml([{ content }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: false,
          content,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
      }))

    test('should import a completed todo', () =>
      testApiRoute(async ({ caller }) => {
        const { name, opml } = getFakeOpml([{ completed: true }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: false,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.COMPLETED,
        })
      }))

    test('should import a collapased todo', () =>
      testApiRoute(async ({ caller }) => {
        const { name, opml } = getFakeOpml([{ collapsed: true }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: true,
          noteHtml: null,
          noteText: null,
          status: TodoNodeStatus.ACTIVE,
        })
      }))

    test('should import a todo with a basic note', () =>
      testApiRoute(async ({ caller }) => {
        const note = 'todo node note'

        const { name, opml } = getFakeOpml([{ note }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: false,
          noteHtml: note,
          noteText: note,
          status: TodoNodeStatus.ACTIVE,
        })
      }))

    test('should import a todo with a note containing line breaks', () =>
      testApiRoute(async ({ caller }) => {
        const note = `start of todo node note

end of todo node note`

        const { name, opml } = getFakeOpml([{ note }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: false,
          noteHtml: note,
          noteText: note,
          status: TodoNodeStatus.ACTIVE,
        })
      }))

    test('should import a todo with a note containing stripped markdown', () =>
      testApiRoute(async ({ caller }) => {
        const note = `# todo node note

\`\`\`ts
test()
\`\`\``

        const { name, opml } = getFakeOpml([{ note }])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(1)

        const expectedNote = `todo node note

test()`

        validateTodoNode(testTodo?.nodes[0], {
          collapsed: false,
          noteHtml: expectedNote,
          noteText: expectedNote,
          status: TodoNodeStatus.ACTIVE,
        })
      }))

    test('should import a todo with nested todo nodes', () =>
      testApiRoute(async ({ caller }) => {
        const node_0 = getFakeOpmlTodoNode({})
        const node_0_0 = getFakeOpmlTodoNode({})
        const node_0_0_0 = getFakeOpmlTodoNode({})

        const { name, opml } = getFakeOpml([
          {
            ...node_0,
            children: [{ ...node_0_0, children: [node_0_0_0] }],
          },
        ])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 1)

        expect(testTodo?.nodes.length).toBe(3)

        expect(testTodo?.root.length).toBe(1)

        assert(typeof testTodo?.root[0] === 'string')
        let testTodoNode = await getTestTodoNode(testTodo.root[0])

        validateTodoNode(testTodoNode, node_0)
        expect(testTodoNode?.children.length).toBe(1)

        assert(typeof testTodoNode?.children[0] === 'string')
        testTodoNode = await getTestTodoNode(testTodoNode.children[0])

        validateTodoNode(testTodoNode, node_0_0)
        expect(testTodoNode?.children.length).toBe(1)

        assert(typeof testTodoNode?.children[0] === 'string')
        testTodoNode = await getTestTodoNode(testTodoNode.children[0])

        validateTodoNode(testTodoNode, node_0_0_0)
        expect(testTodoNode?.children.length).toBe(0)
      }))

    test('should import a todo with various todo nodes', () =>
      testApiRoute(async ({ caller }) => {
        /**
         * [ ] node_0
         * |__ [X] node_0_0
         * |__ [ ] node_0_1
         *     |__ [X] node_0_1_0
         *     |__ [ ] node_0_1_1
         *         |__ [X] node_0_1_1_0
         *     |__ [ ] node_0_1_2
         * |__ [ ] node_0_2
         * [ ] node_1
         * |__ [ ] node_1_0
         *     |__ [ ] node_1_0_0
         * [X] node_2
         * [ ] node_3 (collapsed)
         *     node_3_note
         * |__ [ ] node_3_0
         * [X] node_4
         */

        const node_0 = getFakeOpmlTodoNode({})
        const node_0_0 = getFakeOpmlTodoNode({ completed: true })
        const node_0_1 = getFakeOpmlTodoNode({})
        const node_0_1_0 = getFakeOpmlTodoNode({ completed: true })
        const node_0_1_1 = getFakeOpmlTodoNode({})
        const node_0_1_1_0 = getFakeOpmlTodoNode({ completed: true })
        const node_0_1_2 = getFakeOpmlTodoNode({})
        const node_0_2 = getFakeOpmlTodoNode({})
        const node_1 = getFakeOpmlTodoNode({})
        const node_1_0 = getFakeOpmlTodoNode({})
        const node_1_0_0 = getFakeOpmlTodoNode({})
        const node_2 = getFakeOpmlTodoNode({})
        const node_3 = getFakeOpmlTodoNode({ collapsed: true, note: 'node_3_note' })
        const node_3_0 = getFakeOpmlTodoNode({ collapsed: true })
        const node_4 = getFakeOpmlTodoNode({ completed: true })

        const { name, opml } = getFakeOpml([
          {
            ...node_0,
            children: [
              node_0_0,
              {
                ...node_0_1,
                children: [node_0_1_0, { ...node_0_1_1, children: [node_0_1_1_0] }, node_0_1_2],
              },
              node_0_2,
            ],
          },
          {
            ...node_1,
            children: [{ ...node_1_0, children: [node_1_0_0] }],
          },
          node_2,
          { ...node_3, children: [node_3_0] },
          node_4,
        ])

        const res = await caller.import.dynalist({ opml })

        const testTodo = await getTestTodo(res.id)

        validateTodo(testTodo, name, 5)

        expect(testTodo?.nodes.length).toBe(15)

        expect(testTodo?.root.length).toBe(5)

        assert(typeof testTodo?.root[0] === 'string')
        const testTodoNode_0 = await getTestTodoNode(testTodo.root[0])
        validateTodoNode(testTodoNode_0, node_0)
        expect(testTodoNode_0?.children.length).toBe(3)

        assert(typeof testTodoNode_0?.children[0] === 'string')
        const testTodoNode_0_0 = await getTestTodoNode(testTodoNode_0.children[0])
        validateTodoNode(testTodoNode_0_0, node_0_0)
        expect(testTodoNode_0_0?.children.length).toBe(0)

        assert(typeof testTodoNode_0.children[1] === 'string')
        const testTodoNode_0_1 = await getTestTodoNode(testTodoNode_0.children[1])
        validateTodoNode(testTodoNode_0_1, node_0_1)
        expect(testTodoNode_0_1?.children.length).toBe(3)

        assert(typeof testTodoNode_0_1?.children[0] === 'string')
        const testTodoNode_0_1_0 = await getTestTodoNode(testTodoNode_0_1.children[0])
        validateTodoNode(testTodoNode_0_1_0, node_0_1_0)
        expect(testTodoNode_0_1_0?.children.length).toBe(0)

        assert(typeof testTodoNode_0_1.children[1] === 'string')
        const testTodoNode_0_1_1 = await getTestTodoNode(testTodoNode_0_1.children[1])
        validateTodoNode(testTodoNode_0_1_1, node_0_1_1)
        expect(testTodoNode_0_1_1?.children.length).toBe(1)

        assert(typeof testTodoNode_0_1_1?.children[0] === 'string')
        const testTodoNode_0_1_1_0 = await getTestTodoNode(testTodoNode_0_1_1.children[0])
        validateTodoNode(testTodoNode_0_1_1_0, node_0_1_1_0)
        expect(testTodoNode_0_1_1_0?.children.length).toBe(0)

        assert(typeof testTodoNode_0_1.children[2] === 'string')
        const testTodoNode_0_1_2 = await getTestTodoNode(testTodoNode_0_1.children[2])
        validateTodoNode(testTodoNode_0_1_2, node_0_1_2)
        expect(testTodoNode_0_1_2?.children.length).toBe(0)

        assert(typeof testTodoNode_0.children[2] === 'string')
        const testTodoNode_0_2 = await getTestTodoNode(testTodoNode_0.children[2])
        validateTodoNode(testTodoNode_0_2, node_0_2)
        expect(testTodoNode_0_2?.children.length).toBe(0)

        assert(typeof testTodo.root[1] === 'string')
        const testTodoNode_1 = await getTestTodoNode(testTodo.root[1])
        validateTodoNode(testTodoNode_1, node_1)
        expect(testTodoNode_1?.children.length).toBe(1)

        assert(typeof testTodoNode_1?.children[0] === 'string')
        const testTodoNode_1_0 = await getTestTodoNode(testTodoNode_1.children[0])
        validateTodoNode(testTodoNode_1_0, node_1_0)
        expect(testTodoNode_1_0?.children.length).toBe(1)

        assert(typeof testTodoNode_1_0?.children[0] === 'string')
        const testTodoNode_1_0_0 = await getTestTodoNode(testTodoNode_1_0.children[0])
        validateTodoNode(testTodoNode_1_0_0, node_1_0_0)
        expect(testTodoNode_1_0_0?.children.length).toBe(0)

        assert(typeof testTodo.root[2] === 'string')
        const testTodoNode_2 = await getTestTodoNode(testTodo.root[2])
        validateTodoNode(testTodoNode_2, node_2)
        expect(testTodoNode_2?.children.length).toBe(0)

        assert(typeof testTodo.root[3] === 'string')
        const testTodoNode_3 = await getTestTodoNode(testTodo.root[3])
        validateTodoNode(testTodoNode_3, node_3)
        expect(testTodoNode_3?.children.length).toBe(1)

        assert(typeof testTodoNode_3?.children[0] === 'string')
        const testTodoNode_3_0 = await getTestTodoNode(testTodoNode_3.children[0])
        validateTodoNode(testTodoNode_3_0, node_3_0)
        expect(testTodoNode_3_0?.children.length).toBe(0)

        assert(typeof testTodo.root[4] === 'string')
        const testTodoNode_4 = await getTestTodoNode(testTodo.root[4])
        validateTodoNode(testTodoNode_4, node_4)
        expect(testTodoNode_4?.children.length).toBe(0)
      }))
  })
})

function getFakeOpml(fakeOpmlDeclaration: FakeOpmlDeclaration[]) {
  const name = faker.lorem.words()

  const opml = `<?xml version="1.0" encoding="utf-8"?>
<opml version="2.0">
  ${opmlHead}
  <body>
    <outline text="${name}">
      ${getFakeOpmlChildren(fakeOpmlDeclaration)}
    </outline>
  </body>
</opml>`

  return { name, opml }
}

function getFakeOpmlTodoNode(options: Omit<FakeOpmlDeclaration, 'children'>) {
  return {
    collapsed: options.collapsed ?? false,
    completed: options.completed ?? false,
    content: options.content ?? faker.lorem.words(),
    note: options.note,
  }
}

function getFakeOpmlChildren(children: FakeOpmlDeclaration['children']): string {
  return (
    children
      ?.map((child) => {
        const attributes: [string, string][] = []

        if (child.completed) {
          attributes.push(['complete', 'true'])
        }

        if (child.collapsed) {
          attributes.push(['collapsed', 'true'])
        }

        if (child.note) {
          attributes.push(['_note', child.note.replaceAll('\n', '&#10;')])
        }

        return `<outline text="${child.content ?? faker.lorem.words()}"${attributes
          .map((attribute) => ` ${attribute[0]}="${attribute[1]}"`)
          .join('')}>${getFakeOpmlChildren(child.children)}</outline>`
      })
      .join('') ?? ''
  )
}

function validateTodo(todo: Awaited<ReturnType<typeof getTestTodo>>, name: string, childrenCount: number) {
  expect(todo).toBeDefined()
  expect(todo?.name).toMatch(new RegExp(`^${name} \\(Dynalist \\d{13}\\)$`))
  expect(todo?.folderId).toBeNull()
  expect(todo?.slug).toMatch(new RegExp(`^${slug(name)}-dynalist-\\d{13}$`))

  expect(todo?.root).toBeDefined()
  expect(todo?.root.length).toBe(childrenCount)
}

function validateTodoNode(
  todoNode: TodoNode | undefined | null,
  validation: Partial<TodoNodeData> & { completed?: boolean }
) {
  expect(todoNode).toBeDefined()

  if (validation.collapsed !== undefined) {
    expect(todoNode?.collapsed).toBe(validation.collapsed)
  }

  if (validation.content !== undefined) {
    expect(todoNode?.content).toBe(validation.content)
  }

  if (validation.noteHtml !== undefined) {
    expect(todoNode?.noteHtml).toBe(validation.noteHtml)
  }

  if (validation.noteText !== undefined) {
    expect(todoNode?.noteText).toBe(validation.noteText)
  }

  if (validation.status !== undefined) {
    expect(todoNode?.status).toBe(validation.status)
  }

  if (validation.completed !== undefined) {
    expect(todoNode?.status).toBe(validation.completed ? TodoNodeStatus.COMPLETED : TodoNodeStatus.ACTIVE)
  }
}

interface FakeOpmlDeclaration {
  children?: FakeOpmlDeclaration[]
  collapsed?: boolean
  completed?: boolean
  content?: string
  note?: string
}
