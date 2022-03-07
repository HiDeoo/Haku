import { atomWithReset } from 'jotai/utils'

export const deferrefPromptEventAtom = atomWithReset<BeforeInstallPromptEvent | undefined>(undefined)
