import { atom, type WritableAtom } from 'jotai'

import { onlineAtom } from 'atoms/network'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type A11yImageParams } from 'libs/image'

export const [folderModalAtom, setFolderModalOpenedAtom] = createMutationModalAtom<FolderData>()
export const [contentModalAtom, setContentModalOpenedAtom] = createMutationModalAtom<NoteMetadata | TodoMetadata>()

export const editorImageModalAtom = atom<EditorImageModal>({ opened: false })

export const shortcutModalOpenedAtom = atom(false)

export const inboxDrawerOpenedAtom = atom(false)

export const commandPaletteOpenedAtom = atom(false)
export const navigationPaletteOpenedAtom = atom(false)
export const searchPaletteOpenedAtom = atom(false)

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
    const online = get(onlineAtom)

    return set(modalAtom, { ...get(modalAtom), action: 'insert', data: undefined, opened: !online ? false : opened })
  })

  return [modalAtom, setModalOpenedAtom]
}

interface MutationModal<TData> {
  action: 'insert' | 'update' | 'delete'
  data: TData | undefined
  opened: boolean
}

interface EditorImageModal extends Partial<A11yImageParams> {
  opened: boolean
}
