import { atom, type PrimitiveAtom, type WritableAtom } from 'jotai'

import { onlineAtom } from 'atoms/network'
import { type MutationAction } from 'libs/api/client'
import { type FolderData } from 'libs/db/folder'
import { type NoteMetadata } from 'libs/db/note'
import { type TodoMetadata } from 'libs/db/todo'
import { type A11yImageParams } from 'libs/image'

export const [folderModalAtom, setFolderModalOpenedAtom] = createMutationModalAtom<FolderData>()
export const [contentModalAtom, setContentModalOpenedAtom] = createMutationModalAtom<NoteMetadata | TodoMetadata>()

export const [shortcutModalAtom, setShortcutModalOpenedAtom] = createTogglableAtom()
export const [inboxDrawerAtom, setInboxDrawerOpenedAtom] = createTogglableAtom()

export const editorImageModalAtom = atom<EditorImageModal>({ opened: false })

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

function createTogglableAtom(): [PrimitiveAtom<boolean>, WritableAtom<null, boolean>] {
  const modalAtom = atom<boolean>(false)

  const setModalOpenedAtom: WritableAtom<null, boolean> = atom(null, (_get, set, opened: boolean) => {
    return set(modalAtom, opened)
  })

  return [modalAtom, setModalOpenedAtom]
}

interface MutationModal<TData> {
  action: MutationAction
  data: TData | undefined
  opened: boolean
}

interface EditorImageModal extends Partial<A11yImageParams> {
  opened: boolean
}
