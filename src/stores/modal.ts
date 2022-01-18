import { type MutationAction } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type StoreSlice } from 'stores'

export const createModalSlice: StoreSlice<ModalState> = (set) => ({
  contentModal: {
    action: undefined,
    data: undefined,
    opened: false,
  },
  folderModal: {
    action: undefined,
    data: undefined,
    opened: false,
  },
  setContentModal: (opened: boolean, action = 'insert', content?: ContentMetadata) => {
    return set(() => ({ contentModal: { data: content, action, opened } }))
  },
  setFolderModal: (opened: boolean, action = 'insert', folder?: FolderData) => {
    return set(() => ({ folderModal: { data: folder, action, opened } }))
  },
})

export interface ModalState {
  contentModal: MutationModal<ContentMetadata>
  folderModal: MutationModal<FolderData>
  setContentModal: (opened: boolean, action?: MutationAction, content?: ContentMetadata) => void
  setFolderModal: (opened: boolean, action?: MutationAction, folder?: FolderData) => void
}

interface MutationModal<TData> {
  action: MutationAction | undefined
  data: TData | undefined
  opened: boolean
}

type ContentMetadata = NoteMetadata | TodoMetadata
