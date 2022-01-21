import { atom, type WritableAtom } from 'jotai'

import { type MutationAction } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'

export const [folderModalAtom, setFolderModalOpenedAtom] = createMutationModalAtom<FolderData>()
export const [contentModalAtom, setContentModalOpenedAtom] = createMutationModalAtom<NoteMetadata | TodoMetadata>()

function createMutationModalAtom<TData>(): [
  WritableAtom<MutationModal<TData>, MutationModal<TData>>,
  WritableAtom<null, boolean>
] {
  const modalAtom = atom<MutationModal<TData>>({
    action: 'insert',
    data: undefined,
    opened: false,
  })

  const setModalOpenedAtom: WritableAtom<null, boolean> = atom(null, (get, set, opened: boolean) => {
    return set(modalAtom, { ...get(modalAtom), action: 'insert', data: undefined, opened })
  })

  return [modalAtom, setModalOpenedAtom]
}

interface MutationModal<TData> {
  action: MutationAction
  data: TData | undefined
  opened: boolean
}