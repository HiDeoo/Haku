import create, { type SetState, type GetState } from 'zustand'
import { persist } from 'zustand/middleware'

import { createContentTypeSlice, type ContentTypeState } from 'stores/contentType'
import { createModalSlice, type ModalState } from 'stores/modal'

export const useStore = create<StoreState>(
  persist(
    (set, get) => ({
      ...createContentTypeSlice(set, get),
      ...createModalSlice(set, get),
    }),
    {
      name: 'haku-store',
      partialize: (state) => ({ contentType: state.contentType }),
    }
  )
)

export type StoreState = ModalState & ContentTypeState

export type StoreSlice<T> = (set: SetState<StoreState>, get: GetState<StoreState>) => T
