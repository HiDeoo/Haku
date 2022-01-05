import { type FolderData } from 'libs/db/folder'
import { type NoteMetaData } from 'libs/db/note'
import { type TodoMetaData } from 'libs/db/todo'
import { type StoreSlice } from 'stores'

export const createModalSlice: StoreSlice<ModalState> = (set) => ({
  content: undefined,
  contentModalOpened: false,
  folder: undefined,
  folderModalOpened: false,
  setContentModalOpened: (opened: boolean, content?: ContentData) => {
    return set(() => ({ content, contentModalOpened: opened }))
  },
  setFolderModalOpened: (opened: boolean, folder?: FolderData) => {
    return set(() => ({ folder, folderModalOpened: opened }))
  },
})

export interface ModalState {
  content: ContentData | undefined
  contentModalOpened: boolean
  folder: FolderData | undefined
  folderModalOpened: boolean
  setContentModalOpened: (opened: boolean, content?: ContentData) => void
  setFolderModalOpened: (opened: boolean, folder?: FolderData) => void
}

type ContentData = NoteMetaData | TodoMetaData
