import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { type FileData } from 'libs/db/file'

const fileHistoryEntryLimit = 10

const localFileHistoryAtom = atomWithStorage<FileData['id'][]>('haku.fileHistory', [])

export const fileHistoryAtom = atom(
  (get) => get(localFileHistoryAtom),
  (get, set, newId: string) => {
    set(localFileHistoryAtom, [...new Set([newId, ...get(localFileHistoryAtom).slice(0, fileHistoryEntryLimit - 1)])])
  }
)
