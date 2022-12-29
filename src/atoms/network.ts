import { atom } from 'jotai/vanilla'
import { atomWithReset } from 'jotai/vanilla/utils'

export const onlineAtom = atom<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine)

export const contentAvailableOfflineAtom = atomWithReset<boolean | undefined>(undefined)
