import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const onlineAtom = atom<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)

export const contentAvailableOfflineAtom = atomWithReset<boolean | undefined>(undefined)
