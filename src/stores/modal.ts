import { type MutationType } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type StoreSlice } from 'stores'

export const createModalSlice: StoreSlice<ModalState> = (set) => ({
  content: {
    data: undefined,
    mutationType: undefined,
    opened: false,
  },
  folder: {
    data: undefined,
    mutationType: undefined,
    opened: false,
  },
  setContentModal: (opened: boolean, mutationType = 'add', content?: ContentMetadata) => {
    return set(() => ({ content: { data: content, mutationType, opened } }))
  },
  setFolderModal: (opened: boolean, mutationType = 'add', folder?: FolderData) => {
    return set(() => ({ folder: { data: folder, mutationType, opened } }))
  },
})

export interface ModalState {
  content: MutationModal<ContentMetadata>
  folder: MutationModal<FolderData>
  setContentModal: (opened: boolean, mutationType?: MutationType, content?: ContentMetadata) => void
  setFolderModal: (opened: boolean, mutationType?: MutationType, folder?: FolderData) => void
}

interface MutationModal<TData> {
  data: TData | undefined
  mutationType: MutationType | undefined
  opened: boolean
}

type ContentMetadata = NoteMetadata | TodoMetadata
