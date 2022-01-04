import create, { type SetState, type GetState } from 'zustand'

import { createModalSlice, type ModalState } from 'stores/modal'

export const useStore = create<StoreState>((set, get) => ({
  ...createModalSlice(set, get),
}))

export type StoreState = ModalState

export type StoreSlice<T> = (set: SetState<StoreState>, get: GetState<StoreState>) => T
