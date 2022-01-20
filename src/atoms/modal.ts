import { atom } from 'jotai'

import { type MutationAction } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'

export const contentModalAtom = atom<MutationModal<NoteMetadata | TodoMetadata>>({
  action: undefined,
  data: undefined,
  opened: false,
})

export const setContentModalOpenedAtom = atom(null, (get, set, opened: boolean) => {
  return set(contentModalAtom, { ...get(contentModalAtom), action: 'insert', data: undefined, opened })
})

export const folderModalAtom = atom<MutationModal<FolderData>>({
  action: undefined,
  data: undefined,
  opened: false,
})

export const setFolderModalOpenedAtom = atom(null, (get, set, opened: boolean) => {
  return set(folderModalAtom, { ...get(folderModalAtom), action: 'insert', data: undefined, opened })
})

interface MutationModal<TData> {
  action: MutationAction | undefined
  data: TData | undefined
  opened: boolean
}
