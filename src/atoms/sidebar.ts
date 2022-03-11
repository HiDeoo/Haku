import { atom } from 'jotai'

export const sidebarCollapsedAtom = atom(false)

export const toggleSidebarCollapsedAtom = atom(null, (_get, set) => {
  set(sidebarCollapsedAtom, (prevSidebarCollapsed) => !prevSidebarCollapsed)
})
