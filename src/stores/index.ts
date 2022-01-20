import create, { type SetState, type GetState } from 'zustand'
import { persist } from 'zustand/middleware'

import { createContentTypeSlice, type ContentTypeState } from 'stores/contentType'
import { createModalSlice, type ModalState } from 'stores/modal'
import { createTodoSlice, type TodoState } from 'stores/todo'

export const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      ...createContentTypeSlice(set, get),
      ...createModalSlice(set, get),
      ...createTodoSlice(set, get),
    }),
    {
      name: 'haku-store',
      partialize: (state) => ({ contentType: state.contentType }),
    }
  )
)

export type StoreState = ModalState & ContentTypeState & TodoState

export type StoreSlice<T> = (set: SetState<StoreState>, get: GetState<StoreState>) => T
