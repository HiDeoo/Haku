import { atom } from 'jotai'
import { atomWithReset, atomWithStorage, RESET } from 'jotai/utils'

import { todoNodeChildrenAtom, todoNodeMutations, todoNodeNodesAtom } from 'atoms/todoNode'
import { type SyncStatus } from 'components/SyncReport'
import { type TodoMetadata } from 'libs/db/todo'
import { type TodoNodeData } from 'libs/db/todoNodes'

export const todoSyncStatusAtom = atomWithReset<TodoSyncStatus>({ isLoading: false })

export const todoEditorStateAtom = atom<TodoEditorState, TodoSyncStatus>(
  (get) => {
    const state = get(todoSyncStatusAtom)
    const mutations = get(todoNodeMutations)

    return {
      ...state,
      pristine: Object.keys(mutations).length === 0,
    }
  },
  (_get, set, syncStatus: TodoSyncStatus) => {
    set(todoSyncStatusAtom, syncStatus)
  }
)

export const resetTodoAtomsAtom = atom(null, (_get, set) => {
  set(todoNodeChildrenAtom, RESET)
  set(todoNodeNodesAtom, RESET)
  set(todoNodeMutations, RESET)
  set(todoSyncStatusAtom, RESET)
})

export const todoFocusMapAtom = atomWithStorage<Record<TodoMetadata['id'], TodoNodeData['id']>>('haku.todoFocusMap', {})

export interface TodoSyncStatus extends SyncStatus {
  isLoading: boolean
}

export interface TodoEditorState extends TodoSyncStatus {
  pristine: boolean
}
