import assert from 'assert'

import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { TodoNodeStatus, type Note } from '@prisma/client'
import cuid from 'cuid'

import { foldersToSeed, notesToSeed, todosToSeed } from './seed.data'

import { ContentType } from 'constants/contentType'
import { prisma } from 'libs/db'
import { addFolder, type FolderData } from 'libs/db/folder'
import { addNote, type NoteMetadata, updateNote } from 'libs/db/note'
import { addTodo, type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData, updateTodoNodes, type UpdateTodoNodesData } from 'libs/db/todoNodes'

async function main() {
  await seedEmailAllowList()
  await seedUsers()

  await seedFolders()

  await seedNotes()

  await seedTodos()
}

function seedEmailAllowList(count = 5) {
  const emails = Array.from({ length: count }, (_, i) => {
    return { email: `user${i + 1}@example.com` }
  })

  return prisma.emailAllowList.createMany({ data: emails })
}

async function seedUsers(count = 1) {
  const users = Array.from({ length: count }, (_, i) => {
    return { email: `user${i + 1}@example.com`, emailVerified: new Date() }
  })

  const adapter = PrismaAdapter(prisma)

  for (const user of users) {
    const { id } = await adapter.createUser(user)

    seededUserIds.push(id)
  }
}

async function seedFolders() {
  await seedTypedFolders(foldersToSeed[ContentType.NOTE], ContentType.NOTE)
  await seedTypedFolders(foldersToSeed[ContentType.TODO], ContentType.TODO)
}

async function seedTypedFolders(folders: FolderSeedDefinition[], type: ContentType, parentId?: string) {
  for (const folder of folders) {
    const newFolder = await addFolder(getUserId(1), type, folder.name, parentId)

    if (folder.children) {
      await seedTypedFolders(folder.children, type, newFolder.id)
    }
  }
}

async function seedNotes() {
  for (const note of notesToSeed) {
    let folderId: string | null = null

    if (note.folderName) {
      const folder = await prisma.folder.findFirst({ where: { name: note.folderName } })

      if (folder) {
        folderId = folder.id
      }
    }

    const newNote = await addNote(getUserId(1), note.name, folderId)

    if (note.html || note.text) {
      assert(note.html && note.text, 'Both html and text must be provided to create a note with content.')

      updateNote(newNote.id, getUserId(1), { html: note.html, text: note.text })
    }
  }
}

async function seedTodos() {
  for (const todo of todosToSeed) {
    let folderId: string | null = null

    if (todo.folderName) {
      const folder = await prisma.folder.findFirst({ where: { name: todo.folderName } })

      if (folder) {
        folderId = folder.id
      }
    }

    const newTodo = await addTodo(getUserId(1), todo.name, folderId, typeof todo.nodes === 'undefined')

    if (todo.nodes) {
      const children: UpdateTodoNodesData['children'] = { root: [] }
      const insert: UpdateTodoNodesData['mutations']['insert'] = {}

      parseTodoNodesToSeed(todo.nodes, children, insert)

      await updateTodoNodes(newTodo.id, getUserId(1), {
        children,
        mutations: { delete: [], insert, update: {} },
      })
    }
  }
}

function parseTodoNodesToSeed(
  nodes: TodoNodeSeedDefinition[],
  children: UpdateTodoNodesData['children'],
  insert: UpdateTodoNodesData['mutations']['insert'],
  parentId?: string
) {
  for (const node of nodes) {
    const id = cuid()

    children[id] = []

    if (!parentId) {
      children.root.push(id)
    } else {
      children[parentId]?.push(id)
    }

    insert[id] = {
      collapsed: node.collapsed ?? false,
      content: node.content,
      id,
      noteHtml: node.noteHtml ?? null,
      noteText: node.noteText ?? null,
      status: node.status ?? TodoNodeStatus.ACTIVE,
    }

    if (node.children) {
      parseTodoNodesToSeed(node.children, children, insert, id)
    }
  }
}

function getUserId(userIndex: number) {
  const userId = seededUserIds[userIndex - 1]

  assert(userId, `No user ID found for index ${userIndex}.`)

  return userId
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    await prisma.$disconnect()

    console.error('Error while seeding database:', error)

    process.exit(1)
  })

const seededUserIds: string[] = []

export type FoldersSeedDefinition = Record<ContentType, FolderSeedDefinition[]>

interface FolderSeedDefinition {
  name: FolderData['name']
  children?: FolderSeedDefinition[]
}

export interface NoteSeedDefinition {
  name: NoteMetadata['name']
  folderName?: FolderData['name']
  html?: Note['html']
  text?: Note['text']
}

export interface TodoSeedDefinition {
  name: TodoMetadata['name']
  folderName?: FolderData['name']
  nodes?: TodoNodeSeedDefinition[]
}

type TodoNodeSeedDefinition = Partial<Omit<TodoNodeData, 'id' | 'content'>> & {
  children?: TodoNodeSeedDefinition[]
  content: TodoNodeData['content']
}
