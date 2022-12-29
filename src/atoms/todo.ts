import { atom } from 'jotai/vanilla'
import { atomWithReset, atomWithStorage, RESET } from 'jotai/vanilla/utils'

import { todoNodeChildrenAtom, todoNodeMutationsAtom, todoNodeNodesAtom } from 'atoms/todoNode'
import { type SyncStatus } from 'components/ui/SyncReport'
import { isEmpty } from 'libs/array'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'

export const todoSyncStatusAtom = atomWithReset<TodoSyncStatus>({ isLoading: false })

export const todoEditorStateAtom = atom<TodoEditorState, [TodoSyncStatus], unknown>(
  (get) => {
    const state = get(todoSyncStatusAtom)
    const mutations = get(todoNodeMutationsAtom)

    return {
      ...state,
      pristine: isEmpty(Object.keys(mutations)),
    }
  },
  (_get, set, syncStatus: TodoSyncStatus) => {
    set(todoSyncStatusAtom, syncStatus)
  }
)

export const resetTodoAtomsAtom = atom(null, (_get, set) => {
  set(todoNodeChildrenAtom, RESET)
  set(todoNodeNodesAtom, RESET)
  set(todoNodeMutationsAtom, RESET)
  set(todoSyncStatusAtom, RESET)
})

export const todoFocusMapAtom = atomWithStorage<Record<TodoMetadata['id'], TodoNodeData['id']>>('haku.todoFocusMap', {})

export interface TodoSyncStatus extends SyncStatus {
  isLoading: boolean
}

export interface TodoEditorState extends TodoSyncStatus {
  pristine: boolean
}
