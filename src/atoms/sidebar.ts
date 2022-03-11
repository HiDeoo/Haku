import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const sidebarCollapsedAtom = atomWithStorage('haku.sidebarCollapsed', false)

export const toggleSidebarCollapsedAtom = atom(null, (_get, set) => {
  set(sidebarCollapsedAtom, (prevSidebarCollapsed) => !prevSidebarCollapsed)
})
