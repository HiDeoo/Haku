import { atom } from 'jotai'
import { atomWithReset } from 'jotai/utils'

export const onlineAtom = atom<boolean>(typeof navigator === 'undefined' ? true : navigator.onLine)

export const contentAvailableOfflineAtom = atomWithReset<boolean | undefined>(undefined)
