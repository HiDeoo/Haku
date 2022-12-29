import assert from 'assert'

import cuid from 'cuid'
import slug from 'url-slug'
import { describe, expect, test, vi } from 'vitest'

import {
  API_ERROR_FOLDER_DOES_NOT_EXIST,
  API_ERROR_FOLDER_INVALID_TYPE,
  API_ERROR_NOTE_ALREADY_EXISTS,
  API_ERROR_NOTE_DOES_NOT_EXIST,
  API_ERROR_NOTE_HTML_OR_TEXT_MISSING,
} from 'constants/error'
import { HttpMethod } from 'constants/http'
import { getCloudinaryApiUrl } from 'libs/cloudinary'
import { isDateAfter, isDateEqual } from 'libs/date'
import { hasKey } from 'libs/object'
import { assertIsTreeFolder, assertIsTreeItem } from 'libs/tree'
import { getTestUser, testApiRoute } from 'tests/api'
import { createTestNote, createTestNoteFolder, createTestTodoFolder, getTestNote, getTestNotes } from 'tests/api/db'

describe('note', () => {
  describe('list', () => {
    test('should return an empty tree', () =>
      testApiRoute(async ({ caller }) => {
        const res = await caller.note.list()

        expect(res.length).toBe(0)
      }))

    test('should return a tree with only root notes and no folder', () =>
      testApiRoute(async ({ caller }) => {
        const { name: note_0 } = await createTestNote({ name: 'note_0' })
        const { name: note_1 } = await createTestNote({ name: 'note_1' })

        const res = await caller.note.list()

        expect(res.length).toBe(2)

        assertIsTreeItem(res[0])
        expect(res[0].name).toBe(note_0)

        assertIsTreeItem(res[1])
        expect(res[1].name).toBe(note_1)
      }))

    test('should return a tree with only root nodes', () =>
      testApiRoute(async ({ caller }) => {
        const { name: note_0 } = await createTestNote({ name: 'note_0' })
        const { name: note_1 } = await createTestNote({ name: 'note_1' })
        const { name: note_2 } = await createTestNote({ name: 'note_2' })

        const { name: folder_0 } = await createTestNoteFolder({ name: 'folder_0' })
        const { name: folder_1 } = await createTestNoteFolder({ name: 'folder_1' })
        const { name: folder_2 } = await createTestNoteFolder({ name: 'folder_2' })

        const res = await caller.note.list()

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
        expect(res[3].name).toBe(note_0)

        assertIsTreeItem(res[4])
        expect(res[4].name).toBe(note_1)

        assertIsTreeItem(res[5])
        expect(res[5].name).toBe(note_2)
      }))

    test('should return a tree with nested nodes', () =>
      testApiRoute(async ({ caller }) => {
        /**
         * folder_0
         * |__ folder_0_0
         * |__ folder_0_1
         *     |__ folder_0_1_0
         *     |__ folder_0_1_1
         *         |__ note_0_folder_0_1_1
         *         |__ note_1_folder_0_1_1
         *     |__ note_0_folder_0_1
         * |__ note_0_folder_0
         * folder_1
         * folder_2
         * |__ folder_2_0
         *     |__ folder_2_0_0
         *         |__ folder_2_0_0_0
         *         |__ folder_2_0_0_1
         *             |__ note_0_folder_2_0_0_1
         *             |__ note_1_folder_2_0_0_1
         * |__ folder_2_1
         * note_0
         * note_1
         */

        const { name: note_0 } = await createTestNote({ name: 'note_0' })
        const { name: note_1 } = await createTestNote({ name: 'note_1' })

        const { id: folder_0_id, name: folder_0 } = await createTestNoteFolder({ name: 'folder_0' })

        const { name: note_0_folder_0 } = await createTestNote({ name: 'note_0_folder_0', folderId: folder_0_id })

        const { name: folder_0_0 } = await createTestNoteFolder({ name: 'folder_0_0', parentId: folder_0_id })
        const { id: folder_0_1_id, name: folder_0_1 } = await createTestNoteFolder({
          name: 'folder_0_1',
          parentId: folder_0_id,
        })

        const { name: note_0_folder_0_1 } = await createTestNote({
          name: 'note_0_folder_0_1',
          folderId: folder_0_1_id,
        })

        const { name: folder_0_1_0 } = await createTestNoteFolder({ name: 'folder_0_1_0', parentId: folder_0_1_id })
        const { id: folder_0_1_1_id, name: folder_0_1_1 } = await createTestNoteFolder({
          name: 'folder_0_1_1',
          parentId: folder_0_1_id,
        })

        const { name: note_0_folder_0_1_1 } = await createTestNote({
          name: 'note_0_folder_0_1_1',
          folderId: folder_0_1_1_id,
        })
        const { name: note_1_folder_0_1_1 } = await createTestNote({
          name: 'note_1_folder_0_1_1',
          folderId: folder_0_1_1_id,
        })

        const { name: folder_1 } = await createTestNoteFolder({ name: 'folder_1' })

        const { id: folder_2_id, name: folder_2 } = await createTestNoteFolder({ name: 'folder_2' })

        const { id: folder_2_0_id, name: folder_2_0 } = await createTestNoteFolder({
          name: 'folder_2_0',
          parentId: folder_2_id,
        })
        const { name: folder_2_1 } = await createTestNoteFolder({ name: 'folder_2_1', parentId: folder_2_id })

        const { id: folder_2_0_0_id, name: folder_2_0_0 } = await createTestNoteFolder({
          name: 'folder_2_0_0',
          parentId: folder_2_0_id,
        })

        const { name: folder_2_0_0_0 } = await createTestNoteFolder({
          name: 'folder_2_0_0_0',
          parentId: folder_2_0_0_id,
        })
        const { id: folder_2_0_0_1_id, name: folder_2_0_0_1 } = await createTestNoteFolder({
          name: 'folder_2_0_0_1',
          parentId: folder_2_0_0_id,
        })

        const { name: note_0_folder_2_0_0_1 } = await createTestNote({
          name: 'note_0_folder_2_0_0_1',
          folderId: folder_2_0_0_1_id,
        })
        const { name: note_1_folder_2_0_0_1 } = await createTestNote({
          name: 'note_1_folder_2_0_0_1',
          folderId: folder_2_0_0_1_id,
        })

        const res = await caller.note.list()

        expect(res.length).toBe(5)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0)
        expect(res[0].children.length).toBe(2)
        expect(res[0].items.length).toBe(1)

        expect(res[0].children[0]?.name).toBe(folder_0_0)
        expect(res[0].children[0]?.children.length).toBe(0)
        expect(res[0].children[0]?.items.length).toBe(0)

        expect(res[0].children[1]?.name).toBe(folder_0_1)
        expect(res[0].children[1]?.children.length).toBe(2)
        expect(res[0].children[1]?.items.length).toBe(1)

        expect(res[0].items[0]?.name).toBe(note_0_folder_0)

        expect(res[0].children[1]?.items[0]?.name).toBe(note_0_folder_0_1)

        expect(res[0].children[1]?.children[0]?.name).toBe(folder_0_1_0)
        expect(res[0].children[1]?.children[0]?.children.length).toBe(0)
        expect(res[0].children[1]?.children[0]?.items.length).toBe(0)

        expect(res[0].children[1]?.children[1]?.name).toBe(folder_0_1_1)
        expect(res[0].children[1]?.children[1]?.children.length).toBe(0)
        expect(res[0].children[1]?.children[1]?.items.length).toBe(2)

        expect(res[0].children[1]?.children[1]?.items[0]?.name).toBe(note_0_folder_0_1_1)

        expect(res[0].children[1]?.children[1]?.items[1]?.name).toBe(note_1_folder_0_1_1)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_1)
        expect(res[1].children.length).toBe(0)
        expect(res[1].items.length).toBe(0)

        assertIsTreeFolder(res[2])
        expect(res[2].name).toBe(folder_2)
        expect(res[2].children.length).toBe(2)
        expect(res[2].items.length).toBe(0)

        expect(res[2].children[0]?.name).toBe(folder_2_0)
        expect(res[2].children[0]?.children.length).toBe(1)
        expect(res[2].children[0]?.items.length).toBe(0)

        expect(res[2].children[0]?.children[0]?.name).toBe(folder_2_0_0)
        expect(res[2].children[0]?.children[0]?.children.length).toBe(2)
        expect(res[2].children[0]?.children[0]?.items.length).toBe(0)

        expect(res[2].children[0]?.children[0]?.children[0]?.name).toBe(folder_2_0_0_0)
        expect(res[2].children[0]?.children[0]?.children[0]?.children.length).toBe(0)
        expect(res[2].children[0]?.children[0]?.children[0]?.items.length).toBe(0)

        expect(res[2].children[0]?.children[0]?.children[1]?.name).toBe(folder_2_0_0_1)
        expect(res[2].children[0]?.children[0]?.children[1]?.children.length).toBe(0)
        expect(res[2].children[0]?.children[0]?.children[1]?.items.length).toBe(2)

        expect(res[2].children[0]?.children[0]?.children[1]?.items[0]?.name).toBe(note_0_folder_2_0_0_1)

        expect(res[2].children[0]?.children[0]?.children[1]?.items[1]?.name).toBe(note_1_folder_2_0_0_1)

        expect(res[2].children[1]?.name).toBe(folder_2_1)
        expect(res[2].children[1]?.children.length).toBe(0)
        expect(res[2].children[1]?.items.length).toBe(0)

        assertIsTreeItem(res[3])
        expect(res[3].name).toBe(note_0)

        assertIsTreeItem(res[4])
        expect(res[4].name).toBe(note_1)
      }))

    test('should return only nodes owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folder_0_user_0_id, name: folder_0_user_0 } = await createTestNoteFolder({
          name: 'folder_0_user_0',
        })
        const { name: folder_1_user_0 } = await createTestNoteFolder({ name: 'folder_1_user_0' })

        const { id: folder_0_0_user_0_id, name: folder_0_0_user_0 } = await createTestNoteFolder({
          name: 'folder_0_0_user_0',
          parentId: folder_0_user_0_id,
        })
        const { name: folder_0_1_user_0 } = await createTestNoteFolder({
          name: 'folder_0_1_user_0',
          parentId: folder_0_user_0_id,
        })

        const { name: note_0_folder_0_user_0 } = await createTestNote({
          name: 'note_0_folder_0_user_0',
          folderId: folder_0_user_0_id,
        })
        const { name: note_0_folder_0_0_user_0 } = await createTestNote({
          name: 'note_0_folder_0_0_user_0',
          folderId: folder_0_0_user_0_id,
        })

        const { userId: userId1 } = getTestUser('1')

        const { id: folder_0_user_1_id } = await createTestNoteFolder({ name: 'folder_0_user_1', userId: userId1 })

        await createTestNoteFolder({ name: 'folder_0_0_user_1', parentId: folder_0_user_1_id })

        await createTestNote({ name: 'note_0_folder_0_user_1', folderId: folder_0_user_1_id, userId: userId1 })
        await createTestNote({ name: 'note_0_folder_0_0_user_1', folderId: folder_0_0_user_0_id, userId: userId1 })

        const res = await caller.note.list()

        expect(res.length).toBe(2)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0_user_0)
        expect(res[0].children.length).toBe(2)
        expect(res[0].items.length).toBe(1)

        expect(res[0].items[0]?.name).toBe(note_0_folder_0_user_0)

        expect(res[0].children[0]?.name).toBe(folder_0_0_user_0)
        expect(res[0].children[0]?.children.length).toBe(0)
        expect(res[0].children[0]?.items.length).toBe(1)

        expect(res[0].children[0]?.items[0]?.name).toBe(note_0_folder_0_0_user_0)

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
        const { name: folder_0_type_note } = await createTestNoteFolder({ name: 'folder_0_type_note' })

        await createTestTodoFolder({ name: 'folder_0_type_todo' })

        const res = await caller.note.list()

        expect(res.length).toBe(1)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_0_type_note)
        expect(res[0].children.length).toBe(0)
      }))

    test('should return a tree with nodes ordered alphabetically ignoring letter case', () =>
      testApiRoute(async ({ caller }) => {
        const { name: note_z } = await createTestNote({ name: 'note_Z' })
        const { name: note_a } = await createTestNote({ name: 'note_a' })

        const { name: folder_z } = await createTestNoteFolder({ name: 'folder_Z' })
        const { id: folder_a_id, name: folder_a } = await createTestNoteFolder({ name: 'folder_a' })

        const { name: note_z_folder_a } = await createTestNote({ name: 'note_z_folder_a', folderId: folder_a_id })
        const { name: note_a_folder_a } = await createTestNote({ name: 'note_a_folder_a', folderId: folder_a_id })

        const { name: folder_a_z } = await createTestNoteFolder({ name: 'folder_a_z', parentId: folder_a_id })
        const { name: folder_a_a } = await createTestNoteFolder({ name: 'folder_a_a', parentId: folder_a_id })

        const res = await caller.note.list()

        expect(res.length).toBe(4)

        assertIsTreeFolder(res[0])
        expect(res[0].name).toBe(folder_a)

        expect(res[0].children.length).toBe(2)
        expect(res[0].children[0]?.name).toBe(folder_a_a)
        expect(res[0].children[1]?.name).toBe(folder_a_z)

        expect(res[0].items.length).toBe(2)
        expect(res[0].items[0]?.name).toBe(note_a_folder_a)
        expect(res[0].items[1]?.name).toBe(note_z_folder_a)

        assertIsTreeFolder(res[1])
        expect(res[1].name).toBe(folder_z)

        assertIsTreeItem(res[2])
        expect(res[2].name).toBe(note_a)

        assertIsTreeItem(res[3])
        expect(res[3].name).toBe(note_z)
      }))

    test('should return a tree with only metadata and no content', () =>
      testApiRoute(async ({ caller }) => {
        await createTestNote()

        const res = await caller.note.list()

        assertIsTreeItem(res[0])
        expect(hasKey(res[0], 'html')).toBe(false)
        expect(hasKey(res[0], 'modifiedAt')).toBe(false)
      }))
  })

  describe('byId', () => {
    test('should return a note', async () =>
      testApiRoute(async ({ caller }) => {
        const { html, folderId, id, name, slug } = await createTestNote()

        const res = await caller.note.byId({ id })

        expect(res.name).toBe(name)
        expect(res.slug).toBe(slug)
        expect(res.folderId).toBe(folderId)
        expect(res.html).toBe(html)
        expect(hasKey(res, 'text')).toBe(false)
        expect(hasKey(res, 'modifiedAt')).toBe(false)
      }))

    test('should not return a nonexisting note', async () =>
      testApiRoute(async ({ caller }) => {
        await expect(() => caller.note.byId({ id: cuid() })).rejects.toThrow(API_ERROR_NOTE_DOES_NOT_EXIST)
      }))

    test('should not return a note not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNote({ userId: getTestUser('1').userId })

        await expect(() => caller.note.byId({ id })).rejects.toThrow(API_ERROR_NOTE_DOES_NOT_EXIST)
      }))
  })

  describe('add', () => {
    test('should add a new note at the root', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'note'

        const res = await caller.note.add({ name })

        const testNote = await getTestNote(res.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBeNull()
        expect(testNote?.slug).toBe(slug(name))
      }))

    test('should add a new note inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()

        const name = 'note'

        const res = await caller.note.add({ name, folderId })

        const testNote = await getTestNote(res.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBe(folderId)
        expect(testNote?.slug).toBe(slug(name))
      }))

    test('should add a new note and attach to it a valid URL slug', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'note Note 1/10 ½ 🤔'

        const res = await caller.note.add({ name })

        const testNote = await getTestNote(res.id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBeNull()
        expect(testNote?.slug).toBe('note-note-1-10-1-2')
      }))

    test('should add a new note and populate its data', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'Test Note'

        const res = await caller.note.add({ name })

        const testNote = await getTestNote(res.id)

        expect(testNote).toBeDefined()
        expect(testNote?.html).toBe(`<h1>${name}</h1><p></p>`)
        expect(testNote?.text).toBe(`${name}\n\n`)
        expect(testNote?.modifiedAt).toBeDefined()
      }))

    test('should not add a new note inside a nonexisting folder', () =>
      testApiRoute(async ({ caller }) => {
        const name = 'note'
        const folderId = cuid()

        await expect(() => caller.note.add({ name, folderId })).rejects.toThrow(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder not owned by the current user', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        const name = 'note'

        await expect(() => caller.note.add({ name, folderId })).rejects.toThrow(API_ERROR_FOLDER_DOES_NOT_EXIST)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new note inside an existing folder of a different type', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestTodoFolder()

        const name = 'note'

        await expect(() => caller.note.add({ name, folderId })).rejects.toThrow(API_ERROR_FOLDER_INVALID_TYPE)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(0)
      }))

    test('should not add a new duplicated note at the root', () =>
      testApiRoute(async ({ caller }) => {
        const { name } = await createTestNote()

        await expect(() => caller.note.add({ name })).rejects.toThrow(API_ERROR_NOTE_ALREADY_EXISTS)

        const testNotes = await getTestNotes({ name })

        expect(testNotes.length).toBe(1)
      }))

    test('should not add a new duplicated note inside an existing folder', () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()
        const { name } = await createTestNote({ folderId })

        await expect(() => caller.note.add({ name, folderId })).rejects.toThrow(API_ERROR_NOTE_ALREADY_EXISTS)

        const testNotes = await getTestNotes({ name, folderId })

        expect(testNotes.length).toBe(1)
      }))
  })

  describe('update', () => {
    test('should rename a note and update its slug', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()
        const { html, id, modifiedAt, text } = await createTestNote({ folderId })

        const newName = 'newName'

        const res = await caller.note.update({ id, name: newName })

        expect(res.name).toBe(newName)
        expect(hasKey(res, 'html')).toBe(false)

        const testNote = await getTestNote(id)

        expect(testNote?.name).toBe(newName)
        expect(testNote?.slug).toBe(slug(newName))
        expect(testNote?.folderId).toBe(folderId)
        expect(testNote?.html).toBe(html)
        expect(testNote?.text).toBe(text)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not rename a note if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, name } = await createTestNote()
        const { name: newName } = await createTestNote()

        await expect(() => caller.note.update({ id, name: newName })).rejects.toThrow(API_ERROR_NOTE_ALREADY_EXISTS)

        const testNote = await getTestNote(id)

        expect(testNote?.name).toBe(name)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move a note inside another folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()
        const { id: newFolderId } = await createTestNoteFolder()

        const { html, id, modifiedAt, slug, text } = await createTestNote({ folderId })

        const res = await caller.note.update({ id, folderId: newFolderId })

        expect(res.folderId).toBe(newFolderId)
        expect(hasKey(res, 'html')).toBe(false)

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBe(newFolderId)
        expect(testNote?.slug).toBe(slug)
        expect(testNote?.html).toBe(html)
        expect(testNote?.text).toBe(text)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move a note to the root', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()

        const { html, id, modifiedAt, slug, text } = await createTestNote({ folderId })

        const res = await caller.note.update({ id, folderId: null })

        expect(res.folderId).toBeNull()
        expect(hasKey(res, 'html')).toBe(false)

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBeNull()
        expect(testNote?.slug).toBe(slug)
        expect(testNote?.html).toBe(html)
        expect(testNote?.text).toBe(text)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a note if becoming duplicated', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: folderId } = await createTestNoteFolder()
        const { id: newFolderId } = await createTestNoteFolder()

        const { id, modifiedAt } = await createTestNote({ folderId, name: 'note' })
        await createTestNote({ folderId: newFolderId, name: 'note' })

        await expect(() => caller.note.update({ id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_NOTE_ALREADY_EXISTS
        )

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBe(folderId)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a note inside a nonexisting folder', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, folderId, modifiedAt } = await createTestNote()

        await expect(() => caller.note.update({ id, folderId: cuid() })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBe(folderId)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a note inside an existing folder not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestNoteFolder({ userId: getTestUser('1').userId })

        const { id, folderId, modifiedAt } = await createTestNote()

        await expect(() => caller.note.update({ id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_FOLDER_DOES_NOT_EXIST
        )

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBe(folderId)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not move a note inside an existing folder of a different type', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestTodoFolder()

        const { id, folderId, modifiedAt } = await createTestNote()

        await expect(() => caller.note.update({ id, folderId: newFolderId })).rejects.toThrow(
          API_ERROR_FOLDER_INVALID_TYPE
        )

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.folderId).toBe(folderId)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should move, rename & update a note at the same time', async () =>
      testApiRoute(async ({ caller }) => {
        const { id: newFolderId } = await createTestNoteFolder()

        const { id, modifiedAt } = await createTestNote()

        const newName = 'newName'
        const newHtml = '<p>test</p>'
        const newText = 'test\n\n'

        const res = await caller.note.update({
          id,
          name: newName,
          folderId: newFolderId,
          html: newHtml,
          text: newText,
        })

        expect(res.name).toBe(newName)
        expect(res.folderId).toBe(newFolderId)
        expect(hasKey(res, 'html')).toBe(true)
        expect(hasKey(res, 'text')).toBe(false)

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(newName)
        expect(testNote?.folderId).toBe(newFolderId)
        expect(testNote?.slug).toBe(slug(newName))
        expect(testNote?.html).toBe(newHtml)
        expect(testNote?.text).toBe(newText)
        expect(isDateAfter(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a note not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, name } = await createTestNote({ userId: getTestUser('1').userId })

        await expect(() => caller.note.update({ id, name: 'newName' })).rejects.toThrow(API_ERROR_NOTE_DOES_NOT_EXIST)

        const testNote = await getTestNote(id)

        expect(testNote).toBeDefined()
        expect(testNote?.name).toBe(name)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a nonexisting note', async () =>
      testApiRoute(async ({ caller }) => {
        const newName = 'newName'

        await expect(() => caller.note.update({ id: cuid(), name: newName })).rejects.toThrow(
          API_ERROR_NOTE_DOES_NOT_EXIST
        )

        const testNotes = await getTestNotes({ name: newName })

        expect(testNotes.length).toBe(0)
      }))

    test('should update a note content', async () =>
      testApiRoute(async ({ caller }) => {
        const { id, modifiedAt, name, folderId } = await createTestNote()

        const newHtml = '<p>test</p>'
        const newText = 'test\n\n'

        const res = await caller.note.update({ id, html: newHtml, text: newText })

        expect(res.name).toBe(name)
        expect(res.folderId).toBe(folderId)
        expect(hasKey(res, 'html')).toBe(true)
        expect(hasKey(res, 'text')).toBe(false)

        const testNote = await getTestNote(id)

        expect(testNote?.name).toBe(name)
        expect(testNote?.folderId).toBe(folderId)
        expect(testNote?.html).toBe(newHtml)
        expect(testNote?.text).toBe(newText)
        expect(isDateAfter(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a note content if the content html is missing', async () =>
      testApiRoute(async ({ caller }) => {
        const { html, id, modifiedAt, text } = await createTestNote()

        const newHtml = '<p>test</p>'

        await expect(() => caller.note.update({ id, html: newHtml })).rejects.toThrow(
          API_ERROR_NOTE_HTML_OR_TEXT_MISSING
        )

        const testNote = await getTestNote(id)

        expect(testNote?.html).toBe(html)
        expect(testNote?.text).toBe(text)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))

    test('should not update a note content if the content text is missing', async () =>
      testApiRoute(async ({ caller }) => {
        const { html, id, modifiedAt, text } = await createTestNote()

        const newText = 'test\n\n'

        await expect(() => caller.note.update({ id, text: newText })).rejects.toThrow(
          API_ERROR_NOTE_HTML_OR_TEXT_MISSING
        )

        const testNote = await getTestNote(id)

        expect(testNote?.html).toBe(html)
        expect(testNote?.text).toBe(text)
        expect(isDateEqual(testNote?.modifiedAt, modifiedAt)).toBe(true)
      }))
  })

  describe('delete', () => {
    test('should remove a note and its associated images', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNote()

        const fetchSpy = vi.spyOn(global, 'fetch')

        await caller.note.delete({ id })

        const testNote = await getTestNote(id)

        expect(testNote).toBeNull()

        const deleteUrl = getCloudinaryApiUrl(`/resources/image/tags/${id}`)
        const cloudinaryApiReqIndex = fetchSpy.mock.calls.findIndex(([callUrl]) => callUrl === deleteUrl)

        const cloudinaryApiReq = fetchSpy.mock.calls[cloudinaryApiReqIndex]
        assert(cloudinaryApiReq)

        const [cloudinaryApiCallUrl, cloudinaryApiCallOptions] = cloudinaryApiReq

        expect(cloudinaryApiCallUrl).toBe(deleteUrl)
        expect(cloudinaryApiCallOptions?.method).toBe(HttpMethod.DELETE)

        fetchSpy.mockRestore()
      }))

    test('should not remove a note not owned by the current user', async () =>
      testApiRoute(async ({ caller }) => {
        const { id } = await createTestNote({ userId: getTestUser('1').userId })

        await expect(() => caller.note.delete({ id })).rejects.toThrow(API_ERROR_NOTE_DOES_NOT_EXIST)

        const testFolder = await getTestNote(id)

        expect(testFolder).toBeDefined()
      }))

    test('should not remove a nonexisting note', () =>
      testApiRoute(async ({ caller }) => {
        const id = cuid()

        await expect(() => caller.note.delete({ id })).rejects.toThrow(API_ERROR_NOTE_DOES_NOT_EXIST)

        const testFolder = await getTestNote(id)

        expect(testFolder).toBeNull()
      }))
  })
})
