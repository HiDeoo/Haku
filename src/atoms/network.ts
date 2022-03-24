import { atom } from 'jotai'

export const onlineAtom = atom<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true)
