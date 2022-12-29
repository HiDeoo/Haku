import { atomWithReset } from 'jotai/vanilla/utils'

export const deferrefPromptEventAtom = atomWithReset<BeforeInstallPromptEvent | undefined>(undefined)
