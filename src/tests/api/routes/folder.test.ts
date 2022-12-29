import { FolderType } from '@prisma/client'
import cuid from 'cuid'
import { describe, expect, test } from 'vitest'

import {
  API_ERROR_FOLDER_ALREADY_EXISTS,
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST,
  API_ERROR_FOLDER_PARENT_INVALID_TYPE,
} from 'constants/error'
import { getTestUser, testApiRoute } from 'tests/api'
import {
  createTestNote,
  createTestNoteFolder,
  createTestTodo,
  createTestTodoFolder,
  getTestFolder,
  getTestFolders,
  getTestNotes,
  getTestTodos,
} from 'tests/api/db'

describe('folder', () => {
  describe('add', () => {
    test('should add a new folder at the root', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'folder'
        const type = FolderType.NOTE

        const res = await caller.folder.add({ name, type })

        const testFolder = await getTestFolder(res.id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBeNull()
      }))

    test('should add a new folder inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestNoteFolder()

        const name = 'folder'
        const type = FolderType.NOTE

        const res = await caller.folder.add({ name, type, parentId })

        const testFolder = await getTestFolder(res.id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not add a new folder inside a nonexisting folder', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'folder'
        const type = FolderType.NOTE
        const parentId = cuid()

        await expect(() => caller.folder.add({ name, type, parentId })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST
        )

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder not owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        const name = 'folder'
        const type = FolderType.NOTE

        await expect(() => caller.folder.add({ name, type, parentId })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST
        )

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new folder inside an existing folder of a different type', () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestTodoFolder()

        const name = 'folder'
        const type = FolderType.NOTE

        await expect(() => caller.folder.add({ name, type, parentId })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_INVALID_TYPE
        )

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(0)
      }))

    test('should not add a new duplicated folder at the root', () =>
      testApiRoute(async ({ caller }) => {
        await createTestTodoFolder()
        const { name, type } = await createTestTodoFolder()

        await expect(() => caller.folder.add({ name, type })).rejects.toThrow(API_ERROR_FOLDER_ALREADY_EXISTS)

        const testFolders = await getTestFolders({ name, type })

        expect(testFolders.length).toBe(1)
      }))

    test('should not add a new duplicated folder inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestNoteFolder()
        const { name, type } = await createTestNoteFolder({ parentId })

        await expect(() => caller.folder.add({ name, type, parentId })).rejects.toThrow(API_ERROR_FOLDER_ALREADY_EXISTS)

        const testFolders = await getTestFolders({ name, type, parentId })

        expect(testFolders.length).toBe(1)
      }))
  })

  describe('update', () => {
    test('should rename a folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestNoteFolder()
        const { id } = await createTestNoteFolder({ parentId })

        const newName = 'newName'

        const res = await caller.folder.update({ id, name: newName })

        expect(res.name).toBe(newName)

        const testFolder = await getTestFolder(id)

        expect(testFolder?.name).toBe(newName)
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not rename a folder if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, name } = await createTestNoteFolder()
        const { name: newName } = await createTestNoteFolder()

        await expect(() => caller.folder.update({ id, name: newName })).rejects.toThrow(API_ERROR_FOLDER_ALREADY_EXISTS)

        const testFolder = await getTestFolder(id)

        expect(testFolder?.name).toBe(name)
      }))

    test('should move a folder inside another folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newParentId } = await createTestNoteFolder()
        const { id, name } = await createTestNoteFolder()

        const res = await caller.folder.update({ id, parentId: newParentId })

        expect(res.parentId).toBe(newParentId)

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBe(newParentId)
      }))

    test('should move a folder to the root', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: parentId } = await createTestNoteFolder()
        const { id, name } = await createTestNoteFolder({ parentId })

        const res = await caller.folder.update({ id, parentId: null })

        expect(res.parentId).toBeNull()

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
        expect(testFolder?.parentId).toBeNull()
      }))

    test('should not move a folder if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newParentId } = await createTestNoteFolder()
        await createTestNoteFolder({ name: 'folder', parentId: newParentId })

        const { id, parentId } = await createTestNoteFolder({ name: 'folder' })

        await expect(() => caller.folder.update({ id, parentId: newParentId })).rejects.toThrow(
          API_ERROR_FOLDER_ALREADY_EXISTS
        )

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not move a folder inside a nonexisting folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, parentId } = await createTestNoteFolder()

        await expect(() => caller.folder.update({ id, parentId: cuid() })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST
        )

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not move a folder inside an existing folder not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newParentId } = await createTestNoteFolder({ userId: getTestUser('1').userId })
        const { id, parentId } = await createTestNoteFolder()

        await expect(() => caller.folder.update({ id, parentId: newParentId })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_DOES_NOT_EXIST
        )

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should not move a folder inside an existing folder of a different type', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newParentId } = await createTestTodoFolder()
        const { id, parentId } = await createTestNoteFolder()

        await expect(() => caller.folder.update({ id, parentId: newParentId })).rejects.toThrow(
          API_ERROR_FOLDER_PARENT_INVALID_TYPE
        )

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.parentId).toBe(parentId)
      }))

    test('should move & rename a folder at the same time', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newParentId } = await createTestNoteFolder()
        const { id } = await createTestNoteFolder()

        const newName = 'newName'

        const res = await caller.folder.update({ id, name: newName, parentId: newParentId })

        expect(res.name).toBe(newName)
        expect(res.parentId).toBe(newParentId)

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(newName)
        expect(testFolder?.parentId).toBe(newParentId)
      }))

    test('should not update a folder not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, name } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        await expect(() => caller.folder.update({ id, name: 'newName' })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
        expect(testFolder?.name).toBe(name)
      }))

    test('should not update a nonexisting folder', async () =>
      testApiRoute(async ({ caller }) => {
        const newName = 'newName'

        await expect(() => caller.folder.update({ id: cuid(), name: newName })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testNoteFolders = await getTestFolders({ name: newName, type: FolderType.NOTE })
        const testTodoFolders = await getTestFolders({ name: newName, type: FolderType.TODO })

        expect(testNoteFolders.length).toBe(0)
        expect(testTodoFolders.length).toBe(0)
      }))
  })

  describe('delete', () => {
    test('should remove an empty folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNoteFolder()

        await caller.folder.delete({ id })

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeNull()
      }))

    test('should remove a note folder containing nested nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folder_0_id } = await createTestNoteFolder()

        /**
         * folder_0
         * |__ folder_0_0
         * |__ folder_0_1
         *     |__ folder_0_1_0
         *     |__ folder_0_1_1
         *         |__ note_0_folder_0_1_1
         *     |__ note_0_folder_0_1
         * |__ note_0_folder_0
         * |__ note_1_folder_0
         * folder_1
         * |__ folder_1_0
         *     |__ note_0_folder_1_0
         * note_0
         * note_1
         */

        await createTestNote({ folderId: folder_0_id })
        await createTestNote({ folderId: folder_0_id })

        await createTestNoteFolder({ parentId: folder_0_id })
        const { id: folder_0_1_id } = await createTestNoteFolder({ parentId: folder_0_id })

        await createTestNote({ folderId: folder_0_1_id })

        await createTestNoteFolder({ parentId: folder_0_1_id })
        const { id: folder_0_1_1_id } = await createTestNoteFolder({ parentId: folder_0_1_id })

        await createTestNote({ folderId: folder_0_1_1_id })

        const { id: folder_1_id } = await createTestNoteFolder()

        const { id: folder_1_0_id } = await createTestNoteFolder({ parentId: folder_1_id })

        const { id: note_0_folder_1_0_id } = await createTestNote({ folderId: folder_1_0_id })

        const { id: note_0_id } = await createTestNote()
        const { id: note_1_id } = await createTestNote()

        await caller.folder.delete({ id: folder_0_id })

        const remainingFolderIds = [folder_1_id, folder_1_0_id]
        const testFolders = await getTestFolders({ type: FolderType.NOTE })

        expect(testFolders.length).toBe(remainingFolderIds.length)
        expect(testFolders.every((testFolder) => remainingFolderIds.includes(testFolder.id))).toBe(true)

        const remainingNotesIds = [note_0_id, note_1_id, note_0_folder_1_0_id]
        const testNotes = await getTestNotes()

        expect(testNotes.length).toBe(remainingNotesIds.length)
        expect(testNotes.every((testNote) => remainingNotesIds.includes(testNote.id))).toBe(true)
      }))

    test('should remove a todo folder containing nested nodes', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folder_0_id } = await createTestTodoFolder()
        const { id: folder_0_0_id } = await createTestTodoFolder({ parentId: folder_0_id })

        /**
         * folder_0
         * |__ folder_0_0
         *     |__ folder_0_0_0
         *     |__ folder_0_0_1
         *         |__ note_0_folder_0_0_1
         *     |__ todo_0_folder_0_1
         * |__ todo_0_folder_0
         * |__ todo_1_folder_0
         * todo_0
         * todo_1
         */

        const { id: todo_0_folder_0_id } = await createTestTodo({ folderId: folder_0_id })
        const { id: todo_1_folder_0_id } = await createTestTodo({ folderId: folder_0_id })

        await createTestTodo({ folderId: folder_0_0_id })

        await createTestTodoFolder({ parentId: folder_0_0_id })
        const { id: folder_0_0_1_id } = await createTestTodoFolder({ parentId: folder_0_0_id })

        await createTestTodo({ folderId: folder_0_0_1_id })

        const { id: todo_0_id } = await createTestTodo()
        const { id: todo_1_id } = await createTestTodo()

        await caller.folder.delete({ id: folder_0_0_id })

        const remainingFolderIds = [folder_0_id]
        const testFolders = await getTestFolders({ type: FolderType.TODO })

        expect(testFolders.length).toBe(remainingFolderIds.length)
        expect(testFolders.every((testFolder) => remainingFolderIds.includes(testFolder.id))).toBe(true)

        const remainingNotesIds = [todo_0_id, todo_1_id, todo_0_folder_0_id, todo_1_folder_0_id]
        const testTodos = await getTestTodos()

        expect(testTodos.length).toBe(remainingNotesIds.length)
        expect(testTodos.every((testNote) => remainingNotesIds.includes(testNote.id))).toBe(true)
      }))

    test('should not remove a folder not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        await expect(() => caller.folder.delete({ id })).rejects.toThrow(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeDefined()
      }))

    test('should not remove a nonexisting folder', () =>
      testApiRoute(async ({ caller }) => {
        const id = cuid()

        await expect(() => caller.folder.delete({ id })).rejects.toThrow(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testFolder = await getTestFolder(id)

        expect(testFolder).toBeNull()
      }))
  })
})
